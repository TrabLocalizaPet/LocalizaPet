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

/** Marca com o nome ao lado, para o cabecalho do desktop. */
export function MarcaComNome({ className }: { className?: string }) {
  return (
    <span className={classes("flex items-center gap-2", className)}>
      <Marca tamanho={32} />
      <span className="font-titulo text-base text-escura">
        Localiza<span className="text-primaria">Pet</span>
      </span>
    </span>
  );
}
