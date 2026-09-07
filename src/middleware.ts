import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Renova a sessao do Supabase Auth a cada requisicao (DT-07).
 *
 * O token de acesso expira em pouco tempo. Sem esta renovacao, quem ficasse
 * um tempo com a aba aberta seria deslogado no meio do uso.
 *
 * **Este middleware nunca redireciona.** RF-22 exige que visitante sem sessao
 * navegue e busque normalmente; quem barra o que precisa de sessao e cada
 * rota, no seu proprio handler. Middleware que redireciona vira um portao
 * invisivel que ninguem lembra de conferir.
 */
export async function middleware(request: NextRequest) {
  let resposta = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Sem as variaveis nao ha o que renovar. Seguir sem sessao e melhor que
  // derrubar o site inteiro — inclusive o painel de diagnostico, que existe
  // justamente para dizer o que esta faltando.
  if (!url || !chave) return resposta;

  const supabase = createServerClient(url, chave, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(lista) {
        for (const { name, value } of lista) {
          request.cookies.set(name, value);
        }
        resposta = NextResponse.next({ request });
        for (const { name, value, options } of lista) {
          resposta.cookies.set(name, value, options);
        }
      },
    },
  });

  // A chamada em si e o efeito: `getUser` valida o token e, se estiver
  // vencido, dispara a renovacao que grava os cookies novos na resposta.
  await supabase.auth.getUser();

  return resposta;
}

export const config = {
  matcher: [
    // Tudo, menos arquivo estatico e imagem — renovar sessao em requisicao
    // de icone so gastaria chamada.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
