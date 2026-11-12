import type { AuthError } from "@supabase/supabase-js";

/**
 * Traducao das mensagens do Supabase Auth.
 *
 * A biblioteca devolve `error.message` **em ingles**, sempre, e nao ha opcao
 * de idioma: o texto vem do servidor de autenticacao. Mostrar `error.message`
 * direto na tela era por isso o unico lugar do aplicativo onde aparecia
 * ingles.
 *
 * O casamento e por **trecho** do texto, e nao por igualdade, porque algumas
 * mensagens carregam numero ("after 54 seconds") e porque o Supabase ja mudou
 * a redacao delas entre versoes sem mudar o codigo HTTP. Trecho curto e
 * caracteristico resiste melhor a isso que a frase inteira.
 *
 * `error.code`, quando existe, e mais estavel que o texto — vem primeiro.
 *
 * **O que nao for reconhecido vira uma frase generica em portugues**, nunca o
 * texto cru: uma mensagem nova do Supabase apareceria em ingles na cara do
 * usuario, que e exatamente o defeito que esta funcao conserta. O texto
 * original vai para o console, para quem desenvolve nao ficar sem pista.
 */

const POR_CODIGO: Record<string, string> = {
  user_already_exists: "Já existe uma conta com esse e-mail.",
  email_exists: "Já existe uma conta com esse e-mail.",
  weak_password: "Senha fraca demais. Use pelo menos 8 caracteres.",
  validation_failed: "Confira os dados preenchidos.",
  over_email_send_rate_limit:
    "Muitas tentativas seguidas. Espere um minuto e tente de novo.",
  over_request_rate_limit:
    "Muitas tentativas seguidas. Espere um minuto e tente de novo.",
  email_address_invalid: "Esse e-mail não parece válido.",
  email_not_confirmed:
    "Confirme o e-mail que enviamos antes de entrar.",
  invalid_credentials: "E-mail ou senha incorretos.",
};

const POR_TRECHO: [string, string][] = [
  ["already registered", "Já existe uma conta com esse e-mail."],
  ["already exists", "Já existe uma conta com esse e-mail."],
  ["password should be at least", "A senha precisa de pelo menos 8 caracteres."],
  ["weak password", "Senha fraca demais. Use pelo menos 8 caracteres."],
  ["requires a valid password", "Digite uma senha."],
  ["unable to validate email", "Esse e-mail não parece válido."],
  ["invalid email", "Esse e-mail não parece válido."],
  ["rate limit", "Muitas tentativas seguidas. Espere um minuto e tente de novo."],
  ["you can only request this after", "Espere alguns segundos e tente de novo."],
  ["email not confirmed", "Confirme o e-mail que enviamos antes de entrar."],
  ["invalid login credentials", "E-mail ou senha incorretos."],
  ["network", "Sem conexão com o servidor. Verifique a internet."],
  ["failed to fetch", "Sem conexão com o servidor. Verifique a internet."],
];

export function mensagem_de_auth(erro: AuthError | Error): string {
  const codigo = "code" in erro ? erro.code : undefined;
  if (codigo && POR_CODIGO[codigo]) return POR_CODIGO[codigo];

  const texto = (erro.message ?? "").toLowerCase();
  for (const [trecho, traducao] of POR_TRECHO) {
    if (texto.includes(trecho)) return traducao;
  }

  console.error("[auth] mensagem sem tradução:", erro.message, codigo ?? "");
  return "Não foi possível concluir. Tente de novo em instantes.";
}
