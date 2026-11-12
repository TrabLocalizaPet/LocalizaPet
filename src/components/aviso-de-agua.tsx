"use client";

import { Aviso } from "./ui/tela";
import { useNaAgua } from "@/lib/agua";

/**
 * Aviso de pino na agua, nos passos que marcam local (publicar e alerta).
 *
 * Nao bloqueia o "Publicar": a deteccao e pela cor do mapa (ver
 * `lib/agua.ts`) e pode errar perto da praia. O texto diz o que conferir e
 * como corrigir, e a decisao fica com quem esta publicando.
 */
export function AvisoDeAgua({ local }: { local: [number, number] | null }) {
  const na_agua = useNaAgua(local);
  if (!na_agua) return null;

  return (
    <div role="status">
      <Aviso>
        <strong className="block font-semibold">
          Esse ponto parece estar na água.
        </strong>
        Confira se o pino está onde o pet foi visto. Se não estiver, aproxime o
        mapa e toque no lugar certo.
      </Aviso>
    </div>
  );
}
