import type { ReactNode } from "react";

import { classes } from "./ui/classes";
import type { Situacao, TipoDeAnuncio } from "@/types/animal";

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
      /* Geometria do `Badge` do Figma (no 1:3297): canto de 8, 8 px nas
         laterais, 2 em cima e embaixo, 12 px semibold. Nao e pilula nem
         caixa alta — era a diferenca para o desenho. */
      className={classes(
        "inline-block rounded-[--radius-padrao] px-2 py-0.5 text-xs font-semibold text-white",
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

/**
 * Situacao do anuncio (RN-07), quando ela nao e `ativo`.
 *
 * Fica na cor escura da marca, e nao numa das tres cores de tipo: o estado
 * do anuncio nao compete com o que ele e. O texto carrega o sentido —
 * "RESOLVIDO" ao lado de "PERDIDO" nao depende de distinguir cor nenhuma.
 *
 * `ativo` nao tem etiqueta: anuncio ativo e o normal, e etiqueta em tudo
 * deixa de informar.
 */
export function EtiquetaDeSituacao({ situacao }: { situacao: Situacao }) {
  if (situacao === "ativo") return null;

  return (
    <span className="inline-block rounded-[--radius-padrao] bg-escura px-2 py-0.5 text-xs font-semibold text-white">
      {situacao === "resolvido" ? "Resolvido" : "Arquivado"}
    </span>
  );
}
