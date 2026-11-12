"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Interruptor } from "@/components/ui/campo";
import type { Perfil } from "@/types/perfil";

/**
 * Diz, na hora de publicar, se quem achar o pet vai conseguir falar com o
 * autor — e deixa liberar o telefone ali mesmo.
 *
 * O telefone e o unico contato do anuncio (sem conversa no app, DT-05) e
 * nasce oculto (RN-24). Sem este aviso, o alerta de fuga saia com "Esta
 * pessoa preferiu nao exibir o telefone" sem a pessoa ter escolhido nada:
 * a opcao so existia nos ajustes do perfil. A regra continua valendo — o
 * telefone so aparece se a pessoa ligar o interruptor.
 *
 * A escolha vale para o perfil, e portanto para todos os anuncios dele: e
 * assim que o schema guarda (`perfis.telefone_publico`), e o texto diz.
 */
export function AvisoDeContato() {
  const [perfil, definir_perfil] = useState<Perfil | null>(null);
  const [salvando, definir_salvando] = useState(false);
  const [falhou, definir_falhou] = useState(false);

  useEffect(() => {
    fetch("/api/perfil")
      .then((r) => (r.ok ? r.json() : null))
      .then(definir_perfil)
      .catch(() => definir_perfil(null));
  }, []);

  // Sem perfil a propria tela ja redireciona; nada a dizer aqui.
  if (!perfil) return null;

  async function alternar(mostrar: boolean) {
    if (!perfil) return;
    definir_salvando(true);
    definir_falhou(false);

    // O PATCH do perfil pede o perfil editavel inteiro; nome e telefone vao
    // como estao para nao apagar nada.
    const resposta = await fetch("/api/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: perfil.nome,
        telefone: perfil.telefone,
        telefone_publico: mostrar,
      }),
    }).catch(() => null);

    if (resposta?.ok) definir_perfil(await resposta.json());
    else definir_falhou(true);
    definir_salvando(false);
  }

  if (!perfil.telefone) {
    return (
      <p className="rounded-[--radius-padrao] border border-borda border-l-4 border-l-encontrado bg-cartao px-3.5 py-3 text-sm">
        Voce nao cadastrou telefone, entao quem vir o anuncio nao tera como
        falar com voce.{" "}
        <Link href="/perfil" className="font-semibold text-primaria">
          Adicionar telefone
        </Link>
      </p>
    );
  }

  return (
    <div
      className={
        perfil.telefone_publico
          ? "rounded-[--radius-padrao] border border-borda border-l-4 border-l-adocao bg-cartao px-3.5"
          : "rounded-[--radius-padrao] border border-borda border-l-4 border-l-encontrado bg-cartao px-3.5"
      }
    >
      <Interruptor
        rotulo={`Mostrar meu telefone ${perfil.telefone} nos anuncios`}
        apoio={
          perfil.telefone_publico
            ? "Quem vir o anuncio pode te ligar. Vale para todos os seus anuncios."
            : "Desligado, ninguem que vir o anuncio vai ter como falar com voce."
        }
        checked={perfil.telefone_publico}
        disabled={salvando}
        onChange={(e) => alternar(e.target.checked)}
      />
      {falhou && (
        <p className="-mt-3 pb-3 text-xs text-perdido">
          Nao foi possivel salvar. Tente de novo.
        </p>
      )}
    </div>
  );
}
