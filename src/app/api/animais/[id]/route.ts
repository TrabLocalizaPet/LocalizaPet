import { NextResponse } from "next/server";

import { buscar_animal } from "@/queries/animais";

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
