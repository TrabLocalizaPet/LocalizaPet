import { NextResponse } from "next/server";
import { z } from "zod";

import { usuario_atual } from "@/lib/auth";
import { TIPOS_DE_IMAGEM, url_assinada_para_upload } from "@/lib/r2";

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
