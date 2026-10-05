import { NextResponse } from "next/server";

import { usuario_atual } from "@/lib/auth";
import { animais_do_autor } from "@/queries/animais";

/**
 * Os anuncios de quem esta autenticado — a lista de pets da tela de perfil
 * (no 1:3350 do Figma).
 *
 * Rota separada de `GET /api/animais` de proposito. Aquela e aberta (RF-22) e
 * so devolve anuncio ativo (RN-09); esta exige sessao e devolve tambem os
 * encerrados. Misturar as duas num `?meus=1` deixaria uma rota publica com um
 * parametro que muda a regra de visibilidade — o tipo de coisa que passa
 * despercebido numa revisao.
 *
 * **O autor vem da sessao, nunca da URL.** Sem isso, trocar um id no endereco
 * mostraria o historico de outra pessoa.
 */
export async function GET() {
  const usuario = await usuario_atual();

  if (!usuario) {
    return NextResponse.json(
      { erro: "e preciso estar autenticado" },
      { status: 401 },
    );
  }

  return NextResponse.json(await animais_do_autor(usuario.id));
}
