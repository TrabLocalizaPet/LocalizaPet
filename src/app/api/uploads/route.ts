import { NextResponse } from "next/server";
import { z } from "zod";

import { usuario_atual } from "@/lib/auth";
import {
  TIPOS_DE_IMAGEM,
  excluir_objetos,
  url_assinada_para_upload,
} from "@/lib/r2";
import { chave_publicada } from "@/queries/fotos";

/**
 * URL assinada para enviar foto (RF-05, RNF-10).
 *
 * O navegador pede a URL aqui e faz o `PUT` direto no R2. O arquivo **nunca
 * passa pelo servidor** — alem de economizar, evita o limite de tamanho do
 * corpo de requisicao da funcao serverless, que uma foto de celular estoura.
 *
 * Exige sessao: URL assinada e permissao de escrita no bucket, e nao se
 * distribui a quem nao esta identificado.
 *
 * A chave do objeto e gerada no servidor, com o id do autor no caminho. Se
 * viesse do cliente, alguem poderia pedir uma URL para sobrescrever a foto
 * de outra pessoa.
 */

const Pedido = z.object({
  tipo: z.enum(TIPOS_DE_IMAGEM),
});

export async function POST(requisicao: Request) {
  const usuario = await usuario_atual();
  if (!usuario) {
    return NextResponse.json(
      { erro: "e preciso estar autenticado para enviar foto" },
      { status: 401 },
    );
  }

  const corpo = Pedido.safeParse(await requisicao.json());
  if (!corpo.success) {
    return NextResponse.json(
      { erro: "formato de imagem nao aceito", detalhes: z.treeifyError(corpo.error) },
      { status: 422 },
    );
  }

  const { url, chave } = await url_assinada_para_upload(
    usuario.id,
    corpo.data.tipo,
  );

  return NextResponse.json({ url, chave });
}

/**
 * Apaga uma foto que ainda **nao** foi publicada (RF-05).
 *
 * Quem tira uma foto do formulario antes de enviar o anuncio esperaria que
 * ela sumisse — manter o arquivo no bucket seria guardar algo que a pessoa
 * pediu para descartar.
 *
 * Duas travas, e as duas importam:
 *
 * 1. **A chave precisa comecar com `animais/<id da sessao>/`.** E o mesmo
 *    caminho que `url_assinada_para_upload` gera, e e o que impede alguem de
 *    pedir a exclusao do arquivo de outra pessoa.
 * 2. **A chave nao pode estar em `fotos`.** Enquanto o arquivo esta so no
 *    formulario, apagar e limpeza; depois de publicado, seria destruir a foto
 *    de um anuncio no ar — e ai a exclusao tem de vir junto com a do anuncio,
 *    nunca sozinha.
 */
const Exclusao = z.object({
  chave: z.string().min(1).max(200),
});

export async function DELETE(requisicao: Request) {
  const usuario = await usuario_atual();
  if (!usuario) {
    return NextResponse.json({ erro: "e preciso estar autenticado" }, { status: 401 });
  }

  const corpo = Exclusao.safeParse(await requisicao.json());
  if (!corpo.success) {
    return NextResponse.json({ erro: "chave invalida" }, { status: 422 });
  }

  const { chave } = corpo.data;

  if (!chave.startsWith(`animais/${usuario.id}/`)) {
    // 403 e nao 404: a chave existe, so nao e desta pessoa.
    return NextResponse.json({ erro: "esta foto nao e sua" }, { status: 403 });
  }

  if (await chave_publicada(chave)) {
    return NextResponse.json(
      { erro: "foto ja publicada; exclua o anuncio" },
      { status: 409 },
    );
  }

  await excluir_objetos([chave]);
  return new NextResponse(null, { status: 204 });
}
