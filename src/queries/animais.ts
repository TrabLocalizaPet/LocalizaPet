import { consultar, obter_pool } from "@/lib/db";
import { url_publica } from "@/lib/r2";
import type {
  AnimalEmDetalhe,
  AnimalNaLista,
  AnimalNoMapa,
  NovoAnuncio,
  Situacao,
  TipoDeAnuncio,
} from "@/types/animal";

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
            v.visto_em,
            capa.url AS foto_url
       FROM animais a
       JOIN LATERAL (
            SELECT av.local, av.visto_em
              FROM avistamentos av
             WHERE av.animal_id = a.id
             ORDER BY av.visto_em DESC
             LIMIT 1
       ) v ON true
       LEFT JOIN LATERAL (
            SELECT f.url
              FROM fotos f
             WHERE f.animal_id = a.id
             ORDER BY f.ordem, f.criado_em
             LIMIT 1
       ) capa ON true
      WHERE a.situacao = 'ativo'
      ORDER BY v.visto_em DESC`,
  );
}

/**
 * Colunas do anuncio mais a coordenada do avistamento mais recente.
 *
 * `LEFT JOIN LATERAL` aqui, e nao `JOIN` como no mapa: na listagem o anuncio
 * de adocao sem local **precisa** aparecer (RN-03). No mapa ele nao entra
 * porque nao ha onde desenhar o pino.
 */
const SELECAO_DA_LISTA = `
  a.id, a.nome, a.tipo_anuncio, a.especie, a.sexo, a.porte, a.cor,
  a.idade_meses, a.criado_em,
  ST_Y(v.local::geometry) AS lat,
  ST_X(v.local::geometry) AS lng,
  v.endereco_texto,
  capa.url AS foto_url
`;

/**
 * Foto de capa: a de menor `ordem` (RNF-05).
 *
 * `LEFT JOIN LATERAL` com `LIMIT 1` em vez de trazer todas e escolher na
 * aplicacao — sao N+1 consultas evitadas numa listagem de ate 100 anuncios.
 * `LEFT` porque anuncio sem foto continua aparecendo.
 */
const FOTO_DE_CAPA = `
  LEFT JOIN LATERAL (
       SELECT f.url
         FROM fotos f
        WHERE f.animal_id = a.id
        ORDER BY f.ordem, f.criado_em
        LIMIT 1
  ) capa ON true
`;

const ULTIMO_AVISTAMENTO = `
  LEFT JOIN LATERAL (
       SELECT av.local, av.endereco_texto, av.visto_em
         FROM avistamentos av
        WHERE av.animal_id = a.id
        ORDER BY av.visto_em DESC
        LIMIT 1
  ) v ON true
