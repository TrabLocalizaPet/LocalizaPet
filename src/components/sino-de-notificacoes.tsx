"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { IconeSino } from "./ui/icones";
import type { NotificacaoNaCaixa } from "@/queries/notificacoes";

/**
 * O sino do cabecalho (no 1:3276 do Figma) com a contagem de nao lidas.
 *
 * **So aparece para quem entrou.** Notificacao e de alguem; para o visitante
 * (RF-22) o sino nao teria o que contar.
 *
 * A contagem e buscada uma vez, ao abrir a tela. Nao ha atualizacao em tempo
 * real por decisao registrada: em ambiente serverless nao ha conexao aberta,
 * e RN-30 diz que a notificacao e gravada, nao enviada. Quem navegar entre
 * telas ja ve o numero novo.
 */
export function SinoDeNotificacoes({ autenticado }: { autenticado: boolean | null }) {
  const [nao_lidas, definir_nao_lidas] = useState(0);

  useEffect(() => {
    if (!autenticado) return;

    fetch("/api/notificacoes")
      .then(async (r) => {
        if (!r.ok) return;
        const caixa: NotificacaoNaCaixa[] = await r.json();
        definir_nao_lidas(caixa.filter((n) => n.lida_em === null).length);
      })
      .catch(() => undefined);
  }, [autenticado]);

  if (!autenticado) return <span className="size-11" aria-hidden="true" />;

  return (
    <Link
      href="/notificacoes"
      aria-label={
        nao_lidas === 0
          ? "Notificacoes"
          : `Notificacoes, ${nao_lidas} nao ${nao_lidas === 1 ? "lida" : "lidas"}`
      }
      className="relative -mr-2 grid size-11 place-items-center text-primaria"
    >
      <IconeSino className="size-6" />

      {nao_lidas > 0 && (
        // O numero fica no proprio sino, e nao so um ponto: "3" diz mais que
        // "tem coisa nova", e e o que decide se a pessoa abre agora ou depois.
        <span className="absolute top-1 right-1 grid min-w-4 place-items-center rounded-full bg-perdido px-1 text-[10px] font-bold text-white">
          {nao_lidas > 9 ? "9+" : nao_lidas}
        </span>
      )}
    </Link>
  );
}
