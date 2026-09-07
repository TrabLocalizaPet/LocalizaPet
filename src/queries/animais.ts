import { consultar, obter_pool } from "@/lib/db";
import type { AnimalNoMapa, NovoAnuncio } from "@/types/animal";

/**
 * Consultas de animais (RF-12).
 *
 * Todo SQL do projeto mora aqui.
 */

/**
 * Os anuncios ativos que tem coordenada, para desenhar os pinos (RF-12).
 *
 * Tres decisoes nesta consulta:
 *
 * **`LEFT JOIN LATERAL` com `LIMIT 1`** pega o avistamento mais recente de
 * cada animal (RN-14, RNF-05). O animal se move: guardar um unico local no
 * anuncio perderia o rastro, e o pino tem de estar onde ele foi visto por
 * ultimo, nao onde sumiu.
 *
 * **`ST_Y` e `ST_X` sobre `::geometry`** convertem a `GEOGRAPHY` de volta em
 * numeros. Repare na ordem: `ST_X` e a longitude e `ST_Y` e a latitude — o
 * PostGIS trabalha em (X, Y), o mapa fala (lat, lng), e trocar os dois poe o
 * pino no oceano sem erro nenhum.
 *
 * **`JOIN`, nao `LEFT JOIN`, no resultado lateral**: anuncio de adocao pode
 * nao ter local (RN-03), e sem coordenada nao ha pino para desenhar.
 *
 * `situacao = 'ativo'` cumpre RN-09 e usa o indice parcial `idx_animais_tipo`.
 */
export async function animais_no_mapa(): Promise<AnimalNoMapa[]> {
  return consultar<AnimalNoMapa>(
    `SELECT a.id,
            a.nome,
            a.tipo_anuncio,
            a.especie,
            ST_Y(v.local::geometry) AS lat,
            ST_X(v.local::geometry) AS lng,
            v.visto_em
       FROM animais a
       JOIN LATERAL (
            SELECT av.local, av.visto_em
              FROM avistamentos av
             WHERE av.animal_id = a.id
             ORDER BY av.visto_em DESC
             LIMIT 1
       ) v ON true
      WHERE a.situacao = 'ativo'
      ORDER BY v.visto_em DESC`,
  );
}

/** Tipos de anuncio que nao existem sem local (RN-03). */
const EXIGEM_LOCAL = new Set(["perdido", "encontrado"]);

/**
 * Cria o anuncio e o primeiro avistamento **na mesma transacao** (RN-34).
 *
 * A atomicidade nao e detalhe de implementacao, e a regra: anuncio de
 * perdido gravado sem local nao aparece em busca por regiao (RN-03) e fica
 * inutil no banco, sem ninguem perceber. Ou entram os dois, ou nao entra
 * nada.
 *
 * Por isso aqui se usa um cliente proprio do pool, e nao o atalho
 * `consultar`: cada chamada dele pega uma conexao qualquer, e `BEGIN` numa
 * conexao com `INSERT` em outra nao forma transacao nenhuma.
 *
 * O avistamento gravado e o **primeiro** (RN-12) — o local onde o animal
 * sumiu ou foi achado. Os seguintes sao relatos de terceiros e chegam na
 * F-13.
 */
export async function criar_anuncio(dados: NovoAnuncio): Promise<{ id: string }> {
  // Segunda guarda de RN-03. A primeira e o zod na entrada da rota, que
  // devolve 422 com mensagem util; esta existe porque a funcao e exportada e
  // vai ganhar outros chamadores. Dentro da transacao, falhar aqui nao deixa
  // rastro.
  if (EXIGEM_LOCAL.has(dados.tipo_anuncio) && !dados.local) {
    throw new Error(`anuncio de ${dados.tipo_anuncio} exige local (RN-03)`);
  }

  const cliente = await obter_pool().connect();

  try {
    await cliente.query("BEGIN");

    const anuncio = await cliente.query<{ id: string }>(
      `INSERT INTO animais (
         autor_id, tipo_anuncio, nome, especie, sexo, porte, cor,
         idade_meses, descricao
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        dados.autor_id,
        dados.tipo_anuncio,
        dados.nome,
        dados.especie,
        dados.sexo,
        dados.porte,
        dados.cor,
        dados.idade_meses,
        dados.descricao,
      ],
    );

    const id = anuncio.rows[0].id;

    if (dados.local) {
      await cliente.query(
        `INSERT INTO avistamentos (animal_id, autor_id, local)
         VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326)::GEOGRAPHY)`,
        // ST_MakePoint recebe (X, Y): longitude antes de latitude. Trocar os
        // dois poe o anuncio no oceano sem erro nenhum.
        [id, dados.autor_id, dados.local.lng, dados.local.lat],
      );
    }

    await cliente.query("COMMIT");
    return { id };
  } catch (erro) {
    await cliente.query("ROLLBACK");
    throw erro;
  } finally {
    cliente.release();
  }
}
