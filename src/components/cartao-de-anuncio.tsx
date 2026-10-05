import Image from "next/image";
import Link from "next/link";

import { EtiquetaDeTipo } from "./etiqueta";
import { resumo } from "@/lib/formato";
import type { AnimalNaLista } from "@/types/animal";

/**
 * Cartao da listagem — nos 1:3291, 1:3298 e 1:3305 da Home no Figma.
 *
 * Medidas do desenho: 326x230, canto de 16, foto cobrindo o cartao inteiro,
 * degrade de 96 px no rodape (transparente -> preto), nome em 18 e a linha de
 * local em 12 sobre ele, ambos a 16 px da borda. A etiqueta do tipo fica no
 * canto superior esquerdo, tambem a 16.
 *
 * **O texto fica sobre a foto, nao abaixo dela.** Era essa a diferenca entre
 * este cartao e o anterior: o desenho usa a foto inteira como fundo, e o
 * degrade existe so para o nome continuar legivel sobre qualquer imagem.
 *
 * Anuncio sem foto cai na inicial sobre o creme da marca. O degrade fica do
 * mesmo jeito — sem ele o texto branco sumiria no fundo claro.
 */

/** O desenho muda a frase conforme o tipo: perdido teve uma ultima vez. */
const PREFIXO_DO_LOCAL: Record<AnimalNaLista["tipo_anuncio"], string> = {
  perdido: "ultima vez visto em",
  encontrado: "visto em",
  adocao: "atualmente em",
};

export function CartaoDeAnuncio({ animal }: { animal: AnimalNaLista }) {
  // Enquanto a F-12 (endereco pelo Nominatim) nao chega, `endereco_texto` e
  // nulo em todo anuncio. Em vez de deixar a linha vazia, ela mostra o que
  // descreve o animal — e a informacao que sobra, nao um texto de enfeite.
  const linha = animal.endereco_texto
    ? `${PREFIXO_DO_LOCAL[animal.tipo_anuncio]} ${animal.endereco_texto}`
    : resumo(animal);

  return (
    <Link
      href={`/animais/${animal.id}`}
      className="group relative block aspect-[326/230] overflow-hidden rounded-2xl bg-creme focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
    >
      {animal.foto_url ? (
        <Image
          src={animal.foto_url}
          alt={animal.nome ?? "Animal sem nome"}
          fill
          sizes="(min-width: 1024px) 22rem, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition group-hover:scale-[1.02]"
        />
      ) : (
        <span
          aria-hidden="true"
          className="grid size-full place-items-center font-titulo text-6xl text-primaria/70"
        >
          {(animal.nome ?? "?").charAt(0).toUpperCase()}
        </span>
      )}

      {/* 96 px de degrade num cartao de 230: 42% da altura. */}
      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-linear-to-b from-transparent to-black/95" />

      <div className="absolute inset-x-4 bottom-4">
        {/* RN-04: quem acha um animal na rua nao sabe o nome. */}
        <p className="text-lg leading-tight font-bold text-white">
          {animal.nome ?? "Sem nome"}
        </p>
        <p className="mt-1 line-clamp-2 text-xs text-white/80">{linha}</p>
      </div>

      <span className="absolute top-4 left-4">
        <EtiquetaDeTipo tipo={animal.tipo_anuncio} />
      </span>
    </Link>
  );
}
