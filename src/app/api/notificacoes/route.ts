import { NextResponse } from "next/server";
import { z } from "zod";

import { usuario_atual } from "@/lib/auth";
import { marcar_lidas, notificacoes_do_perfil } from "@/queries/notificacoes";

/**
 * Caixa de notificacoes (RF-25, RF-26).
 *
 * As duas rotas exigem sessao, e o dono vem **da sessao, nunca da URL**: a
 * caixa e de quem esta autenticado, e nada aqui aceita um `perfil_id` do
 * cliente.
 */

const Leitura = z.object({
  /** Ausente ou nulo marca todas — e o "marcar todas como lidas" da tela. */
  ids: z.array(z.uuid()).nonempty().nullish(),
});

function sem_sessao() {
  return NextResponse.json({ erro: "e preciso estar autenticado" }, { status: 401 });
}

export async function GET() {
  const usuario = await usuario_atual();
  if (!usuario) return sem_sessao();

  return NextResponse.json(await notificacoes_do_perfil(usuario.id));
}

export async function PATCH(requisicao: Request) {
  const usuario = await usuario_atual();
  if (!usuario) return sem_sessao();

  const corpo = Leitura.safeParse(await requisicao.json());
  if (!corpo.success) {
    return NextResponse.json(
      { erro: "dados invalidos", detalhes: z.treeifyError(corpo.error) },
      { status: 422 },
    );
  }

  const marcadas = await marcar_lidas(usuario.id, corpo.data.ids ?? null);
  return NextResponse.json({ marcadas });
}
