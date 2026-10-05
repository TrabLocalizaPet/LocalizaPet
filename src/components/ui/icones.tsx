import type { SVGProps } from "react";

/**
 * Icones da barra de navegacao.
 *
 * A geometria e **exportada do Figma**, nao desenhada aqui — cada icone traz
 * o no de origem e o nome que ele tem no desenho. O que mudou em relacao ao
 * arquivo exportado foi so a cor, trocada por `currentColor`: o export do
 * Figma vem com a cor do estado em que o icone estava na tela (o "Inicio"
 * saiu laranja porque era a aba ativa), e a barra precisa dos dois estados.
 *
 * Vem inline, e nao como arquivo em `public/`, por duas razoes: `currentColor`
 * so funciona com o SVG no documento, e assim nao ha uma requisicao por icone
 * em cada carregamento.
 */

type Props = SVGProps<SVGSVGElement>;

/** `ic:baseline-home` — no 1:3328. */
export function IconeInicio(props: Props) {
  return (
    <svg viewBox="0 0 20.8 17.6538" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M8.32 17.6538V11.4231H12.48V17.6538H17.68V9.34615H20.8L10.4 0L0 9.34615H3.12V17.6538H8.32Z" />
    </svg>
  );
}

/** `ic:twotone-search` — no 1:3332. */
export function IconeBuscar(props: Props) {
  return (
    <svg viewBox="0 0 18.1896 18.1627" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M13 11.4231H12.1784L11.8872 11.1427C12.9416 9.92149 13.5211 8.36242 13.52 6.75C13.52 5.41498 13.1235 4.10994 12.3807 2.9999C11.6379 1.88987 10.5822 1.02471 9.34694 0.513816C8.11171 0.00292467 6.7525 -0.130748 5.44119 0.129702C4.12988 0.390153 2.92536 1.03303 1.97996 1.97703C1.03456 2.92104 0.390731 4.12377 0.129895 5.43314C-0.130942 6.74251 0.002929 8.09971 0.514577 9.33312C1.02623 10.5665 1.89267 11.6207 3.00435 12.3624C4.11602 13.1041 5.423 13.5 6.76 13.5C8.4344 13.5 9.9736 12.8873 11.1592 11.8696L11.44 12.1604V12.9808L16.64 18.1627L18.1896 16.6154L13 11.4231ZM6.76 11.4231C4.1704 11.4231 2.08 9.33577 2.08 6.75C2.08 4.16423 4.1704 2.07693 6.76 2.07693C9.3496 2.07693 11.44 4.16423 11.44 6.75C11.44 9.33577 9.3496 11.4231 6.76 11.4231Z" />
    </svg>
  );
}

/** `user` — no 1:3336. Sao dois tracos: o ombro e a cabeca. */
export function IconePerfil(props: Props) {
  return (
    <svg
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M15.75 15.5C15.2746 6.16667 1.2254 6.16667 0.75 15.5" />
      <circle cx="8.25" cy="4.5" r="3" />
    </svg>
  );
}

/**
 * Pata do botao central — no 1:3318, chamado "Central Pet" no Figma.
 *
 * Este mantem as cores do desenho: nao e um icone de estado, e um distintivo
 * — circulo laranja com a pata branca. Por isso nao usa `currentColor`.
 */
