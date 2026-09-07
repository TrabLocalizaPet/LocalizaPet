import { NextResponse } from "next/server";
import { z } from "zod";

import { usuario_atual } from "@/lib/auth";
import { criar_anuncio } from "@/queries/animais";

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
  );

export async function POST(requisicao: Request) {
  // Publicar exige sessao — ao contrario de ler o mapa, que e aberto (RF-22).
  const usuario = await usuario_atual();
  if (!usuario) {
    return NextResponse.json(
      { erro: "e preciso estar autenticado para publicar" },
      { status: 401 },
    );
  }

  const corpo = NovoAnuncio.safeParse(await requisicao.json());
  if (!corpo.success) {
    // 422 antes de qualquer escrita: o anuncio recusado nao chega a existir.
    return NextResponse.json(
      { erro: "dados invalidos", detalhes: z.treeifyError(corpo.error) },
      { status: 422 },
    );
  }

  // O autor sai da sessao, nunca do corpo: aceita-lo do cliente deixaria
  // qualquer pessoa publicar em nome de outra.
  const { id } = await criar_anuncio({
    ...corpo.data,
    autor_id: usuario.id,
  });

  return NextResponse.json({ id }, { status: 201 });
}
