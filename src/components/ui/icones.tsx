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
