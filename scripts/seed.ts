import { obter_pool } from "../src/lib/db";
import { excluir_objetos } from "../src/lib/r2";

/**
 * Dados de teste (RF-33).
 *
 * Duas responsabilidades diferentes no mesmo arquivo:
 *
 * 1. O **catalogo de caracteristicas**, que nao e dado de teste — e conteudo
 *    inicial de producao (RN-19). Entra por upsert na `chave`, entao rodar o
 *    seed de novo nao duplica nem quebra os anuncios que ja usam a
 *    caracteristica (o ON DELETE RESTRICT de RN-22 proibiria apagar).
 *
 * 2. Perfis e anuncios de exemplo, para ter o que ver na tela antes de a
 *    publicacao existir. Esses sim sao descartaveis: saem e voltam a cada
 *    execucao, identificados por UUID fixo.
 *
 * So os perfis de UUID fixo abaixo sao apagados. O seed nunca da TRUNCATE —
 * apontado por engano para o banco de producao, ele nao leva nada junto.
 *
 * Roda com `npm run seed`, depois de `npm run migrate`.
 */

/** UUID fixo torna a execucao repetivel e a limpeza cirurgica. */
const PERFIS = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    nome: "Ana Administradora",
    email: "admin@localizapet.exemplo",
    telefone: "(21) 99999-0001",
    telefone_publico: true,
    papel: "admin",
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    nome: "Ricardo Franca",
    email: "ricardo@localizapet.exemplo",
    telefone: "(21) 99999-0002",
    telefone_publico: true,
    papel: "usuario",
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    nome: "Beatriz Souza",
    email: "beatriz@localizapet.exemplo",
    telefone: "(21) 99999-0003",
    // Deixado false de proposito: RN-24 so vale a pena testar se existir um
    // perfil que nao autorizou. O telefone dela nao pode sair na API.
    telefone_publico: false,
    papel: "usuario",
  },
] as const;

/**
 * Catalogo inicial (RN-19, RN-21). `especie` nula vale para todas as especies.
 */
const CARACTERISTICAS = [
  { chave: "castrado", rotulo: "Castrado", grupo: "saude", especie: null, ordem: 1 },
  { chave: "vacinado", rotulo: "Vacinado", grupo: "saude", especie: null, ordem: 2 },
  { chave: "vermifugado", rotulo: "Vermifugado", grupo: "saude", especie: null, ordem: 3 },
  { chave: "microchipado", rotulo: "Microchipado", grupo: "saude", especie: null, ordem: 4 },
  { chave: "necessidades_especiais", rotulo: "Necessidades especiais", grupo: "saude", especie: null, ordem: 5 },

  { chave: "docil", rotulo: "Docil", grupo: "temperamento", especie: null, ordem: 1 },
  { chave: "agitado", rotulo: "Agitado", grupo: "temperamento", especie: null, ordem: 2 },
  { chave: "timido", rotulo: "Timido", grupo: "temperamento", especie: null, ordem: 3 },
  { chave: "brincalhao", rotulo: "Brincalhao", grupo: "temperamento", especie: null, ordem: 4 },

  { chave: "convive_com_criancas", rotulo: "Convive com criancas", grupo: "convivencia", especie: null, ordem: 1 },
  { chave: "convive_com_caes", rotulo: "Convive com caes", grupo: "convivencia", especie: null, ordem: 2 },
  { chave: "convive_com_gatos", rotulo: "Convive com gatos", grupo: "convivencia", especie: null, ordem: 3 },
  { chave: "adestrado", rotulo: "Adestrado", grupo: "convivencia", especie: "cachorro", ordem: 4 },
] as const;

/**
 * Anuncios de exemplo, com coordenada em Niteroi para a busca por raio (F-07)
 * ter o que encontrar. `dias_atras` espalha as datas para a ordenacao da
 * listagem (RF-10) nao sair toda empatada.
 */
