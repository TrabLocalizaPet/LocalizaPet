"use client";

import type { ComponentProps } from "react";

import { IconeBuscar } from "./ui/icones";
import { classes } from "./ui/classes";

/**
 * Barra de pesquisa da Home — no 1:3278 do Figma.
 *
 * Medidas do desenho: 326x56, canto de 8, fundo creme a 30% de opacidade,
 * texto de 12 centralizado, e o quadrado laranja de 34x34 com a lupa a 11 px
 * da borda direita.
 *
 * **A lupa e decoracao aqui, nao botao.** A filtragem acontece a cada tecla,
 * entao nao ha o que um clique faria a mais; um botao que nao faz nada e pior
 * que nenhum. Por isso o quadrado e `aria-hidden` e o rotulo vive no `label`.
 */
export function CampoDeBusca({
  className,
  ...resto
}: ComponentProps<"input"> & { rotulo?: string }) {
  return (
    <label className={classes("relative block h-14 w-full", className)}>
      <span className="sr-only">Buscar</span>

      <input
        type="search"
        className={classes(
          "size-full rounded-[--radius-padrao] bg-creme/30 pr-14 pl-4 text-xs",
          "placeholder:text-black/40",
          "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primaria",
        )}
        {...resto}
      />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-[11px] right-[11px] grid size-[34px] place-items-center rounded-[--radius-padrao] bg-primaria text-white"
      >
        <IconeBuscar className="size-[13px]" />
      </span>
    </label>
  );
}
