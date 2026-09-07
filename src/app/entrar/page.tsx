"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { cliente_navegador } from "@/lib/auth-navegador";

/** Entrar na conta (RF-19). */
export default function Entrar() {
  const router = useRouter();
  const [email, definir_email] = useState("");
  const [senha, definir_senha] = useState("");
  const [erro, definir_erro] = useState<string | null>(null);
  const [enviando, definir_enviando] = useState(false);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    definir_erro(null);
    definir_enviando(true);

    const { error } = await cliente_navegador().auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      // Mensagem unica de proposito: dizer "esse e-mail nao existe" contaria
      // a um estranho quem tem conta aqui.
      definir_erro("E-mail ou senha incorretos.");
      definir_enviando(false);
      return;
    }

    // refresh() antes de navegar: os Server Components precisam enxergar o
    // cookie de sessao que a biblioteca acabou de gravar.
    router.refresh();
    router.push("/perfil");
  }

  return (
    <main className="conta">
      <h1>Entrar</h1>
      <p className="apoio">Conecte coracoes. Reencontre historias.</p>

      {erro && <p className="aviso">{erro}</p>}

      <form onSubmit={enviar}>
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
            autoComplete="current-password"
            required
          />
        </label>

        <button className="botao" type="submit" disabled={enviando}>
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="alternativa">
        Ainda nao tem conta? <Link href="/cadastro">Cadastre-se</Link>
      </p>
    </main>
  );
}
