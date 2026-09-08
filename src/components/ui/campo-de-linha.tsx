import type { ComponentProps, ReactNode } from "react";

import { classes } from "./classes";

/**
 * Campo do cadastro passo a passo (no 1:1916 do Figma).
 *
 * Aqui a entrada e uma **linha**, nao a caixa das telas de Login: a tela tem
 * uma pergunta so, e a caixa competiria com o titulo. O valor fica grande e
 * centralizado, e a explicacao vem embaixo, tambem centralizada.
 *
 * Medidas do desenho: linha de 327 de largura, valor de 28 de altura acima
 * dela, apoio de 186 de largura abaixo.
 */
export function CampoDeLinha({
  apoio,
  className,
  ...resto
}: { apoio?: ReactNode } & ComponentProps<"input">) {
  return (
    <div className="w-full">
      <input
        className={classes(
          "w-full border-0 border-b border-borda bg-transparent pb-2 text-center",
          "text-xl text-texto placeholder:text-suave/60",
          // `outline-none` com a linha mudando de cor: o foco continua
          // visivel, mas sem o retangulo que brigaria com o desenho.
          "focus:border-primaria focus:outline-none",
          className,
        )}
        {...resto}
      />
      {apoio && (
        <p className="mx-auto mt-3 max-w-56 text-center text-xs leading-snug text-suave">
          {apoio}
        </p>
      )}
    </div>
  );
}
