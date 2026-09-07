import { NextResponse } from "next/server";

import { animais_no_mapa } from "@/queries/animais";

/**
 * Pinos do mapa (RF-12).
 *
 * Aberta, sem sessao: RF-22 garante que visitante navega e busca sem estar
 * autenticado, e ver o mapa e justamente o que faz alguem reconhecer um
 * animal que viu na rua.
 *
 * Nao devolve contato de ninguem — o pino so tem nome, tipo, especie e
 * coordenada. Quem exibe contato e a tela de detalhe (F-06), respeitando
 * RN-24.
 */
export async function GET() {
  const animais = await animais_no_mapa();
  return NextResponse.json(animais);
}
