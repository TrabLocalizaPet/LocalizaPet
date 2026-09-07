"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Marca } from "@/components/marca";
import { Botao } from "@/components/ui/botao";
import { Campo } from "@/components/ui/campo";
import { Apoio, Aviso, Tela, Titulo } from "@/components/ui/tela";
import { cliente_navegador } from "@/lib/auth-navegador";

/**
 * Criar conta (RF-19). Tela "E hora do cadastro!" do Figma.
 *
 * O cadastro sao dois passos em servicos diferentes: o Supabase Auth cria a
 * identidade, e o POST /api/perfil cria o perfil no nosso Postgres. A rota e
 * idempotente, entao um segundo passo que falhe pode ser refeito.
 *
 * **Divergencia conhecida do Figma:** la o cadastro tem uma pergunta por
 * tela. Aqui e um formulario unico. Esta registrado em
 * `docs/07-interface.md` e nao e esquecimento.
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

    const { data, error } = await cliente_navegador().auth.signUp({
      email,
      password: senha,
    });

    if (error) {
      definir_erro(error.message);
      definir_enviando(false);
      return;
    }

    // Com "Confirm email" ligado no painel do Supabase, o cadastro nao
    // devolve sessao. Sem sessao nao da para criar o perfil, entao ele fica
    // para o primeiro acesso, que a pagina /perfil resolve.
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
      <Tela largura="estreita">
        <Titulo>Confirme seu e-mail</Titulo>
        <Aviso tom="bom">
          Enviamos um link para <strong>{email}</strong>. Abra o link e depois
          entre para terminar o cadastro.
        </Aviso>
        <p className="mt-4 text-center text-sm">
          <Link href="/entrar" className="font-semibold text-primaria">
            Ir para o login
          </Link>
        </p>
      </Tela>
    );
  }

  return (
    <Tela largura="estreita">
      <div className="mb-6 flex flex-col items-center text-center">
        <Marca tamanho={64} />
        <Titulo className="mt-3">E hora do cadastro!</Titulo>
        <Apoio>Sao poucos campos, e o telefone so aparece se voce quiser.</Apoio>
      </div>

      {erro && <Aviso>{erro}</Aviso>}

      <form onSubmit={enviar} className="grid gap-3">
        <Campo
          rotulo="Qual o seu nome?"
          type="text"
          value={nome}
          onChange={(e) => definir_nome(e.target.value)}
          autoComplete="name"
          minLength={2}
          required
        />
        <Campo
          rotulo="Telefone (opcional)"
          type="tel"
          value={telefone}
          onChange={(e) => definir_telefone(e.target.value)}
          autoComplete="tel"
          placeholder="(21) 99999-9999"
        />
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
          autoComplete="new-password"
          minLength={6}
          required
        />
        <Botao type="submit" largo disabled={enviando} className="mt-2">
          {enviando ? "Criando..." : "Criar conta"}
        </Botao>
      </form>

      <p className="mt-5 text-center text-sm text-suave">
        Ja tem conta?{" "}
        <Link href="/entrar" className="font-semibold text-primaria">
          Entrar
        </Link>
      </p>
    </Tela>
  );
}
