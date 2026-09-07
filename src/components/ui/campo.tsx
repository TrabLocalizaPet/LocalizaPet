import type { ComponentProps, ReactNode } from "react";

import { classes } from "./classes";

/**
 * Campo de formulario (o `Input Group` do Figma): rotulo, entrada e apoio.
 *
 * O `<label>` envolve a entrada em vez de usar `htmlFor`, entao o rotulo e a
 * entrada ficam ligados sem precisar inventar `id` unico em cada tela.
 */

const ENTRADA =
  "w-full min-h-10 rounded-[--radius-padrao] border border-borda bg-cartao " +
  "px-3.5 py-2 text-base text-texto " +
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primaria " +
  "focus-visible:border-primaria";

type Envolucro = {
  rotulo: ReactNode;
  /** Linha de apoio abaixo do campo. No Figma explica a consequencia. */
  apoio?: ReactNode;
  children: ReactNode;
};

function Envolver({ rotulo, apoio, children }: Envolucro) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{rotulo}</span>
      {children}
      {apoio && <span className="mt-1 block text-xs text-suave">{apoio}</span>}
    </label>
  );
}

export function Campo({
  rotulo,
  apoio,
  className,
  ...resto
}: Omit<Envolucro, "children"> & ComponentProps<"input">) {
  return (
    <Envolver rotulo={rotulo} apoio={apoio}>
      <input className={classes(ENTRADA, className)} {...resto} />
    </Envolver>
  );
}

export function CampoLongo({
  rotulo,
  apoio,
  className,
  ...resto
}: Omit<Envolucro, "children"> & ComponentProps<"textarea">) {
  return (
    <Envolver rotulo={rotulo} apoio={apoio}>
      <textarea className={classes(ENTRADA, "min-h-24", className)} {...resto} />
    </Envolver>
  );
}

export function Selecao({
  rotulo,
  apoio,
  className,
  children,
  ...resto
}: Omit<Envolucro, "children"> & ComponentProps<"select">) {
  return (
    <Envolver rotulo={rotulo} apoio={apoio}>
      <select className={classes(ENTRADA, className)} {...resto}>
        {children}
      </select>
    </Envolver>
  );
}

/**
 * Interruptor com explicacao ao lado (RF-20).
 *
 * A explicacao nao e enfeite: o que a pessoa precisa entender e a
 * consequencia de ligar, nao o nome do campo.
 */
export function Interruptor({
  rotulo,
  apoio,
  className,
  ...resto
}: Omit<Envolucro, "children"> & ComponentProps<"input">) {
  return (
    <label className="my-5 flex items-start gap-2.5">
      <input
        type="checkbox"
        className={classes("mt-0.5 size-[1.05rem] accent-primaria", className)}
        {...resto}
      />
      <span>
        <span className="block text-sm font-semibold">{rotulo}</span>
        {apoio && <span className="block text-xs text-suave">{apoio}</span>}
      </span>
    </label>
  );
}
