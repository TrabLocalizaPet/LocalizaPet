import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";

/**
 * Cliente do Supabase Auth no servidor (DT-07).
 *
 * Serve as Route Handlers e os Server Components. A sessao vive em cookie, e
 * quem a renova e o middleware — ver `src/middleware.ts`.
 *
 * Este arquivo cuida **so de identidade**. Ler e gravar dado de perfil
 * continua sendo SQL em `src/queries/`, pelo driver `pg` no pooler: o Data
 * API do projeto esta desmarcado de proposito, e o Auth nao depende dele.
 *
 * Como em `db.ts`, nada e lido em escopo de modulo — o build da Vercel
 * importa este arquivo sem as variaveis de ambiente.
 */

function configuracao(): { url: string; chave: string } {
  // Referencia literal a process.env.NEXT_PUBLIC_*: e assim que o Next
  // substitui o valor no build. Via variavel intermediaria, nao substitui.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !chave) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY nao estao definidas",
    );
  }

  return { url, chave };
}

export async function cliente_servidor() {
  const { url, chave } = configuracao();
  const armazenamento = await cookies();

  return createServerClient(url, chave, {
    cookies: {
      getAll() {
        return armazenamento.getAll();
      },
      setAll(lista) {
        try {
          for (const { name, value, options } of lista) {
            armazenamento.set(name, value, options);
          }
        } catch {
          // Server Component nao pode escrever cookie. Ignorar e seguro
          // porque o middleware ja renovou a sessao antes da renderizacao.
        }
      },
    },
  });
}

/**
 * O usuario da requisicao atual, ou `null` se nao houver sessao.
 *
 * Usa `getUser()`, que valida o token contra o provedor, e nao `getSession()`,
 * que apenas le o cookie e confia nele. No servidor a diferenca importa: o
 * cookie chega do navegador e nao serve como prova de identidade.
 *
 * Devolver `null` e um resultado normal, nao um erro — RF-22 exige que
 * visitante sem sessao navegue e busque.
 */
export async function usuario_atual(): Promise<User | null> {
  const supabase = await cliente_servidor();
  const { data, error } = await supabase.auth.getUser();

  if (error) return null;
  return data.user;
}
