"use client";

import { createBrowserClient } from "@supabase/ssr";

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
