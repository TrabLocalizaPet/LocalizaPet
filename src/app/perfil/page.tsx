"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { cliente_navegador } from "@/lib/auth-navegador";
import type { Perfil } from "@/types/perfil";

type Estado = "carregando" | "sem_perfil" | "pronto";

/**
 * Minha conta (RF-19, RF-20).
 *
 * Tres situacoes possiveis, e a terceira e a que costuma ser esquecida:
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

      if (resposta.status === 401) {
        router.replace("/entrar");
        return;
      }

      if (resposta.status === 404) {
        definir_estado("sem_perfil");
        return;
      }

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
      <main className="conta">
        <p className="apoio">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="conta">
      <h1>{estado === "sem_perfil" ? "Complete seu cadastro" : "Minha conta"}</h1>
      <p className="apoio">
        {estado === "sem_perfil"
          ? "Sua conta ja existe. Faltam so estes dados."
          : email}
      </p>

      {erro && <p className="aviso">{erro}</p>}
      {aviso && <p className="aviso bom">{aviso}</p>}

      <form onSubmit={salvar}>
        <label className="campo">
          <span>Nome</span>
          <input
            type="text"
            value={nome}
            onChange={(e) => definir_nome(e.target.value)}
            minLength={2}
            required
          />
        </label>

        <label className="campo">
          <span>Telefone</span>
          <input
            type="tel"
            value={telefone}
            onChange={(e) => definir_telefone(e.target.value)}
            placeholder="(21) 99999-9999"
          />
        </label>

        {estado === "pronto" && (
          <label className="interruptor">
            <input
              type="checkbox"
              checked={telefone_publico}
              onChange={(e) => definir_telefone_publico(e.target.checked)}
            />
            <span>
              Mostrar meu telefone nos anuncios
              <span className="explica">
                Desligado, ninguem ve seu telefone — nem na tela, nem na
                resposta da API. Nasce desligado (RN-24).
              </span>
            </span>
          </label>
        )}

        <button className="botao" type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar"}
        </button>
      </form>

      {estado === "pronto" && (
        <p className="alternativa">
          <button className="botao secundario" type="button" onClick={sair}>
            Sair
          </button>
        </p>
      )}
    </main>
  );
}
