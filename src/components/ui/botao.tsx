import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { classes } from "./classes";

/**
 * Botao (o `Button` do Figma).
 *
 * Tres formas, todas presentes no desenho: a acao primaria laranja, a
 * secundaria de contorno, e a circular grande que aparece sobreposta a foto
 * na tela de detalhe.
 *
 * Altura de **40 px**, que e a do `Button` no Figma (326x40). Fica abaixo dos
 * 44 px que os guias de acessibilidade recomendam como alvo de toque; o
 * desenho manda aqui, e a diferenca esta anotada no docs/07-interface.md.
 */

type Aparencia = "primaria" | "secundaria" | "fantasma";
type Tamanho = "normal" | "circular";

const APARENCIA: Record<Aparencia, string> = {
  primaria: "bg-primaria text-white hover:brightness-95",
  secundaria: "border border-borda bg-cartao text-texto hover:border-primaria",
  fantasma: "text-primaria underline underline-offset-2 hover:brightness-90",
};

const TAMANHO: Record<Tamanho, string> = {
  normal: "min-h-10 rounded-[--radius-padrao] px-4 py-2 text-base font-semibold",
  circular: "size-14 rounded-full text-2xl",
};

const BASE =
  "inline-flex items-center justify-center gap-2 transition " +
  "disabled:opacity-55 disabled:cursor-progress " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria";

function estilo(aparencia: Aparencia, tamanho: Tamanho, extra?: string) {
  return classes(BASE, APARENCIA[aparencia], TAMANHO[tamanho], extra);
}

type Comuns = {
  aparencia?: Aparencia;
  tamanho?: Tamanho;
  /** Ocupa a largura toda. E o padrao no celular, onde o Figma desenha assim. */
  largo?: boolean;
  children: ReactNode;
};

export function Botao({
  aparencia = "primaria",
  tamanho = "normal",
  largo = false,
  className,
  children,
  ...resto
}: Comuns & ComponentProps<"button">) {
  return (
    <button
      className={estilo(aparencia, tamanho, classes(largo && "w-full", className))}
      {...resto}
    >
      {children}
    </button>
  );
}

/** Mesma aparencia, mas navega. Link continua sendo link — abre em nova aba,
 *  aparece no menu do botao direito, e o teclado o trata como link. */
export function BotaoLink({
  aparencia = "primaria",
  tamanho = "normal",
  largo = false,
  className,
  children,
  ...resto
}: Comuns & ComponentProps<typeof Link>) {
  return (
    <Link
      className={estilo(aparencia, tamanho, classes(largo && "w-full", className))}
      {...resto}
    >
      {children}
    </Link>
  );
}
