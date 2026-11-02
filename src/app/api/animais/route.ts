import { NextResponse } from "next/server";
import { z } from "zod";

import { usuario_atual } from "@/lib/auth";
import { ler_corpo } from "@/lib/requisicao";
import { criar_anuncio, listar_animais } from "@/queries/animais";
import type { TipoDeAnuncio } from "@/types/animal";

/**
 * Publicacao de anuncio nos tres fluxos (RF-01, RF-02, RF-03).
 *
 * O tipo entra como campo, nao como rota separada: os tres fluxos
 * compartilham quase todos os campos e vivem na mesma tabela, porque a busca
 * por regiao precisa varrer os tres de uma vez.
 */

const Coordenada = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

function texto_opcional(maximo: number) {
  return z
    .string()
    .trim()
    .max(maximo)
    .nullish()
    .transform((valor) => (valor ? valor : null));
}

const NovoAnuncio = z
  .object({
    tipo_anuncio: z.enum(["perdido", "encontrado", "adocao"]), // RN-02
    nome: texto_opcional(80), // RN-04: quem acha na rua nao sabe o nome
    especie: z.enum(["cachorro", "gato", "outro"]),
    sexo: z.enum(["macho", "femea"]).nullish().transform((v) => v ?? null),
    porte: z
      .enum(["pequeno", "medio", "grande"])
      .nullish()
      .transform((v) => v ?? null),
    cor: texto_opcional(40),
    // RN-05. O mesmo intervalo do CHECK no schema — aqui para devolver 422
    // com mensagem util em vez de deixar o banco recusar com erro cru.
    idade_meses: z
      .number()
      .int()
      .min(0)
      .max(399)
      .nullish()
      .transform((v) => v ?? null),
    descricao: texto_opcional(2000),
    local: Coordenada.nullish().transform((v) => v ?? null),
    // Quando o animal foi visto no `local` — no alerta de fuga, quando
    // sumiu. ISO com fuso, porque o celular de quem publica e o banco nao
    // estao no mesmo relogio. Cinco minutos de folga no futuro cobrem
    // relogio de celular adiantado; alem disso e engano de digitacao.
    visto_em: z.iso
      .datetime({ offset: true })
      .transform((v) => new Date(v))
      .refine((d) => d.getTime() <= Date.now() + 5 * 60_000, {
        message: "a hora em que o animal foi visto nao pode estar no futuro",
      })
      .nullish()
      .transform((v) => v ?? null),
    // RN-06. A regra e de formulario, nao de schema: contar linhas no banco
    // exigiria trigger. As chaves ja foram enviadas ao R2 pelo navegador
    // (RNF-10); aqui so viram linhas em `fotos`.
    fotos: z
      .array(z.string().min(1).max(200))
      .max(6, "no maximo 6 fotos")
      .default([]),
  })
  // RN-03: perdido e encontrado exigem local. Sem coordenada o anuncio nao
  // aparece em nenhuma busca por regiao, que e a funcao central do produto.
  // Anuncio de adocao dispensa.
  .refine(
    (dados) =>
      dados.tipo_anuncio === "adocao" || dados.local !== null,
    {
      path: ["local"],
      message: "anuncio de perdido ou encontrado exige o local no mapa",
    },
  )
  // A hora pertence ao avistamento, e sem local nao ha avistamento: aceitar
  // `visto_em` sozinho seria guardar nada em silencio.
  .refine((dados) => dados.visto_em === null || dados.local !== null, {
    path: ["visto_em"],
    message: "a hora em que o animal foi visto exige o local",
  });

const TIPOS: TipoDeAnuncio[] = ["perdido", "encontrado", "adocao"];

/**
 * Listagem de anuncios ativos (RF-09), com filtro por tipo (RF-10).
 *
 * Aberta, sem sessao (RF-22). Nao devolve e-mail de ninguem, e o telefone
 * so aparece na tela de detalhe, filtrado por RN-24.
 *
 * `?tipo=` desconhecido e tratado como ausente, nao como erro: o parametro
 * vem da URL, que qualquer um edita, e uma listagem completa e uma resposta
 * mais util que um 400 para quem so errou a digitacao.
 */
export async function GET(requisicao: Request) {
  const pedido = new URL(requisicao.url).searchParams.get("tipo");
  const tipo = TIPOS.includes(pedido as TipoDeAnuncio)
    ? (pedido as TipoDeAnuncio)
    : null;

  return NextResponse.json(await listar_animais(tipo));
}

export async function POST(requisicao: Request) {
  // Publicar exige sessao — ao contrario de ler o mapa, que e aberto (RF-22).
  const usuario = await usuario_atual();
  if (!usuario) {
    return NextResponse.json(
      { erro: "e preciso estar autenticado para publicar" },
      { status: 401 },
    );
  }

  const corpo = NovoAnuncio.safeParse(await ler_corpo(requisicao));
  if (!corpo.success) {
    // 422 antes de qualquer escrita: o anuncio recusado nao chega a existir.
    return NextResponse.json(
      { erro: "dados invalidos", detalhes: z.treeifyError(corpo.error) },
      { status: 422 },
    );
  }

  // A foto precisa ser de quem publica. A chave de upload leva o id do autor
  // no caminho (`url_assinada_para_upload`), e e a mesma trava do DELETE de
  // `/api/uploads`: sem ela, quem descobrisse a chave de um envio alheio
  // ainda nao publicado poderia anexa-lo ao proprio anuncio — e a dona nao
  // conseguiria mais apaga-lo, porque a chave passaria a constar em `fotos`.
  const prefixo = `animais/${usuario.id}/`;
  if (corpo.data.fotos.some((chave) => !chave.startsWith(prefixo))) {
    return NextResponse.json(
      { erro: "alguma das fotos nao foi enviada por voce" },
      { status: 403 },
    );
  }

  try {
    // O autor sai da sessao, nunca do corpo: aceita-lo do cliente deixaria
    // qualquer pessoa publicar em nome de outra.
    const { id } = await criar_anuncio({
      ...corpo.data,
      autor_id: usuario.id,
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch (erro) {
    // Conta no provedor sem perfil no banco: o cadastro parou entre os dois
    // passos (com "Confirm email" ligado, e o caminho normal ate o primeiro
    // acesso a /perfil). A FK `animais.autor_id -> perfis` recusa, e isso e
    // um estado da conta, nao defeito do servidor — 409, com o que fazer.
    if (sem_perfil(erro)) {
      return NextResponse.json(
        { erro: "complete o seu perfil antes de publicar" },
        { status: 409 },
      );
    }
    throw erro;
  }
}

/** A FK do autor recusou o anuncio? Codigo 23503 e `foreign_key_violation`. */
function sem_perfil(erro: unknown): boolean {
  return (
    typeof erro === "object" &&
    erro !== null &&
    "code" in erro &&
    erro.code === "23503" &&
    "constraint" in erro &&
    erro.constraint === "animais_autor_id_fkey"
  );
}
