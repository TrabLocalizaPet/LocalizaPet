import type { ReactNode } from "react";

import { classes } from "./classes";

/**
 * Casco das telas.
 *
 * Mobile primeiro (DT-08): a medida escrita direto e a de 390 px, e o
 * desktop entra por `md:`. Toda tela usa este componente em vez de repetir
 * `max-w`/`px`/`py` — foi essa repeticao que fez as telas divergirem entre
 * si.
 *
 * `estreita` e a largura de formulario do Figma; a larga serve a listagem e
 * ao mapa, que ganham com o espaco no desktop.
 */
export function Tela({
  largura = "larga",
  className,
  children,
}: {
  largura?: "larga" | "estreita";
  className?: string;
  children: ReactNode;
}) {
  return (
    <main
      className={classes(
        "mx-auto w-full px-5 py-5 md:py-8",
        largura === "estreita" ? "max-w-sm" : "max-w-4xl",
        className,
      )}
    >
      {children}
    </main>
  );
}

/** Titulo de tela, em Mitr como no Figma. */
export function Titulo({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h1
      className={classes(
        "font-titulo text-xl leading-tight font-semibold md:text-2xl",
        className,
      )}
    >
      {children}
    </h1>
  );
}

/** Linha de apoio abaixo do titulo. */
export function Apoio({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={classes("mt-1 text-sm text-suave", className)}>{children}</p>
  );
}

/**
 * Recado ao usuario. `tom` decide a cor da barra lateral — erro em vermelho,
 * confirmacao em verde.
 */
export function Aviso({
  tom = "erro",
  children,
}: {
  tom?: "erro" | "bom";
  children: ReactNode;
}) {
  return (
    <p
      className={classes(
        "my-3 rounded-[--radius-padrao] border border-borda border-l-4 bg-cartao px-3.5 py-3 text-sm",
        tom === "erro" ? "border-l-perdido" : "border-l-adocao",
      )}
    >
      {children}
    </p>
  );
}
