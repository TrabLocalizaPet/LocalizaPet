import type { ReactNode } from "react";

import { classes } from "./ui/classes";
import type { TipoDeAnuncio } from "@/types/animal";

/**
 * Etiqueta em pilula.
 *
 * No Figma aparece em dois papeis: o tipo do anuncio, colorido, e as
 * caracteristicas do animal, em laranja. As caracteristicas chegam na F-10;
 * o componente ja atende as duas para nao ser reescrito la.
 */

export const ROTULO_DO_TIPO: Record<TipoDeAnuncio, string> = {
  perdido: "Perdido",
  encontrado: "Encontrado",
  adocao: "Adocao",
};

const COR: Record<TipoDeAnuncio, string> = {
  perdido: "bg-perdido",
  encontrado: "bg-encontrado",
  adocao: "bg-adocao",
};

/** A cor diz o tipo, e o texto tambem — cor sozinha nao distingue nada para
 *  quem nao ve vermelho e verde, que sao justamente perdido e adocao. */
export function EtiquetaDeTipo({ tipo }: { tipo: TipoDeAnuncio }) {
  return (
    <span
      className={classes(
        "inline-block rounded-full px-2 py-0.5 text-xs font-bold tracking-wide text-white uppercase",
        COR[tipo],
      )}
    >
      {ROTULO_DO_TIPO[tipo]}
    </span>
  );
}

/** Caracteristica do animal (F-10). Laranja, como no desenho. */
export function Etiqueta({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-full bg-primaria px-2.5 py-1 text-xs font-semibold text-white">
      {children}
    </span>
  );
}
