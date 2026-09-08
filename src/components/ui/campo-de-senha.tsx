"use client";

import { useState } from "react";
import type { ComponentProps } from "react";

import { classes } from "./classes";

/**
 * Campo de senha com o olho de revelar (esta no desenho das telas de Login).
 *
 * Revelar a senha nao e enfeite: em teclado de celular o erro de digitacao e
 * comum, e sem poder conferir a pessoa so descobre no "senha incorreta".
 *
 * O botao tem `tabIndex={-1}` de proposito — quem navega por teclado ja ve o
 * que digitou, e o olho no meio do caminho atrasaria o Tab entre os campos.
 */

const ENTRADA =
  "w-full min-h-10 rounded-[--radius-padrao] border border-borda bg-cartao " +
  "px-3.5 py-2 pr-11 text-base text-texto " +
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primaria " +
  "focus-visible:border-primaria";

export function CampoDeSenha({
  rotulo,
  apoio,
  className,
  ...resto
}: {
  rotulo: string;
  apoio?: string;
} & Omit<ComponentProps<"input">, "type">) {
  const [revelada, definir_revelada] = useState(false);

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{rotulo}</span>

      <span className="relative block">
        <input
          type={revelada ? "text" : "password"}
          className={classes(ENTRADA, className)}
          {...resto}
        />

        <button
          type="button"
          tabIndex={-1}
          onClick={() => definir_revelada((v) => !v)}
          aria-label={revelada ? "Esconder a senha" : "Mostrar a senha"}
          aria-pressed={revelada}
          className="absolute inset-y-0 right-0 grid w-11 place-items-center text-suave hover:text-texto"
        >
          <Olho fechado={revelada} />
        </button>
      </span>

      {apoio && <span className="mt-1 block text-xs text-suave">{apoio}</span>}
    </label>
  );
}

/** Olho aberto; com `fechado`, ganha o risco que indica "esconder". */
function Olho({ fechado }: { fechado: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
      aria-hidden="true"
    >
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.75" />
      {fechado && <path d="m3.5 3.5 17 17" />}
    </svg>
  );
}
