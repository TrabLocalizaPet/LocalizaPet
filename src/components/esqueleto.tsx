import { classes } from "./ui/classes";

/**
 * Esqueletos de carregamento.
 *
 * Substituem o "Carregando..." solto no topo da tela. O texto dizia que algo
 * vinha, mas nao o que nem onde, e quando a lista chegava a tela inteira
 * pulava. O esqueleto ja tem a forma do que vai aparecer — o mesmo cartao de
 * 326x230, a mesma foto do detalhe —, entao o conteudo entra no lugar em vez
 * de empurrar o resto.
 *
 * Cor creme da marca, e nao cinza: e o mesmo fundo que o cartao sem foto ja
 * usa, entao o esqueleto parece o app, nao um bloco estranho.
 *
 * `motion-safe:` porque o pulsar e movimento; quem pediu ao sistema menos
 * animacao ve o bloco parado. `aria-hidden` nas pecas e um texto so para
 * leitor de tela no conjunto: "carregando" uma vez, e nao doze retangulos
 * vazios.
 */
export function Esqueleto({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={classes(
        "block rounded-[--radius-padrao] bg-creme motion-safe:animate-pulse",
        className,
      )}
    />
  );
}

/** Aviso para leitor de tela; o resto do esqueleto e invisivel para ele. */
function Anuncio({ texto }: { texto: string }) {
  return (
    <span role="status" className="sr-only">
      {texto}
    </span>
  );
}

/** A grade da Home, com o mesmo numero de colunas da lista de verdade. */
export function EsqueletoDeCartoes({ quantidade = 6 }: { quantidade?: number }) {
  return (
    <>
      <Anuncio texto="Carregando anúncios" />
      <ul aria-hidden="true" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: quantidade }, (_, i) => (
          <li key={i} className="relative">
            <Esqueleto className="aspect-[326/230] rounded-2xl" />
            {/* Nome e linha de local, na posicao do cartao (16 px da borda). */}
            <span className="absolute inset-x-4 bottom-4 grid gap-2">
              <span className="block h-4 w-1/3 rounded bg-white/70" />
              <span className="block h-3 w-2/3 rounded bg-white/50" />
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * O detalhe do anuncio, com as mesmas classes de layout da tela: foto em
 * 390x520 no celular, duas colunas a partir de `md`.
 */
export function EsqueletoDoDetalhe() {
  return (
    <main className="mx-auto w-full max-w-md pb-8 md:grid md:max-w-4xl md:grid-cols-2 md:items-start md:gap-8 md:px-5 md:py-8 lg:gap-10">
      <Anuncio texto="Carregando o anúncio" />
      <Esqueleto className="aspect-[390/520] w-full rounded-none rounded-b-[48px] md:aspect-auto md:h-[calc(100dvh-14rem)] md:min-h-80 md:rounded-[32px]" />

      <div className="grid gap-3 px-6 pt-16 md:px-0 md:pt-0">
        <Esqueleto className="h-8 w-2/3" />
        <Esqueleto className="h-4 w-1/2" />
        <Esqueleto className="h-4 w-3/5" />
        <Esqueleto className="mt-3 h-16 w-full" />
        <Esqueleto className="mt-3 h-7 w-2/5" />
        <Esqueleto className="aspect-[342/239] w-full" />
      </div>
    </main>
  );
}

/**
 * Lista de linhas — a caixa de notificacoes e os pets do perfil. `circulo`
 * poe a foto redonda de 48 do perfil na frente de cada linha.
 */
export function EsqueletoDeLista({
  linhas = 4,
  circulo = false,
  texto,
}: {
  linhas?: number;
  circulo?: boolean;
  texto: string;
}) {
  return (
    <>
      <Anuncio texto={texto} />
      <ul aria-hidden="true" className="mt-4 grid gap-3">
        {Array.from({ length: linhas }, (_, i) => (
          <li key={i} className="flex items-center gap-3">
            {circulo && <Esqueleto className="size-12 shrink-0 rounded-full" />}
            <span className="grid flex-1 gap-2">
              <Esqueleto className="h-4 w-3/5" />
              <Esqueleto className="h-3 w-2/5" />
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

/** O topo do perfil: foto redonda de 96, nome e contagem. */
export function EsqueletoDoPerfil() {
  return (
    <div className="mt-6 flex flex-col items-center gap-3 md:mt-0">
      <Esqueleto className="size-24 rounded-full" />
      <Esqueleto className="h-7 w-40" />
      <Esqueleto className="h-4 w-16" />
    </div>
  );
}