export function IconePata(props: Props) {
  return (
    <svg viewBox="0 0 66.56 66.4615" fill="none" aria-hidden="true" {...props}>
      <ellipse cx="33.28" cy="33.2308" rx="33.28" ry="33.2308" fill="#F68B1E" />
      <g fill="#fff">
        <path d="M30.1074 31.4467C29.0785 32.3139 28.5115 33.6027 27.5725 34.6256C26.2459 36.1126 24.2086 36.9174 22.875 38.4302C22.036 39.4568 21.5244 40.7116 21.4064 42.0322C21.2884 43.3528 21.5695 44.6784 22.2132 45.8375C22.8758 46.9747 23.8217 47.9208 24.9588 48.5836C26.0959 49.2463 27.3853 49.6032 28.7013 49.6193C30.5429 49.6486 32.3427 49.265 34.1795 49.2862C35.8426 49.3093 37.4163 49.821 39.125 49.5446C40.7044 49.3234 42.1474 48.5292 43.1793 47.3132C43.8159 46.5546 44.1984 45.6153 44.2729 44.6278C44.4395 43.0239 44.4371 40.6544 43.4803 39.262C42.5235 37.8697 41.1843 37.31 40.0252 36.3622C38.89 35.2312 37.8698 33.9903 36.9796 32.6578C35.2655 30.6539 32.3827 29.5213 30.1074 31.4467Z" />
        <path d="M23.651 34.2673C23.9617 33.8916 24.2425 33.4921 24.4907 33.0724C24.8206 32.5498 24.992 31.9429 24.9843 31.325C24.9765 30.707 24.7899 30.1046 24.447 29.5905C23.8844 28.6163 23.1597 27.7452 22.3043 27.0146C21.6747 26.437 20.9581 25.9621 20.1808 25.6075C19.928 25.4889 19.6522 25.4278 19.373 25.4284C19.0938 25.4291 18.8182 25.4915 18.566 25.6112C18.2408 25.8434 17.9718 26.1455 17.7786 26.4953C17.5854 26.845 17.473 27.2335 17.4495 27.6324C17.2307 28.8488 17.2109 30.0927 17.3907 31.3154C17.5124 32.3164 17.8769 33.2724 18.4523 34.1004C18.7403 34.5129 19.1188 34.8542 19.5588 35.0981C19.9988 35.3421 20.4888 35.4823 20.9912 35.508C21.9083 35.4947 22.7843 35.126 23.4348 34.4796L23.651 34.2673Z" />
        <path d="M23.9197 21.7884C23.8876 19.8404 24.432 17.9637 26.2436 17.0707C28.3786 16.0566 30.2895 18.231 30.9735 20.0212C31.8199 21.9621 31.983 24.1327 31.4363 26.1783C30.5567 28.6855 27.9902 29.0091 26.1249 27.311C24.7021 25.8254 23.9115 23.8455 23.9197 21.7884Z" />
        <path d="M42.5431 34.384C42.2161 34.0423 41.9214 33.6712 41.6626 33.2754C41.2926 32.7804 41.0753 32.1881 41.0376 31.5713C40.9998 30.9544 41.1431 30.34 41.45 29.8036C41.9353 28.7864 42.5891 27.8586 43.3836 27.0593C43.9507 26.429 44.6176 25.8964 45.3577 25.4826C45.6 25.3464 45.8693 25.2653 46.1465 25.245C46.4237 25.2247 46.7019 25.2657 46.9615 25.3651C47.3026 25.5712 47.5932 25.8511 47.812 26.1842C48.0308 26.5173 48.1722 26.8952 48.2258 27.2901C48.5213 28.4854 48.6184 29.7212 48.5132 30.9481C48.4684 31.9571 48.1766 32.9397 47.6633 33.8096C47.4051 34.2404 47.0525 34.6071 46.6322 34.882C46.2118 35.1569 45.7345 35.3328 45.2363 35.3966C44.3196 35.4461 43.4191 35.1403 42.7222 34.5428L42.5431 34.384Z" />
        <path d="M41.8747 21.5501C41.7581 19.6072 41.054 17.7631 39.1741 17.0238C36.9578 16.1183 35.2258 18.5495 34.687 20.3792C34.0255 22.3907 34.065 24.5669 34.799 26.5531C35.8813 28.9764 38.4579 29.1058 40.1819 27.2473C41.4689 25.6424 42.0766 23.5974 41.8747 21.5501Z" />
      </g>
    </svg>
  );
}

/**
 * `arrow-left` — no 1:826, o botao de voltar das telas de Login.
 *
 * Desenhado com as proporcoes do quadro de 24x24 do desenho. E o unico icone
 * aqui que nao veio do export: o no e uma instancia de componente e a
 * exportacao exigiria uma chamada a mais ao Figma, que esta no limite. Se
 * divergir, substituir pelo asset.
 */
export function SetaVoltar(props: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

/**
 * `Vector` do no 1:473 — o certo dentro do circulo, do item selecionado da
 * lista de opcoes do cadastro.
 */
export function IconeMarcado(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 0C5.376 0 0 5.376 0 12C0 18.624 5.376 24 12 24C18.624 24 24 18.624 24 12C24 5.376 18.624 0 12 0ZM9.6 18L3.6 12L5.292 10.308L9.6 14.604L18.708 5.496L20.4 7.2L9.6 18Z" />
    </svg>
  );
}

/** `Ellipse 14` — no 1:470, o circulo vazio do item nao selecionado. */
export function IconeDesmarcado(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="11.5" stroke="currentColor" />
    </svg>
  );
}

