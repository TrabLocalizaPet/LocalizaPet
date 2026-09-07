import Image from "next/image";

import { Marca } from "./marca";

/**
 * Splash Screen (no 1:590 do Figma).
 *
 * O fundo e o arquivo exportado do desenho: quatro aneis concentricos
 * clareando do laranja ate o branco no centro. Antes eram circulos montados
 * em CSS por mim, com as cores e as espessuras erradas — o centro do desenho
 * e branco, e nao creme.
 *
 * `object-cover` porque a imagem tem a mesma proporcao do quadro (780x1688 e
 * o dobro de 390x844): numa tela mais estreita ou mais larga ela corta pelas
 * bordas em vez de deformar os aneis, e o miolo branco continua centrado, que
 * e onde a marca fica.
 */
export function Splash() {
  return (
    <div className="fixed inset-0 grid place-items-center overflow-hidden bg-primaria">
      <Image
        src="/marca/splash-screen-background.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="col-start-1 row-start-1 object-cover"
      />

      {/* 215 de 390 = 55% da largura, centrada — e o centro do circulo branco. */}
      <Marca
        tamanho={215}
        className="col-start-1 row-start-1 w-[55%] max-w-56"
      />
    </div>
  );
}
