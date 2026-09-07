import Link from "next/link";

import { EtiquetaDeTipo } from "./etiqueta";
import { ha_quanto_tempo, resumo } from "@/lib/formato";
import type { AnimalNaLista } from "@/types/animal";

/**
 * Cartao da listagem, a partir do `Frame 8` da Home no Figma.
 *
 * No desenho o cartao e a foto do animal ocupando a largura toda, com o nome
 * sobreposto embaixo e a etiqueta do tipo no canto. A foto so chega na F-09,
 * entao o espaco fica reservado com a inicial: assim o cartao ja tem a forma
 * do desenho e nao muda quando a foto entrar.
 */
export function CartaoDeAnuncio({ animal }: { animal: AnimalNaLista }) {
  return (
    <Link
      href={`/animais/${animal.id}`}
      className="group block overflow-hidden rounded-[--radius-padrao] border border-borda bg-cartao transition hover:border-primaria focus-visible:border-primaria focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
    >
      {/* Espaco da foto (F-09). A proporcao e a do Figma: 326x230. */}
      <div className="relative flex aspect-[326/230] items-center justify-center bg-primaria/15">
        <span
          aria-hidden="true"
          className="font-titulo text-5xl text-primaria/70"
        >
          {(animal.nome ?? "?").charAt(0).toUpperCase()}
        </span>

        <span className="absolute top-3 left-3">
          <EtiquetaDeTipo tipo={animal.tipo_anuncio} />
        </span>
      </div>

      <div className="p-3">
        {/* RN-04: quem acha um animal na rua nao sabe o nome. */}
        <p className="font-titulo text-base font-medium">
          {animal.nome ?? "Sem nome"}
        </p>
        <p className="text-sm text-suave">{resumo(animal)}</p>
        <p className="mt-1 text-xs text-suave">
          {animal.endereco_texto ? `${animal.endereco_texto} · ` : ""}
          {ha_quanto_tempo(animal.criado_em)}
        </p>
      </div>
    </Link>
  );
}