const ANIMAIS = [
  {
    autor: 1,
    tipo_anuncio: "perdido",
    nome: "Maggie",
    especie: "cachorro",
    sexo: "femea",
    porte: "pequeno",
    cor: "caramelo",
    idade_meses: 36,
    descricao: "Sumiu perto do campus da Praia Vermelha. Usa coleira vermelha e e muito medrosa com barulho.",
    lat: -22.9035,
    lng: -43.1245,
    endereco: "Praia Vermelha, Niteroi - RJ",
    dias_atras: 1,
    caracteristicas: [["castrado", true], ["timido", true], ["convive_com_criancas", true]],
  },
  {
    autor: 2,
    tipo_anuncio: "encontrado",
    // RN-04 em uso: quem acha um animal na rua nao sabe o nome.
    nome: null,
    especie: "gato",
    sexo: null,
    porte: "pequeno",
    cor: "preto",
    idade_meses: null,
    descricao: "Gato preto muito magro andando pelo Inga ha dois dias. Deixei agua e racao.",
    lat: -22.9110,
    lng: -43.118,
    endereco: "Inga, Niteroi - RJ",
    dias_atras: 2,
    caracteristicas: [["timido", true]],
  },
  {
    autor: 1,
    tipo_anuncio: "adocao",
    nome: "Hulk",
    especie: "cachorro",
    sexo: "macho",
    porte: "grande",
    cor: "preto",
    idade_meses: 144,
    descricao: "Idoso, calmo e ja acostumado com casa. Procura um lar tranquilo.",
    lat: -22.8955,
    lng: -43.1201,
    endereco: "Icarai, Niteroi - RJ",
    dias_atras: 5,
    caracteristicas: [["castrado", true], ["vacinado", true], ["docil", true], ["convive_com_caes", true]],
  },
  {
    autor: 2,
    tipo_anuncio: "adocao",
    nome: "Ursula",
    especie: "gato",
    sexo: "femea",
    porte: "pequeno",
    cor: "tricolor",
    idade_meses: 5,
    descricao: "Filhote resgatada no Fonseca. Brincalhona e ja usa a caixa de areia.",
    lat: -22.8843,
    lng: -43.0985,
    endereco: "Fonseca, Niteroi - RJ",
    dias_atras: 8,
    caracteristicas: [["vacinado", true], ["brincalhao", true], ["convive_com_gatos", true]],
  },
  {
    autor: 3,
    tipo_anuncio: "perdido",
    nome: "Pracinha",
    especie: "cachorro",
    sexo: "macho",
    porte: "medio",
    cor: "branco e marrom",
    idade_meses: 60,
    descricao: "Fugiu no susto do rojao. Atende pelo nome e tem uma mancha marrom no olho esquerdo.",
    lat: -22.899,
    lng: -43.133,
    endereco: "Santa Rosa, Niteroi - RJ",
    dias_atras: 12,
    caracteristicas: [["castrado", true], ["agitado", true]],
  },
  {
    // Resolvido de proposito: RN-09 so da para verificar se existir um anuncio
    // que a listagem precisa esconder.
    autor: 3,
    tipo_anuncio: "perdido",
    nome: "Amora",
    especie: "cachorro",
    sexo: "femea",
    porte: "medio",
    cor: "preto",
    idade_meses: 24,
    descricao: "Encontrada no dia seguinte, a dois quarteiroes de casa.",
    lat: -22.9152,
    lng: -43.1105,
    endereco: "Boa Viagem, Niteroi - RJ",
    dias_atras: 20,
    resolvido: true,
    caracteristicas: [["vacinado", true], ["docil", true]],
  },
] as const;

