import { Marca } from "./marca";

/**
 * Splash Screen (no 1:590 do Figma).
 *
 * Fundo laranja com quatro circulos concentricos clareando para o centro, e
 * a marca no meio. As medidas sao as do desenho, convertidas para
 * porcentagem da largura de 390 px: os raios 372, 327, 262 e 183 viram
 * 191%, 168%, 134% e 94%, e a marca de 215 px vira 55%.
 *
 * Em porcentagem, e nao em pixel fixo, porque o desenho existe so para
 * 390 px: numa tela mais larga os circulos precisam crescer junto, senao
 * viram uma moeda no canto.
 *
 * Os circulos ficam todos no centro do quadro — no Figma eles estao em
 * (192, 419), que e o centro dos 390x844.
 */

const CIRCULOS = [
  { tamanho: "382%", cor: "#f9a94e" },
  { tamanho: "336%", cor: "#fbc27c" },
  { tamanho: "269%", cor: "#fddcb4" },
  { tamanho: "188%", cor: "#fef3e4" },
];

export function Splash() {
  return (
    <div className="fixed inset-0 grid place-items-center overflow-hidden bg-primaria">
      {CIRCULOS.map((circulo) => (
        <div
          key={circulo.cor}
          aria-hidden="true"
          className="col-start-1 row-start-1 aspect-square rounded-full"
          style={{ width: circulo.tamanho, background: circulo.cor }}
        />
      ))}

      {/* 215 de 390 = 55% da largura. */}
      <Marca tamanho={215} className="col-start-1 row-start-1 w-[55%] max-w-56" />
    </div>
  );
}