`;

/**
 * Anuncios ativos, mais recentes primeiro (RF-09), com filtro por tipo
 * opcional (RF-10).
 *
 * `situacao = 'ativo'` cumpre RN-09: anuncio resolvido ou arquivado nao
 * aparece em listagem nenhuma. O `LIMIT 100` e RN-16.
 *
 * O filtro entra como parametro `$1` nulo quando ausente, em vez de montar
 * SQL diferente: uma consulta so, sem concatenacao de string, sem chance de
 * injecao.
 */
export async function listar_animais(
  tipo: TipoDeAnuncio | null = null,
): Promise<AnimalNaLista[]> {
  return consultar<AnimalNaLista>(
    `SELECT ${SELECAO_DA_LISTA}
       FROM animais a
       ${ULTIMO_AVISTAMENTO}
       ${FOTO_DE_CAPA}
      WHERE a.situacao = 'ativo'
        AND ($1::TEXT IS NULL OR a.tipo_anuncio = $1)
      ORDER BY a.criado_em DESC
      LIMIT 100`,
    [tipo],
  );
}

/**
 * Os anuncios de uma pessoa, para a tela de perfil.
 *
 * **Sem o filtro de `situacao`**, ao contrario da listagem: RN-09 esconde o
 * anuncio resolvido de quem procura, nao de quem publicou. O autor precisa
 * continuar vendo o que ja fechou — e dele o historico.
 *
 * `AnimalNaLista` traz `situacao`? Nao: a listagem publica so tem anuncio
 * ativo e nao precisaria do campo. Aqui ele e selecionado a mais, porque a
 * tela marca o que esta encerrado.
 */
export async function animais_do_autor(
  autor_id: string,
): Promise<(AnimalNaLista & { situacao: Situacao })[]> {
  return consultar<AnimalNaLista & { situacao: Situacao }>(
    `SELECT ${SELECAO_DA_LISTA},
            a.situacao
       FROM animais a
       ${ULTIMO_AVISTAMENTO}
       ${FOTO_DE_CAPA}
      WHERE a.autor_id = $1
      ORDER BY a.criado_em DESC
      LIMIT 100`,
    [autor_id],
  );
}

/**
 * Um anuncio com o contato do autor (RF-15, RF-21).
 *
 * **RN-24 acontece no `CASE` desta consulta.** O telefone so e selecionado
 * quando `telefone_publico` e verdadeiro; caso contrario o campo sai `null`
 * da API. Filtrar na tela nao cumpriria a regra, porque o dado ainda
 * viajaria na resposta e qualquer um leria.
 *
 * O e-mail do autor nao e selecionado em hipotese nenhuma (RN-25).
 *
 * Sem `situacao = 'ativo'`: o detalhe de um anuncio resolvido continua
 * acessivel por link direto — quem tem a URL de um caso encerrado deve ver
 * que ele encerrou, nao um 404.
 */
export async function buscar_animal(
  id: string,
): Promise<AnimalEmDetalhe | null> {
  const linhas = await consultar<AnimalEmDetalhe>(
    `SELECT ${SELECAO_DA_LISTA},
            a.descricao,
            a.situacao,
            v.visto_em,
            p.id   AS autor_id,
            p.nome AS autor_nome,
            CASE WHEN p.telefone_publico THEN p.telefone ELSE NULL END
                   AS autor_telefone,
            -- A galeria inteira, em ordem. Subconsulta em array em vez de
            -- JOIN: com JOIN o anuncio se repetiria uma vez por foto e a
            -- aplicacao teria de reagrupar.
            ARRAY(
              SELECT f.url FROM fotos f
               WHERE f.animal_id = a.id
               ORDER BY f.ordem, f.criado_em
            ) AS fotos
       FROM animais a
       JOIN perfis p ON p.id = a.autor_id
       ${ULTIMO_AVISTAMENTO}
       ${FOTO_DE_CAPA}
      WHERE a.id = $1`,
    [id],
  );
  return linhas[0] ?? null;
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

    // RN-34: as fotos entram na MESMA transacao do anuncio e do avistamento.
    // Gravadas depois, um erro deixaria anuncio sem as fotos que a pessoa
    // acabou de enviar, e ninguem saberia.
    //
    // `url` e `chave_r2` sao guardadas separadas de proposito: excluir o
    // objeto no R2 precisa da chave, e deriva-la da URL seria fragil se o
    // dominio publico mudar.
    for (const [ordem, chave] of dados.fotos.entries()) {
      await cliente.query(
        `INSERT INTO fotos (animal_id, url, chave_r2, ordem)
         VALUES ($1, $2, $3, $4)`,
        [id, url_publica(chave), chave, ordem],
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

/**
 * Por que a tentativa de resolver nao deu certo.
 *
 * Tres motivos diferentes, e a rota os traduz em tres codigos diferentes:
 * quem errou a URL nao recebe a mesma resposta de quem tentou fechar o
 * anuncio de outra pessoa.
 */
export type RecusaAoResolver = "inexistente" | "nao_e_seu" | "ja_encerrado";

/**
 * O autor marca o proprio anuncio como resolvido (RF-08, RN-10).
 *
 * **O `WHERE` leva o `autor_id`**, e nao so o `id`: e a propria consulta que
 * garante RN-10. Conferir o autor antes e atualizar so pelo `id` deixaria uma
 * janela entre as duas coisas, e bastaria um caminho novo chamar a funcao sem
 * a conferencia para a regra sumir.
 *
 * O `SELECT` que vem antes **nao e a guarda** — serve so para dizer qual dos
 * tres motivos recusou, porque `UPDATE` que nao acerta linha nenhuma nao
 * conta o porque. A garantia e o `WHERE` do `UPDATE`.
 *
 * `resolvido_em` entra junto por RN-08: o `CONSTRAINT resolucao_coerente`
 * recusa `situacao = 'resolvido'` sem data. A data vem do `now()` do banco, e
 * nao do relogio da funcao serverless, que e outra maquina.
 *
 * `atualizado_em` passa a ser escrito aqui. Era copia de `criado_em` em toda
 * linha (DP-01); com esta consulta ela significa algo em quem foi resolvido,
 * e continua igual a `criado_em` no resto. A decisao de DP-01 — trigger ou
 * remocao — segue aberta.
 */
export async function resolver_anuncio(
  id: string,
  autor_id: string,
): Promise<
  | { ok: true; animal: { id: string; situacao: Situacao; resolvido_em: Date } }
  | { ok: false; recusa: RecusaAoResolver }
> {
  const atual = await consultar<{ autor_id: string; situacao: Situacao }>(
    `SELECT autor_id, situacao FROM animais WHERE id = $1`,
    [id],
  );

  if (atual.length === 0) return { ok: false, recusa: "inexistente" };
  if (atual[0].autor_id !== autor_id) return { ok: false, recusa: "nao_e_seu" };
  if (atual[0].situacao !== "ativo") return { ok: false, recusa: "ja_encerrado" };

  const linhas = await consultar<{
    id: string;
    situacao: Situacao;
    resolvido_em: Date;
  }>(
    `UPDATE animais
        SET situacao      = 'resolvido',
            resolvido_em  = now(),
            atualizado_em = now()
      WHERE id = $1
        AND autor_id = $2
        AND situacao = 'ativo'
      RETURNING id, situacao, resolvido_em`,
    [id, autor_id],
  );

  // Chega aqui so se outra requisicao resolveu o mesmo anuncio no meio do
  // caminho. O `WHERE` recusou, e e o resultado certo: ja esta resolvido.
  if (linhas.length === 0) return { ok: false, recusa: "ja_encerrado" };

  return { ok: true, animal: linhas[0] };
}
