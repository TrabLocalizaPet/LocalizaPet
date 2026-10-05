"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Botao } from "@/components/ui/botao";
import { SetaVoltar } from "@/components/ui/icones";
import { Apoio, Aviso, Tela, Titulo } from "@/components/ui/tela";
import { ha_quanto_tempo } from "@/lib/formato";
import type { NotificacaoNaCaixa } from "@/queries/notificacoes";

/**
 * Caixa de notificacoes (RF-25, RF-26) — o sino do cabecalho da Home.
 *
 * **Abrir a caixa nao marca tudo como lido.** Quem abre quer saber o que
 * chegou; se a lista se apaga sozinha ao abrir, a pessoa perde o unico sinal
 * que tinha. Marcar e acao: tocar na notificacao (que ja leva ao anuncio) ou
 * o botao de marcar todas.
 *
 * A caixa mostra lidas e nao lidas, porque e historico. O que muda e o
 * destaque: nao lida tem fundo e um ponto ao lado.
 */
export default function Notificacoes() {
  const router = useRouter();
  const [caixa, definir_caixa] = useState<NotificacaoNaCaixa[]>([]);
  const [estado, definir_estado] = useState<"carregando" | "pronto">("carregando");
  const [erro, definir_erro] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/notificacoes")
      .then(async (r) => {
        if (r.status === 401) return router.replace("/entrar");
        definir_caixa(await r.json());
        definir_estado("pronto");
      })
      .catch(() => definir_erro("Nao foi possivel carregar agora."));
  }, [router]);

  async function marcar(ids: string[] | null) {
    const resposta = await fetch("/api/notificacoes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ids ? { ids } : {}),
    });

    if (!resposta.ok) return definir_erro("Nao foi possivel marcar como lida.");

    // A data vem do banco na proxima carga; aqui basta tirar o destaque.
    const agora = new Date();
    definir_caixa((atual) =>
      atual.map((n) =>
        (ids === null || ids.includes(n.id)) && n.lida_em === null
          ? { ...n, lida_em: agora }
          : n,
      ),
    );
  }

  const nao_lidas = caixa.filter((n) => n.lida_em === null).length;

  if (estado === "carregando") {
    return (
      <Tela largura="estreita">
        <Apoio>Carregando...</Apoio>
      </Tela>
    );
  }

  return (
    <Tela largura="estreita">
      {/* A caixa e um desvio do caminho: a pessoa entrou para ver um aviso e
          quer voltar para onde estava. `back()` devolve ao ponto de partida —
          que pode ser a Home, o detalhe de um anuncio ou o perfil —, e so cai
          na Home quando nao ha para onde voltar (link aberto direto). */}
      <button
        type="button"
        onClick={() => (window.history.length > 1 ? router.back() : router.push("/animais"))}
        className="-ml-3 mb-1 inline-flex min-h-11 items-center gap-2 px-3 text-sm font-semibold text-primaria"
      >
        <SetaVoltar className="size-5" />
        Voltar
      </button>

      <Titulo>Notificacoes</Titulo>
      <Apoio>
        {nao_lidas === 0
          ? "Nada novo por aqui."
          : `${nao_lidas} ${nao_lidas === 1 ? "nova" : "novas"}.`}
      </Apoio>

      {erro && <Aviso>{erro}</Aviso>}

      {caixa.length === 0 && (
        <Aviso>
          Voce ainda nao tem notificacoes. Elas chegam quando aparece um
          anuncio dentro de uma area que voce monitora.
        </Aviso>
      )}

      <ul className="mt-4 grid gap-2">
        {caixa.map((n) => {
          const nova = n.lida_em === null;

          const conteudo = (
            <span className="flex items-start gap-3">
              {/* O ponto diz o mesmo que o fundo, para nao depender de cor. */}
              <span
                aria-hidden="true"
                className={
                  "mt-1.5 size-2 shrink-0 rounded-full " +
                  (nova ? "bg-primaria" : "bg-transparent")
                }
              />
              <span>
                <span className="block text-sm font-semibold">{n.titulo}</span>
                <span className="block text-xs text-suave">
                  {ha_quanto_tempo(n.criado_em)}
                  {nova ? " · nao lida" : ""}
                </span>
              </span>
            </span>
          );

          const classe =
            "block w-full rounded-[--radius-padrao] border border-borda p-3 text-left transition " +
            (nova ? "bg-creme/40" : "bg-cartao") +
            " hover:border-primaria focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria";

          // Com anuncio, a notificacao e um link que tambem marca como lida.
          // Sem anuncio (o anuncio foi apagado), vira so o botao de marcar.
          return (
            <li key={n.id}>
              {n.animal_id ? (
                <Link
                  href={`/animais/${n.animal_id}`}
                  onClick={() => marcar([n.id])}
                  className={classe}
                >
                  {conteudo}
                </Link>
              ) : (
                <button type="button" onClick={() => marcar([n.id])} className={classe}>
                  {conteudo}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {nao_lidas > 0 && (
        <Botao
          aparencia="secundaria"
          largo
          className="mt-4"
          onClick={() => marcar(null)}
        >
          Marcar todas como lidas
        </Botao>
      )}
    </Tela>
  );
}
