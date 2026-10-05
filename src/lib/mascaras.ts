/**
 * Mascaras e validacao de formato dos campos de formulario (RNF-08, RNF-11).
 *
 * **Mascara e formatacao, nao regra de negocio.** O que o banco garante
 * continua garantido no banco (o `CHECK nascimento_plausivel` da `002_`); o
 * que a rota recusa continua recusado na rota. O que mora aqui e o formato
 * que a pessoa ve enquanto digita, e as funcoes que a rota e a tela usam
 * para concordar sobre esse formato.
 *
 * As funcoes recebem e devolvem **string**, nunca evento de teclado: assim
 * servem igual na tela, na rota e num script de migracao de dados.
 */

/** Tudo que nao e digito sai. Base de toda mascara daqui. */
export function apenas_digitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

/**
 * Telefone brasileiro, celular ou fixo: `(21) 99999-9999` e `(21) 9999-9999`.
 *
 * Progressiva de proposito — formata o que ja foi digitado em vez de esperar
 * o numero inteiro. Quem digita `21` ve `(21`, e o parenteso que falta
 * aparece junto com o digito seguinte.
 *
 * **O nono digito decide onde fica o hifen.** Com 11 digitos o grupo e
 * 5+4 (celular); com 10, 4+4 (fixo). Decidir pelo total digitado, e nao por
 * um formato fixo, e o que faz o campo aceitar os dois sem a pessoa escolher
 * antes.
 *
 * **Colar com o codigo do pais funciona.** `+55 21 99999-0001` chega aqui
 * com 13 digitos; cortar os 11 primeiros daria `(55) 21999-9900`, que e
 * outro numero. Por isso o `55` da frente sai antes do corte. O excesso que
 * sobra depois disso e descartado.
 */
export function mascara_telefone(valor: string): string {
  const cru = apenas_digitos(valor);
  const sem_pais = /^55\d{10,11}$/.test(cru) ? cru.slice(2) : cru;
  const digitos = sem_pais.slice(0, 11);

  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;

  const corte = digitos.length > 10 ? 7 : 6;
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, corte)}-${digitos.slice(corte)}`;
}

/**
 * O formato que a rota aceita — o mesmo que a mascara produz.
 *
 * A rota valida com isto, e nao com "tem 10 ou 11 digitos", porque o banco
 * guarda o telefone **formatado** (e o que o `scripts/seed.ts` grava desde a
 * F-02). Aceitar digito cru na API criaria duas convencoes na mesma coluna.
 */
export const FORMATO_TELEFONE = /^\(\d{2}\) \d{4,5}-\d{4}$/;

/** O numero esta completo? E o que habilita o botao "Proximo" do cadastro. */
export function telefone_completo(valor: string): boolean {
  return FORMATO_TELEFONE.test(valor);
}

/**
 * Data de nascimento em `AAAA-MM-DD`, ou `null` se os tres campos nao
 * formarem uma data que existe.
 *
 * O cadastro do Figma pergunta dia, mes e ano em **tres campos separados**,
 * e tres campos separados aceitam 31/02. A checagem e por reconstrucao: a
 * data e montada e depois comparada com o que o `Date` entendeu. Se o mes
 * mudou, o dia nao existia naquele mes — e 31/02 vira 03/03 em silencio.
 *
 * A faixa repete o `CHECK nascimento_plausivel` da `002_` de proposito: aqui
 * para dizer o que esta errado antes de enviar, e la para garantir.
 */
export function data_de_nascimento(
  dia: string,
  mes: string,
  ano: string,
): string | null {
  if (dia === "" || mes === "" || ano.length !== 4) return null;

  const d = Number(dia);
  const m = Number(mes);
  const a = Number(ano);

  if (m < 1 || m > 12 || d < 1 || d > 31) return null;

  // `Date.UTC` e nao `new Date(a, m - 1, d)`: o construtor local desloca a
  // data conforme o fuso de quem abre o aplicativo, e dia de nascimento nao
  // tem fuso (e a razao de a coluna ser `DATE`).
  const quando = new Date(Date.UTC(a, m - 1, d));

  if (quando.getUTCFullYear() !== a) return null;
  if (quando.getUTCMonth() !== m - 1) return null;
  if (quando.getUTCDate() !== d) return null;

  const iso = quando.toISOString().slice(0, 10);
  const hoje = new Date().toISOString().slice(0, 10);

  if (iso <= "1900-01-01" || iso > hoje) return null;

  return iso;
}

/**
 * Limita o que se digita num campo numerico curto (dia, mes, ano).
 *
 * Nao e mascara de uma data inteira: sao tres campos no desenho, e cada um
 * so precisa recusar letra e parar no comprimento certo.
 */
export function digitos_ate(valor: string, tamanho: number): string {
  return apenas_digitos(valor).slice(0, tamanho);
}

/**
 * O e-mail esta escrito de um jeito plausivel?
 *
 * **Nao diz que o endereco existe** — isso so o e-mail de confirmacao
 * responde. Serve para pegar o erro de digitacao na hora em que a pessoa
 * digita, em vez de deixar a conta ser criada e a confirmacao nunca chegar.
 *
 * A regra aceita o que o Supabase aceita e recusa o que ele recusaria: um
 * arroba, texto dos dois lados, um ponto no dominio e duas letras no fim.
 * Nada de espaco. Nao tenta cobrir a RFC inteira de proposito — validador de
 * e-mail ambicioso erra recusando endereco valido, que e o erro caro.
 */
export function email_plausivel(valor: string): boolean {
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-z]{2,}$/i.test(valor.trim());
}
