import type { AnimalNaLista } from "@/types/animal";

/**
 * Formatacao compartilhada entre a listagem e o detalhe.
 *
 * O rotulo do tipo de anuncio nao mora aqui: ele e visual e vive junto do
 * componente que o desenha, em `src/components/etiqueta.tsx`.
 */

/**
 * "3 anos", "5 meses", "1 ano e 2 meses".
 *
 * O banco guarda meses (RN-05) porque filhote de dois meses e um caso comum
 * no produto e "0 anos" nao diz nada a ninguem.
 */
export function idade_por_extenso(meses: number | null): string | null {
  if (meses === null) return null;
  if (meses < 12) return `${meses} ${meses === 1 ? "mes" : "meses"}`;

  const anos = Math.floor(meses / 12);
  const resto = meses % 12;
  const parte_anos = `${anos} ${anos === 1 ? "ano" : "anos"}`;

  if (resto === 0) return parte_anos;
  return `${parte_anos} e ${resto} ${resto === 1 ? "mes" : "meses"}`;
}

/** A linha de baixo do cartao: o que descreve o animal, sem os campos vazios. */
export function resumo(animal: AnimalNaLista): string {
  const especie = { cachorro: "Cachorro", gato: "Gato", outro: "Outro" }[
    animal.especie
  ];
  const sexo = animal.sexo === "macho" ? "Macho" : animal.sexo === "femea" ? "Femea" : null;
  const porte = animal.porte
    ? { pequeno: "Pequeno", medio: "Medio", grande: "Grande" }[animal.porte]
    : null;

  return [especie, sexo, porte, animal.cor, idade_por_extenso(animal.idade_meses)]
    .filter(Boolean)
    .join(" · ");
}

/** "ha 2 dias". Data absoluta nao ajuda quem procura um animal perdido. */
export function ha_quanto_tempo(data: Date | string): string {
  const quando = typeof data === "string" ? new Date(data) : data;
  const dias = Math.floor((Date.now() - quando.getTime()) / 86_400_000);

  if (dias <= 0) return "hoje";
  if (dias === 1) return "ontem";
  if (dias < 30) return `ha ${dias} dias`;
  const meses = Math.floor(dias / 30);
  return `ha ${meses} ${meses === 1 ? "mes" : "meses"}`;
}
