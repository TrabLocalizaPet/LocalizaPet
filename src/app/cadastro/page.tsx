"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { cliente_navegador } from "@/lib/auth-navegador";

/**
 * Criar conta (RF-19).
 *
 * O cadastro sao dois passos em servicos diferentes: o Supabase Auth cria a
 * identidade, e o POST /api/perfil cria o perfil no nosso Postgres. A rota e
 * idempotente, entao um segundo passo que falhe pode ser refeito sem
 * esbarrar em chave duplicada.
 *
 * O Figma desenha este cadastro em varios passos, uma pergunta por tela. Aqui
 * ele e um formulario unico — a divisao em passos e apresentacao, e entra
 * quando as telas do app forem montadas. O que a F-03 precisa provar e que a
 * conta e o perfil nascem juntos.
 */
export default function Cadastro() {
  const router = useRouter();
  const [nome, definir_nome] = useState("");
  const [telefone, definir_telefone] = useState("");
  const [email, definir_email] = useState("");
  const [senha, definir_senha] = useState("");
  const [erro, definir_erro] = useState<string | null>(null);
  const [confirmar_email, definir_confirmar_email] = useState(false);
  const [enviando, definir_enviando] = useState(false);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    definir_erro(null);
    definir_enviando(true);

    const supabase = cliente_navegador();
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    if (error) {
      definir_erro(error.message);
      definir_enviando(false);
      return;
    }

    // Com "Confirm email" ligado no painel do Supabase, o cadastro nao devolve
    // sessao — a conta so vale depois do clique no e-mail. Sem sessao nao da
    // para criar o perfil, entao ele fica para o primeiro acesso, que a
    // pagina /perfil resolve.
    if (!data.session) {
      definir_confirmar_email(true);
      definir_enviando(false);
      return;
    }

    const resposta = await fetch("/api/perfil", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, telefone: telefone || null }),
    });

    if (!resposta.ok) {
      definir_erro(
        "A conta foi criada, mas o perfil nao. Entre e complete o cadastro.",
      );
      definir_enviando(false);
      return;
    }

    router.refresh();
    router.push("/perfil");
  }

  if (confirmar_email) {
    return (
      <main className="conta">
        <h1>Confirme seu e-mail</h1>
        <p className="aviso bom">
          Enviamos um link para <strong>{email}</strong>. Abra o link e depois
          entre para terminar o cadastro.
        </p>
        <p className="alternativa">
          <Link href="/entrar">Ir para o login</Link>
        </p>
      </main>
    );
  }

  return (
    <main className="conta">
      <h1>E hora do cadastro!</h1>
      <p className="apoio">
        Sao poucos campos, e o telefone so aparece se voce quiser.
      </p>

      {erro && <p className="aviso">{erro}</p>}

      <form onSubmit={enviar}>
        <label className="campo">
          <span>Qual o seu nome?</span>
          <input
            type="text"
            value={nome}
            onChange={(e) => definir_nome(e.target.value)}
            autoComplete="name"
            minLength={2}
            required
          />
        </label>

        <label className="campo">
          <span>Telefone (opcional)</span>
          <input
            type="tel"
            value={telefone}
            onChange={(e) => definir_telefone(e.target.value)}
            autoComplete="tel"
            placeholder="(21) 99999-9999"
          />
        </label>

        <label className="campo">
          <span>E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => definir_email(e.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="campo">
          <span>Senha</span>
          <input
            type="password"
            value={senha}
            onChange={(e) => definir_senha(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>

        <button className="botao" type="submit" disabled={enviando}>
          {enviando ? "Criando..." : "Criar conta"}
        </button>
      </form>

      <p className="alternativa">
        Ja tem conta? <Link href="/entrar">Entrar</Link>
      </p>
    </main>
  );
}
