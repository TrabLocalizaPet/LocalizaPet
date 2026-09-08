import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import { obter_pool } from "../src/lib/db";

/**
 * Runner de migrations (RF-32, RN-35).
 *
 * Aplica em ordem os arquivos de `migrations/` que ainda nao foram aplicados,
 * cada um dentro da propria transacao. O que ja rodou fica registrado na
 * tabela `_migrations`, entao rodar duas vezes nao repete nada.
 *
 * Nao roda no deploy da Vercel: e executado a mao com `npm run migrate`.
 *
 * O SQL daqui e de infraestrutura, nao de aplicacao — por isso vive fora de
 * `src/queries/`. O SQL do schema em si esta nos arquivos de `migrations/`.
 */

const PASTA_MIGRATIONS = join(process.cwd(), "migrations");

async function listar_arquivos(): Promise<string[]> {
  const arquivos = await readdir(PASTA_MIGRATIONS);
  // Ordem alfabetica resolve a sequencia porque o prefixo e numerico e
  // preenchido com zeros: 001_, 002_, ... 010_.
  return arquivos.filter((nome) => nome.endsWith(".sql")).sort();
}

/**
 * De qual banco e esta conexao.
 *
 * Impresso antes de qualquer coisa porque migration se aplica duas vezes, em
 * bancos diferentes (DT-06), e nao ha como desfazer a que foi no alvo errado.
 * Ver o host antes de o comando agir e a unica defesa barata contra isso.
 *
 * So o host e o usuario: a senha esta na mesma string e nao pode aparecer no
 * terminal, que costuma ir parar em print de tela.
 */
function alvo(): string {
  const url = process.env.DATABASE_URL;
  if (!url) return "(DATABASE_URL nao definida)";

  try {
    const { hostname, port, username, pathname } = new URL(url);
    return `${username}@${hostname}:${port}${pathname}`;
  } catch {
    return "(DATABASE_URL mal formada)";
  }
}

async function migrar(): Promise<void> {
  console.log(`banco: ${alvo()}\n`);

  const pool = obter_pool();
  const cliente = await pool.connect();

  try {
    await cliente.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        nome TEXT PRIMARY KEY,
        aplicada_em TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    const aplicadas = await cliente.query<{ nome: string }>(
      "SELECT nome FROM _migrations",
    );
    const ja_aplicadas = new Set(aplicadas.rows.map((linha) => linha.nome));

    const arquivos = await listar_arquivos();
    const pendentes = arquivos.filter((nome) => !ja_aplicadas.has(nome));

    if (pendentes.length === 0) {
      console.log(`Nada a aplicar — ${arquivos.length} migration(s) em dia.`);
      return;
    }

    for (const nome of pendentes) {
      const sql = await readFile(join(PASTA_MIGRATIONS, nome), "utf8");

      // Transacao por migration (RN-35): se o arquivo falhar no meio, o banco
      // volta ao estado anterior e `_migrations` nao registra nada. Sem isso um
      // erro deixaria metade do schema criado e a migration marcada como
      // pendente, que e o pior dos dois mundos.
      await cliente.query("BEGIN");
      try {
        await cliente.query(sql);
        await cliente.query("INSERT INTO _migrations (nome) VALUES ($1)", [
          nome,
        ]);
        await cliente.query("COMMIT");
        console.log(`aplicada  ${nome}`);
      } catch (erro) {
        await cliente.query("ROLLBACK");
        console.error(`falhou    ${nome}`);
        throw erro;
      }
    }

    console.log(`${pendentes.length} migration(s) aplicada(s).`);
  } finally {
    cliente.release();
    await pool.end();
  }
}

migrar().catch((erro: unknown) => {
  console.error(erro);
  process.exitCode = 1;
});