/** `Group` do no 1:2221 — a camera da tela "Hora da foto do pet!". */
export function IconeCamera(props: Props) {
  return (
    <svg
      viewBox="0 0 30 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M1 5H8L11 1H19L22 5H29V23H1V5Z" />
      <path d="M15 18C17.7614 18 20 15.7614 20 13C20 10.2386 17.7614 8 15 8C12.2386 8 10 10.2386 10 13C10 15.7614 12.2386 18 15 18Z" />
    </svg>
  );
}

/* --------------------------------------------------------------------------
   Tela de perfil (no 1:3350).
   -------------------------------------------------------------------------- */

/** `Settings` — no 1:3369, a engrenagem que abre os ajustes da conta. */
export function IconeAjustes(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.68 19.18 11.36 19.13 11.06L21.16 9.48C21.34 9.34 21.39 9.07 21.28 8.87L19.36 5.55C19.24 5.33 18.99 5.26 18.77 5.33L16.38 6.29C15.88 5.91 15.35 5.59 14.76 5.35L14.4 2.81C14.36 2.57 14.16 2.4 13.92 2.4H10.08C9.84 2.4 9.65 2.57 9.61 2.81L9.25 5.35C8.66 5.59 8.12 5.92 7.63 6.29L5.24 5.33C5.02 5.25 4.77 5.33 4.65 5.55L2.74 8.87C2.62 9.08 2.66 9.34 2.86 9.48L4.89 11.06C4.84 11.36 4.8 11.69 4.8 12C4.8 12.31 4.82 12.64 4.87 12.94L2.84 14.52C2.66 14.66 2.61 14.93 2.72 15.13L4.64 18.45C4.76 18.67 5.01 18.74 5.23 18.67L7.62 17.71C8.12 18.09 8.65 18.41 9.24 18.65L9.6 21.19C9.65 21.43 9.84 21.6 10.08 21.6H13.92C14.16 21.6 14.36 21.43 14.39 21.19L14.75 18.65C15.34 18.41 15.88 18.09 16.37 17.71L18.76 18.67C18.98 18.75 19.23 18.67 19.35 18.45L21.27 15.13C21.39 14.91 21.34 14.66 21.15 14.52L19.14 12.94ZM12 15.6C10.02 15.6 8.4 13.98 8.4 12C8.4 10.02 10.02 8.4 12 8.4C13.98 8.4 15.6 10.02 15.6 12C15.6 13.98 13.98 15.6 12 15.6Z" />
    </svg>
  );
}

/**
 * `Vector` do no 1:3388 — a seta do fim de cada linha da lista de pets.
 *
 * No desenho ela e desenhada apontando para cima e girada 90 graus na tela.
 * Aqui a rotacao fica na classe (`rotate-90`), e nao no caminho: assim o
 * mesmo asset serve se alguma lista precisar dela em outra direcao.
 */
export function Seta(props: Props) {
  return (
    <svg viewBox="0 0 12 7.23548" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M1.46323 6.97057C1.1285 7.32378 0.585786 7.32378 0.251051 6.97057C-0.0836837 6.61737 -0.0836837 6.04471 0.251051 5.69151L5.39391 0.264904C5.7184 -0.0774959 6.2409 -0.0894757 6.57919 0.237728L11.722 5.21212C12.071 5.54964 12.0946 6.12176 11.7747 6.48997C11.4548 6.85818 10.9126 6.88306 10.5637 6.54553L6.02578 2.1563L1.46323 6.97057Z" />
    </svg>
  );
}

/* --------------------------------------------------------------------------
   Atalhos por tipo da Home (nos 1:3283 a 1:3286) e as duas acoes redondas da
   tela de detalhe (no 1:3433).

   Mesma regra dos de cima: a geometria e a exportada do Figma, e a unica
   alteracao e a cor, trocada por `currentColor` — o mesmo pino aparece branco
   sobre o atalho selecionado e laranja sobre os demais.
   -------------------------------------------------------------------------- */

/** `map-marker-alt` — atalho "Perdidos". */
export function IconePino(props: Props) {
  return (
    <svg viewBox="0 0 18 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M8.07506 23.5158C1.26422 13.6421 0 12.6287 0 9C0 4.02942 4.02942 0 9 0C13.9706 0 18 4.02942 18 9C18 12.6287 16.7358 13.6421 9.92494 23.5158C9.47798 24.1614 8.52197 24.1614 8.07506 23.5158ZM9 12.75C11.0711 12.75 12.75 11.0711 12.75 9C12.75 6.92892 11.0711 5.25 9 5.25C6.92892 5.25 5.25 6.92892 5.25 9C5.25 11.0711 6.92892 12.75 9 12.75Z" />
    </svg>
  );
}

