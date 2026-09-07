/**
 * Junta classes ignorando `false`, `null` e `undefined`.
 *
 * Existe para nao trazer `clsx` so por isto. Nao resolve conflito entre
 * utilitarios do Tailwind — quando duas classes brigam, quem escreve decide,
 * e a ultima do arquivo vence conforme a ordem do CSS gerado.
 */
export function classes(
  ...partes: (string | false | null | undefined)[]
): string {
  return partes.filter(Boolean).join(" ");
}
