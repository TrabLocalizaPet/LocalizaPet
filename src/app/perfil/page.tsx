"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Botao } from "@/components/ui/botao";
import { Campo, Interruptor } from "@/components/ui/campo";
import { Apoio, Aviso, Tela, Titulo } from "@/components/ui/tela";
import { cliente_navegador } from "@/lib/auth-navegador";
import type { Perfil } from "@/types/perfil";

type Estado = "carregando" | "sem_perfil" | "pronto";

/**
 * Minha conta (RF-19, RF-20).
 *
 * Tres situacoes, e a terceira e a que costuma ser esquecida:
 *
 * - sem sessao (401) -> vai para /entrar
 * - com sessao e sem perfil (404) -> o cadastro parou entre os dois passos, e
 *   esta tela termina o servico. E o caminho de quem confirmou o e-mail
 *   depois, quando o cadastro nao pode criar o perfil por falta de sessao
 * - com perfil -> edicao
 */
export default function MinhaConta() {
  const router = useRouter();
  const [estado, definir_estado] = useState<Estado>("carregando");
  const [nome, definir_nome] = useState("");
  const [telefone, definir_telefone] = useState("");
  const [telefone_publico, definir_telefone_publico] = useState(false);
  const [email, definir_email] = useState("");
  const [aviso, definir_aviso] = useState<string | null>(null);
  const [erro, definir_erro] = useState<string | null>(null);
  const [salvando, definir_salvando] = useState(false);

  useEffect(() => {
    async function carregar() {
      const resposta = await fetch("/api/perfil");

      if (resposta.status === 401) return router.replace("/entrar");
      if (resposta.status === 404) return definir_estado("sem_perfil");

      const perfil: Perfil = await resposta.json();
      definir_nome(perfil.nome);
      definir_telefone(perfil.telefone ?? "");
      definir_telefone_publico(perfil.telefone_publico);
      definir_email(perfil.email);
      definir_estado("pronto");
    }

    carregar();
  }, [router]);

  async function salvar(evento: React.FormEvent) {
    evento.preventDefault();
    definir_erro(null);
    definir_aviso(null);
    definir_salvando(true);

    const criando = estado === "sem_perfil";
    const resposta = await fetch("/api/perfil", {
      method: criando ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        criando
          ? { nome, telefone: telefone || null }
          : { nome, telefone: telefone || null, telefone_publico },
      ),
    });

    if (!resposta.ok) {
      definir_erro("Nao foi possivel salvar. Tente de novo.");
      definir_salvando(false);
      return;
    }

    const perfil: Perfil = await resposta.json();
    definir_nome(perfil.nome);
    definir_telefone(perfil.telefone ?? "");
    definir_telefone_publico(perfil.telefone_publico);
    definir_email(perfil.email);
    definir_estado("pronto");
    definir_aviso("Alteracoes salvas.");
    definir_salvando(false);
  }

  async function sair() {
    await cliente_navegador().auth.signOut();
    router.refresh();
    router.push("/entrar");
  }

  if (estado === "carregando") {
    return (
      <Tela largura="estreita">
        <Apoio>Carregando...</Apoio>
      </Tela>
    );
  }

  return (
    <Tela largura="estreita">
      <Titulo>
        {estado === "sem_perfil" ? "Complete seu cadastro" : "Minha conta"}
      </Titulo>
      <Apoio>
        {estado === "sem_perfil"
          ? "Sua conta ja existe. Faltam so estes dados."
          : email}
      </Apoio>

      {erro && <Aviso>{erro}</Aviso>}
      {aviso && <Aviso tom="bom">{aviso}</Aviso>}

      <form onSubmit={salvar} className="mt-4 grid gap-3">
        <Campo
          rotulo="Nome"
          type="text"
          value={nome}
          onChange={(e) => definir_nome(e.target.value)}
          minLength={2}
          required
        />
        <Campo
          rotulo="Telefone"
          type="tel"
          value={telefone}
          onChange={(e) => definir_telefone(e.target.value)}
          placeholder="(21) 99999-9999"
        />

        {estado === "pronto" && (
          <Interruptor
            rotulo="Mostrar meu telefone nos anuncios"
            apoio="Desligado, ninguem ve seu telefone — nem na tela, nem na resposta da API. Nasce desligado (RN-24)."
            checked={telefone_publico}
            onChange={(e) => definir_telefone_publico(e.target.checked)}
          />
        )}

        <Botao type="submit" largo disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar"}
        </Botao>
      </form>

      {estado === "pronto" && (
        <Botao
          aparencia="secundaria"
          largo
          type="button"
          onClick={sair}
          className="mt-3"
        >
          Sair
        </Botao>
      )}
    </Tela>
  );
}