/** `heart` — atalho "Adocao". */
export function IconeCoracao(props: Props) {
  return (
    <svg viewBox="0 0 24.0005 21.0004" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M21.6709 1.43593C19.1021 -0.753131 15.2818 -0.359381 12.924 2.07343L12.0006 3.02499L11.0771 2.07343C8.72401 -0.359381 4.89901 -0.753131 2.33026 1.43593C-0.613487 3.94843 -0.768175 8.45781 1.8662 11.1812L10.9365 20.5469C11.5225 21.1516 12.474 21.1516 13.06 20.5469L22.1303 11.1812C24.7693 8.45781 24.6146 3.94843 21.6709 1.43593Z" />
    </svg>
  );
}

/**
 * `user` cheio — atalho "Achar tutor".
 *
 * Nao e o mesmo do `IconePerfil`: aquele e o contorno da barra de navegacao,
 * este e o cheio do atalho. Sao dois nos diferentes no desenho.
 */
export function IconeTutor(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 13.5C15.7266 13.5 18.75 10.4766 18.75 6.75C18.75 3.02344 15.7266 0 12 0C8.27344 0 5.25 3.02344 5.25 6.75C5.25 10.4766 8.27344 13.5 12 13.5ZM18 15H15.4172C14.3766 15.4781 13.2188 15.75 12 15.75C10.7812 15.75 9.62813 15.4781 8.58281 15H6C2.68594 15 0 17.6859 0 21V21.75C0 22.9922 1.00781 24 2.25 24H21.75C22.9922 24 24 22.9922 24 21.75V21C24 17.6859 21.3141 15 18 15Z" />
    </svg>
  );
}

/** `share-alt` — o botao redondo creme da tela de detalhe. */
export function IconeCompartilhar(props: Props) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M24 20C22.587 20 21.2883 20.4887 20.2631 21.3059L13.8577 17.3026C14.0474 16.4445 14.0474 15.5554 13.8577 14.6974L20.2631 10.694C21.2883 11.5113 22.587 12 24 12C27.3137 12 30 9.31369 30 6C30 2.68631 27.3137 0 24 0C20.6863 0 18 2.68631 18 6C18 6.44737 18.0494 6.88313 18.1423 7.30256L11.7369 11.3059C10.7117 10.4887 9.413 10 8 10C4.68631 10 2 12.6863 2 16C2 19.3137 4.68631 22 8 22C9.413 22 10.7117 21.5113 11.7369 20.6941L18.1423 24.6974C18.0476 25.1252 17.9999 25.5619 18 26C18 29.3137 20.6863 32 24 32C27.3137 32 30 29.3137 30 26C30 22.6863 27.3137 20 24 20Z" />
    </svg>
  );
}

/** `phone-alt` — o botao redondo rosa da tela de detalhe (RF-21). */
export function IconeTelefone(props: Props) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M31.0869 22.6126L24.0869 19.6126C23.7878 19.4852 23.4555 19.4583 23.1399 19.5361C22.8243 19.6139 22.5425 19.7921 22.3369 20.0439L19.2369 23.8314C14.3717 21.5375 10.4564 17.6222 8.1625 12.757L11.95 9.65702C12.2023 9.45181 12.3809 9.17 12.4587 8.85423C12.5365 8.53847 12.5093 8.20595 12.3813 7.90702L9.38125 0.907017C9.2407 0.584772 8.99211 0.32167 8.67834 0.163078C8.36458 0.00448661 8.00532 -0.0396544 7.6625 0.0382667L1.1625 1.53827C0.831981 1.61459 0.537091 1.80069 0.325959 2.06619C0.114828 2.3317 -0.0000761854 2.66092 0 3.00014C0 19.0314 12.9937 32.0001 29 32.0001C29.3393 32.0004 29.6687 31.8855 29.9343 31.6744C30.2 31.4632 30.3862 31.1683 30.4625 30.8376L31.9625 24.3376C32.0399 23.9932 31.9948 23.6325 31.835 23.3176C31.6752 23.0028 31.4107 22.7535 31.0869 22.6126Z" />
    </svg>
  );
}

/** `logout` — no 1:3274, o sair do cabecalho da Home. */
export function IconeSair(props: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M16 15.5L19.5 12L16 8.5" />
      <path d="M13.4958 21H6.5C5.39543 21 4.5 19.8487 4.5 18.4286V5.57143C4.5 4.15127 5.39543 3 6.5 3H13.5" />
      <path d="M9.5 11.9958H19.5" />
    </svg>
  );
}
