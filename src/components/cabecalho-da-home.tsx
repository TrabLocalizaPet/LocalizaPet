"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { IconeSair } from "./ui/icones";
import { cliente_navegador } from "@/lib/auth-navegador";

/**
 * Cabecalho da Home — no 1:3273 do Figma: um icone a esquerda, o titulo da
 * tela no centro e um a direita, a 28 px das bordas e 56 do topo.
 *
 * **O da esquerda so existe para quem entrou.** No desenho ele e o sair, e
 * sair sem ter entrado nao quer dizer nada; para o visitante (RF-22) o lugar
 * vira o "Entrar", que e o que falta para ele. O desenho nao tem esse estado
 * porque nao desenhou a Home de quem esta sem conta.
 *
 * O lugar da direita fica reservado pelo `acao`: o sino do desenho entra ali.
 * Quando nao ha nada, sobra um vao do mesmo tamanho — sem ele o titulo sairia
 * do centro.
 */
export function CabecalhoDaHome({
  titulo,
  autenticado,
  acao,
}: {
  titulo: ReactNode;
  /** `null` enquanto ainda nao se sabe: nao pisca entre os dois estados. */
  autenticado: boolean | null;
  acao?: ReactNode;
}) {
  const router = useRouter();

  async function sair() {
    await cliente_navegador().auth.signOut();
    // refresh() antes de navegar: os Server Components precisam parar de
    // enxergar o cookie que a biblioteca acabou de apagar.
    router.refresh();
    router.push("/");
  }

  return (
    <div className="flex items-center justify-between">
      {autenticado === null ? (
        <span className="size-11" aria-hidden="true" />
      ) : autenticado ? (
        <button
          type="button"
          onClick={sair}
          aria-label="Sair da conta"
          className="-ml-2 grid size-11 place-items-center text-primaria"
        >
          <IconeSair className="size-6" />
        </button>
      ) : (
        <Link
          href="/entrar"
          className="-ml-2 grid h-11 place-items-center px-2 text-sm font-semibold text-primaria"
        >
          Entrar
        </Link>
      )}

      <p className="text-xs">{titulo}</p>

      {acao ?? <span className="size-11" aria-hidden="true" />}
    </div>
  );
}
