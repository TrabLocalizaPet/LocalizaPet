"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

/**
 * Cliente do Supabase Auth no navegador (DT-07).
 *
 * Existe porque cadastro, login e logout precisam acontecer no cliente para
 * que a biblioteca grave os cookies da sessao. As duas variaveis sao
 * `NEXT_PUBLIC_` e vao para o pacote enviado ao navegador — sao publicas por
 * natureza. A chave `service_role` nunca aparece aqui.
 */
export function cliente_navegador() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

/**
 * Sair da conta e ir para `destino`.
 *
 * Estava escrito igual no cabecalho da Home e no perfil, e o cabecalho do
 * desktop seria a terceira copia. `refresh()` antes de navegar: os Server
 * Components precisam parar de enxergar o cookie que a biblioteca acabou de
 * apagar.
 */
export function useSair(destino = "/") {
  const router = useRouter();

  return async function sair() {
    await cliente_navegador().auth.signOut();
    router.refresh();
    router.push(destino);
  };
}
