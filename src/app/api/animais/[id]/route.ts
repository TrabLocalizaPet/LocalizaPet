import { NextResponse } from "next/server";
import { z } from "zod";

import { usuario_atual } from "@/lib/auth";
import { buscar_animal, resolver_anuncio } from "@/queries/animais";

/**
 * Detalhe de um anuncio (RF-15) com o contato do autor (RF-21).
 *
 * Aberta, sem sessao (RF-22): reconhecer um animal que se viu na rua nao
 * pode depender de ter conta.
 *
 * O telefone chega desta rota ja filtrado por RN-24 — a consulta so o
 * seleciona quando o autor autorizou. E-mail nao sai nunca (RN-25).
 *
 * O `id` invalido vira 404 em vez de estourar: o Postgres recusa texto que
 * nao e UUID com erro de tipo, e isso viraria 500 numa URL que qualquer um
 * pode digitar errado.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _requisicao: Request,
  contexto: { params: Promise<{ id: string }> },
) {
  const { id } = await contexto.params;

  if (!UUID.test(id)) {
    return NextResponse.json({ erro: "anuncio nao encontrado" }, { status: 404 });
  }

  const animal = await buscar_animal(id);
  if (!animal) {
    return NextResponse.json({ erro: "anuncio nao encontrado" }, { status: 404 });
  }

  return NextResponse.json(animal);
}

/**
 * O corpo do PATCH (RF-08).
 *
 * `situacao` com um valor so, e nao um booleano `resolvido`: o dominio tem
 * tres estados (RN-07) e `arquivado` existe no schema. Quando o grupo decidir
 * expor o arquivamento, entra como mais um valor aqui, e nao como outro
 * campo que contradiz o primeiro.
 */
const MudancaDeSituacao = z.object({
  situacao: z.literal("resolvido"),
});

/**
 * Resolver o proprio anuncio (RF-08, RN-10).
 *
 * Exige sessao, e o autor vem dela — nunca do corpo. As recusas sao tres
 * respostas diferentes de proposito:
 *
 * - **404** anuncio que nao existe
 * - **403** anuncio de outra pessoa
 * - **409** anuncio que ja nao esta ativo
 *
 * O 403 conta que o anuncio existe, e isso e aceitavel: a listagem (RF-09) e
 * o detalhe (RF-15) sao abertos a quem nao tem conta, entao a existencia do
 * anuncio nao e segredo nenhum. Quem e o autor continua nao saindo daqui.
 */
export async function PATCH(
  requisicao: Request,
  contexto: { params: Promise<{ id: string }> },
) {
  const { id } = await contexto.params;

  if (!UUID.test(id)) {
    return NextResponse.json({ erro: "anuncio nao encontrado" }, { status: 404 });
  }

  const usuario = await usuario_atual();
  if (!usuario) {
    return NextResponse.json(
      { erro: "e preciso estar autenticado" },
      { status: 401 },
    );
  }

  const corpo = MudancaDeSituacao.safeParse(await requisicao.json());
  if (!corpo.success) {
    return NextResponse.json(
      { erro: "dados invalidos", detalhes: z.treeifyError(corpo.error) },
      { status: 422 },
    );
  }

  const resultado = await resolver_anuncio(id, usuario.id);

  if (!resultado.ok) {
    const resposta = {
      inexistente: { erro: "anuncio nao encontrado", status: 404 },
      nao_e_seu: { erro: "so o autor pode resolver o anuncio", status: 403 },
      ja_encerrado: { erro: "este anuncio ja foi encerrado", status: 409 },
    }[resultado.recusa];

    return NextResponse.json({ erro: resposta.erro }, { status: resposta.status });
  }

  return NextResponse.json(resultado.animal);
}
