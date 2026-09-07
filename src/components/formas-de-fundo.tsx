import Image from "next/image";

/**
 * Grafismos do fundo, exportados do Figma.
 *
 * Sao dois conjuntos diferentes, e nao um so reaproveitado:
 *
 * - **`cadastro`** — `Vector 5` (238x196 em -62,-48) e `Ellipse 1`
 *   (185x185 em -72,720), as duas na esquerda. Os arquivos ja vem recortados
 *   na parte visivel: 176x148 e 113x124.
 * - **`login`** — uma mancha no canto de cima e outra no de baixo, do lado
 *   oposto.
 *
 * As medidas viram porcentagem da largura de 390 px para acompanharem telas
 * maiores. `aria-hidden` porque nao carregam informacao, e `-z-10` para
 * ficarem atras do conteudo sem interceptar toque.
 */

type Conjunto = "cadastro" | "login";

export function FormasDeFundo({ conjunto = "cadastro" }: { conjunto?: Conjunto }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {conjunto === "cadastro" ? (
        <>
          {/* 176 de 390 = 45% */}
          <Image
            src="/ilustracoes/grafismo-esquerda-cima-2.svg"
            alt=""
            width={176}
            height={148}
            className="absolute top-0 left-0 w-[45%]"
          />
          {/* 113 de 390 = 29% */}
          <Image
            src="/ilustracoes/grafismo-esquerda-baixo-2.svg"
            alt=""
            width={113}
            height={124}
            className="absolute bottom-0 left-0 w-[29%]"
          />
        </>
      ) : (
        <>
          {/* 100 de 390 = 26% */}
          <Image
            src="/ilustracoes/grafismo-cima-esquerda.svg"
            alt=""
            width={100}
            height={104}
            className="absolute top-0 left-0 w-[26%]"
          />
          {/* 109 de 390 = 28% */}
          <Image
            src="/ilustracoes/grafismo-baixo-direita.svg"
            alt=""
            width={109}
            height={85}
            className="absolute right-0 bottom-0 w-[28%]"
          />
        </>
      )}
    </div>
  );
}
