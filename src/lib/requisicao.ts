/**
 * Leitura do corpo das Route Handlers (RNF-08).
 *
 * `Request.json()` **lanca** quando o corpo nao e JSON — vazio, cortado no
 * meio, ou um formulario mandado por engano. Sem tratar, a excecao vira 500,
 * e um 500 diz "o servidor quebrou" quando quem errou foi a requisicao.
 *
 * Aqui o corpo ilegivel vira `null`, que nenhum schema `zod` das rotas aceita:
 * o `safeParse` recusa e a rota responde 422, como faz com qualquer outra
 * entrada invalida. A validacao continua num lugar so.
 */
export async function ler_corpo(requisicao: Request): Promise<unknown> {
  try {
    return await requisicao.json();
  } catch {
    return null;
  }
}
