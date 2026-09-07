import { estado_do_schema, versao_do_banco, TABELAS_ESPERADAS } from "@/queries/diagnostico";
import { testar_bucket, nome_do_bucket } from "@/lib/r2";

/**
 * Painel de diagnostico (RF-31).
 *
 * Testa Postgres, schema e R2 **em separado**, cada um no seu try/catch: se
 * uma peca cai, as outras continuam sendo reportadas. E a primeira tela a
 * abrir quando algo nao funciona — ela diz qual peca esta fora.
 */

export const dynamic = "force-dynamic";

type Resultado = {
  titulo: string;
  ok: boolean;
  detalhe: string;
};

function mensagem_de_erro(erro: unknown): string {
  return erro instanceof Error ? erro.message : String(erro);
}

async function testar_postgres(): Promise<Resultado> {
  try {
    const { versao, agora } = await versao_do_banco();
    return {
      titulo: "Postgres",
      ok: true,
      detalhe: `${versao.split(",")[0]} — hora do banco ${agora.toISOString()}`,
    };
  } catch (erro) {
    return { titulo: "Postgres", ok: false, detalhe: mensagem_de_erro(erro) };
  }
}

async function testar_schema(): Promise<Resultado> {
  try {
    const estado = await estado_do_schema();

    if (!estado.postgis) {
      return {
        titulo: "Schema",
        ok: false,
        detalhe: "PostGIS nao esta habilitado — a busca por raio depende dele",
      };
    }

    if (estado.tabelas_faltando.length > 0) {
      return {
        titulo: "Schema",
        ok: false,
        detalhe: `faltam ${estado.tabelas_faltando.length} de ${TABELAS_ESPERADAS.length} tabelas: ${estado.tabelas_faltando.join(", ")} — rode npm run migrate`,
      };
    }

    return {
      titulo: "Schema",
      ok: true,
      detalhe: `PostGIS ${estado.postgis} — ${estado.tabelas_presentes.length} tabelas no lugar`,
    };
  } catch (erro) {
    return { titulo: "Schema", ok: false, detalhe: mensagem_de_erro(erro) };
  }
}

async function testar_r2(): Promise<Resultado> {
  try {
    const bucket = nome_do_bucket();
    await testar_bucket();
    return { titulo: "Cloudflare R2", ok: true, detalhe: `bucket ${bucket} acessivel` };
  } catch (erro) {
    return { titulo: "Cloudflare R2", ok: false, detalhe: mensagem_de_erro(erro) };
  }
}

export default async function Painel() {
  const resultados = await Promise.all([
    testar_postgres(),
    testar_schema(),
    testar_r2(),
  ]);

  const tudo_ok = resultados.every((resultado) => resultado.ok);

  return (
    <main className="painel">
      <h1>LocalizaPet</h1>
      <p className="resumo">
        Painel de diagnostico. {tudo_ok
          ? "As tres pecas responderam."
          : "Alguma peca esta fora — o detalhe esta abaixo."}
      </p>

      <ul className="testes">
        {resultados.map((resultado) => (
          <li key={resultado.titulo} className={resultado.ok ? "teste ok" : "teste erro"}>
            <span className="marca" aria-hidden="true">
              {resultado.ok ? "✓" : "✗"}
            </span>
            <div>
              <h2>{resultado.titulo}</h2>
              <p>{resultado.detalhe}</p>
            </div>
          </li>
        ))}
      </ul>

      <p className="rodape">
        Cada teste roda isolado: a falha de um nao esconde o resultado dos outros.
      </p>
    </main>
  );
}
