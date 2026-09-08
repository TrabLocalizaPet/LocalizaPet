"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FormasDeFundo } from "@/components/formas-de-fundo";
import { Botao } from "@/components/ui/botao";
import { Campo } from "@/components/ui/campo";
import { CampoDeSenha } from "@/components/ui/campo-de-senha";
import { SetaVoltar } from "@/components/ui/icones";
import { Aviso } from "@/components/ui/tela";
import { cliente_navegador } from "@/lib/auth-navegador";

/**
 * Entrar na conta (RF-19) — tela "Login" do Figma (no 1:613).
 *
 * Medidas do desenho, sobre o quadro de 390x844:
 *
 *   seta          y=44,  24x24 em x=28
 *   ilustracao    y=104, 437x325 a partir de x=-23 — sangra dos dois lados
 *   E-mail        y=454, 340x64  (Input Group)
 *   Senha         y=534, 340x64
 *   Login         y=622, 339x40
 *   link          y=678, 137x32
 *
 * Os espacos entre eles — 25, 16, 24 e 16 — sao a diferenca entre essas
 * posicoes, e e por isso que o layout usa `gap` em vez de posicao absoluta:
 * mantem as distancias do desenho e ainda acompanha telas de outra altura.
 */
export default function Entrar() {
  const router = useRouter();
  const [email, definir_email] = useState("");
  const [senha, definir_senha] = useState("");
  const [erro, definir_erro] = useState<string | null>(null);
  const [enviando, definir_enviando] = useState(false);

  // No desenho o botao nasce apagado e so acende com os campos preenchidos.
  const pronto = email.trim() !== "" && senha !== "";

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
    router.push("/animais");
  }

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-md flex-col">
      <FormasDeFundo conjunto="login" />

      <div className="px-7 pt-3">
        <Link
          href="/"
          aria-label="Voltar"
          className="inline-grid size-11 place-items-center -ml-3 text-primaria"
        >
          <SetaVoltar className="size-6" />
        </Link>
      </div>

      {/* 437 de largura num quadro de 390: a ilustracao sangra 23 px de cada
          lado. `-mx-6` reproduz isso sem estourar a rolagem horizontal. */}
      <div className="relative -mx-6 mt-2 aspect-[437/325]">
        <Image
          src="/ilustracoes/ilustracao-login.png"
          alt=""
          fill
          priority
          sizes="28rem"
          className="object-contain"
        />
      </div>

      <form onSubmit={enviar} className="mt-6 flex flex-1 flex-col px-6">
        {erro && <Aviso>{erro}</Aviso>}

        <div className="grid gap-4">
          <Campo
            rotulo="E-mail"
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => definir_email(e.target.value)}
            autoComplete="email"
            required
          />

          <CampoDeSenha
            rotulo="Senha"
            placeholder="Senha"
            value={senha}
            onChange={(e) => definir_senha(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <Botao type="submit" largo disabled={!pronto || enviando} className="mt-6">
          {enviando ? "Entrando..." : "Login"}
        </Botao>

        <Link
          href="/animais"
          className="mt-4 py-1 text-center text-sm font-semibold text-primaria"
        >
          Entrar sem cadastro
        </Link>

        <p className="mt-auto py-6 text-center text-sm text-suave">
          Ainda nao tem conta?{" "}
          <Link href="/cadastro" className="font-semibold text-primaria">
            Cadastre-se
          </Link>
        </p>
      </form>
    </main>
  );
}
