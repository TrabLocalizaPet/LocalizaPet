/**
 * As formas creme do fundo das telas de cadastro.
 *
 * Do desenho: `Vector 5` (238x196 em -62,-48) no canto de cima, e
 * `Ellipse 1` (185x185 em -72,720) embaixo. Sao as manchas que aparecem
 * atras do conteudo nas telas de abertura e de sucesso.
 *
 * Ficam em porcentagem da largura para acompanharem telas maiores, e com
 * `aria-hidden` porque nao carregam informacao nenhuma.
 */
export function FormasDeFundo() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* 238 de 390 = 61% da largura; comeca fora do quadro, em cima e a esquerda. */}
      <div className="absolute -top-12 -left-16 size-[61%] rounded-[45%_55%_60%_40%/50%_45%_55%_50%] bg-creme" />
      {/* 185 de 390 = 47%, colada no rodape. */}
      <div className="absolute -bottom-16 -left-18 size-[47%] rounded-full bg-creme" />
    </div>
  );
}