async function semear(): Promise<void> {
  const pool = obter_pool();
  const cliente = await pool.connect();
  let chaves_para_apagar: string[] = [];

  try {
    await cliente.query("BEGIN");

    const ids = PERFIS.map((perfil) => perfil.id);

    // As chaves precisam ser lidas ANTES do DELETE: o ON DELETE CASCADE leva
    // as linhas de `fotos` junto, e depois nao ha como saber quais objetos
    // ficaram orfaos no bucket.
    const fotos = await cliente.query<{ chave_r2: string }>(
      `SELECT f.chave_r2
         FROM fotos f
         JOIN animais a ON a.id = f.animal_id
        WHERE a.autor_id = ANY($1)`,
      [ids],
    );

    // Limpeza cirurgica: so os perfis de UUID fixo. O ON DELETE CASCADE leva
    // junto os anuncios, avistamentos, areas e notificacoes deles (RN-26).
    await cliente.query("DELETE FROM perfis WHERE id = ANY($1)", [ids]);

    // Guardado para depois do COMMIT: apagar no R2 antes disso arriscaria
    // remover a foto de um anuncio que a transacao ainda pode desfazer.
    chaves_para_apagar = fotos.rows.map((linha) => linha.chave_r2);

    for (const perfil of PERFIS) {
      await cliente.query(
        `INSERT INTO perfis (id, nome, email, telefone, telefone_publico, papel)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          perfil.id,
          perfil.nome,
          perfil.email,
          perfil.telefone,
          perfil.telefone_publico,
          perfil.papel,
        ],
      );
    }

    // Upsert: o catalogo nao pode ser apagado e recriado, porque
    // animal_caracteristicas o referencia com ON DELETE RESTRICT (RN-22).
    for (const caracteristica of CARACTERISTICAS) {
      await cliente.query(
        `INSERT INTO caracteristicas (chave, rotulo, grupo, especie, ordem)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (chave) DO UPDATE
            SET rotulo = EXCLUDED.rotulo,
                grupo = EXCLUDED.grupo,
                especie = EXCLUDED.especie,
                ordem = EXCLUDED.ordem`,
        [
          caracteristica.chave,
          caracteristica.rotulo,
          caracteristica.grupo,
          caracteristica.especie,
          caracteristica.ordem,
        ],
      );
    }

    for (const animal of ANIMAIS) {
      const resolvido = "resolvido" in animal && animal.resolvido;

      const inserido = await cliente.query<{ id: string }>(
        `INSERT INTO animais (
           autor_id, tipo_anuncio, nome, especie, sexo, porte, cor,
           idade_meses, descricao, situacao, resolvido_em, criado_em,
           atualizado_em
         )
         VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
           CASE WHEN $10 = 'resolvido' THEN now() ELSE NULL END,
           now() - ($11 || ' days')::INTERVAL,
           now() - ($11 || ' days')::INTERVAL
         )
         RETURNING id`,
        [
          PERFIS[animal.autor - 1].id,
          animal.tipo_anuncio,
          animal.nome,
          animal.especie,
          animal.sexo,
          animal.porte,
          animal.cor,
          animal.idade_meses,
          animal.descricao,
          resolvido ? "resolvido" : "ativo",
          String(animal.dias_atras),
        ],
      );

      const animal_id = inserido.rows[0].id;

      // RN-12: o primeiro avistamento e o local do desaparecimento. Todo
      // anuncio de exemplo nasce com o seu, senao a busca por raio (F-07) nao
      // acha nada — ela consulta avistamentos, nao animais.
      await cliente.query(
        `INSERT INTO avistamentos (animal_id, autor_id, local, endereco_texto, visto_em)
         VALUES (
           $1, $2,
           ST_SetSRID(ST_MakePoint($3, $4), 4326)::GEOGRAPHY,
           $5,
           now() - ($6 || ' days')::INTERVAL
         )`,
        [
          animal_id,
          PERFIS[animal.autor - 1].id,
          // ST_MakePoint recebe (X, Y) — longitude antes de latitude.
          animal.lng,
          animal.lat,
          animal.endereco,
          String(animal.dias_atras),
        ],
      );

      for (const [chave, valor] of animal.caracteristicas) {
        await cliente.query(
          `INSERT INTO animal_caracteristicas (animal_id, caracteristica_id, valor)
           SELECT $1, id, $3 FROM caracteristicas WHERE chave = $2`,
          [animal_id, chave, valor],
        );
      }
    }

    await cliente.query("COMMIT");

    // Depois do COMMIT, nunca antes: se a transacao tivesse sido desfeita, os
    // anuncios continuariam existindo e as fotos precisariam continuar la.
    // Falhar aqui so deixa arquivo esquecido, que e o erro barato.
    if (chaves_para_apagar.length > 0) {
      await excluir_objetos(chaves_para_apagar);
      console.log(`${chaves_para_apagar.length} foto(s) antiga(s) apagada(s) do R2.`);
    }

    console.log(
      `${PERFIS.length} perfis, ${CARACTERISTICAS.length} caracteristicas e ` +
        `${ANIMAIS.length} anuncios no banco.`,
    );
  } catch (erro) {
    await cliente.query("ROLLBACK");
    throw erro;
  } finally {
    cliente.release();
    await pool.end();
  }
}

semear().catch((erro: unknown) => {
  console.error(erro);
  process.exitCode = 1;
});
