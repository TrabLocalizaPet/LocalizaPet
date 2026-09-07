"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Marca } from "@/components/marca";
import { Botao } from "@/components/ui/botao";
import { Campo } from "@/components/ui/campo";
import { Apoio, Aviso, Tela, Titulo } from "@/components/ui/tela";
import { cliente_navegador } from "@/lib/auth-navegador";

/** Entrar na conta (RF-19). Tela "Login" do Figma. */
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
    <Tela largura="estreita">
      <div className="mb-6 flex flex-col items-center text-center">
        <Marca tamanho={72} />
        <Titulo className="mt-3">Conecte coracoes.</Titulo>
        <Apoio>Reencontre historias.</Apoio>
      </div>

      {erro && <Aviso>{erro}</Aviso>}

      <form onSubmit={enviar} className="grid gap-3">
        <Campo
          rotulo="E-mail"
          type="email"
          value={email}
          onChange={(e) => definir_email(e.target.value)}
          autoComplete="email"
          required
        />
        <Campo
          rotulo="Senha"
          type="password"
          value={senha}
          onChange={(e) => definir_senha(e.target.value)}
          autoComplete="current-password"
          required
        />
        <Botao type="submit" largo disabled={enviando} className="mt-2">
          {enviando ? "Entrando..." : "Entrar"}
        </Botao>
      </form>

      <p className="mt-5 text-center text-sm text-suave">
        Ainda nao tem conta?{" "}
        <Link href="/cadastro" className="font-semibold text-primaria">
          Cadastre-se
        </Link>
      </p>
    </Tela>
  );
}
