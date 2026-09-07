import Image from "next/image";

import { classes } from "./ui/classes";

/**
 * Logotipo, exportado do Figma para `public/marca/` (DT-08).
 *
 * Nao e recriado a mao nem substituido por emoji: o desenho existe, e
 * redesenha-lo aqui descartaria o trabalho e produziria uma marca que nao e
 * a aprovada.
 */
export function Marca({
  tamanho = 40,
  className,
}: {
  tamanho?: number;
  className?: string;
}) {
  return (
    <Image
      src="/marca/logo.png"
      alt="LocalizaPet"
      width={tamanho}
      height={tamanho}
      className={classes("shrink-0", className)}
      priority
    />
  );
}

/**
 * Marca com o nome, tambem exportada do Figma — e um desenho unico, com o
 * cachorro, o coracao e a tipografia proprios. Escrever "LocalizaPet" em
 * texto ao lado do simbolo seria recriar a marca a mao.
 */
export function MarcaComNome({
  largura = 132,
  className,
}: {
  largura?: number;
  className?: string;
}) {
  return (
    <Image
      src="/marca/logo-com-nome.png"
      alt="LocalizaPet"
      width={largura}
      height={Math.round((largura * 666) / 1407)}
      className={classes("shrink-0", className)}
      priority
    />
  );
}
