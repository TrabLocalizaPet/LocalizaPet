"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FormasDeFundo } from "@/components/formas-de-fundo";
import { Botao } from "@/components/ui/botao";
import { CampoDeLinha } from "@/components/ui/campo-de-linha";
import { SetaVoltar } from "@/components/ui/icones";
import { Aviso } from "@/components/ui/tela";
import { cliente_navegador } from "@/lib/auth-navegador";
import type { Intencao } from "@/types/perfil";

/**
 * Cadastro passo a passo (RF-19) — telas "Cadastro" do Figma.
 *
 * Uma pergunta por tela, como no prototipo. Medidas do no 1:1892, sobre o
 * quadro de 390x844: seta em y=44, titulo em y=92 com 326 de largura, campo
 * em y=260 e o botao "Proximo" em y=477.
 *
 * **A conta so e criada no fim.** Os cinco primeiros passos apenas coletam;
 * o `signUp` e a criacao do perfil acontecem depois da senha. Criar a conta
 * no primeiro passo deixaria contas pela metade a cada desistencia.
 *
 * A intencao ("O que te trouxe aqui?") vem depois do sucesso, e e gravada
 * pelo PUT — e o ultimo passo, nao parte do cadastro em si.
 */

type Passo =
  | "intro"
  | "nome"
  | "telefone"
  | "nascimento"
  | "email"
  | "senha"
  | "sucesso"
  | "intencao";

const ORDEM: Passo[] = [
  "intro",
  "nome",
  "telefone",
  "nascimento",
  "email",
  "senha",
];

const INTENCOES: { valor: Intencao; titulo: string; apoio: string }[] = [
  { valor: "perdi_pet", titulo: "Perdi meu pet", apoio: "Quero ajuda para encontra-lo" },
  { valor: "achei_pet", titulo: "Achei um pet perdido", apoio: "Quero encontrar o tutor" },
  { valor: "quero_adotar", titulo: "Quero adotar", apoio: "Quero encontrar um novo amigo" },
  { valor: "quero_doar", titulo: "Quero colocar para adocao", apoio: "Quero encontrar um lar para o pet" },
];

export default function Cadastro() {
  const router = useRouter();
  const [passo, definir_passo] = useState<Passo>("intro");

  const [nome, definir_nome] = useState("");
  const [telefone, definir_telefone] = useState("");
  const [dia, definir_dia] = useState("");
  const [mes, definir_mes] = useState("");
  const [ano, definir_ano] = useState("");
  const [email, definir_email] = useState("");
  const [senha, definir_senha] = useState("");
  const [intencao, definir_intencao] = useState<Intencao | null>(null);

  const [erro, definir_erro] = useState<string | null>(null);
  const [enviando, definir_enviando] = useState(false);

  function voltar() {
    const atual = ORDEM.indexOf(passo);
    if (atual > 0) definir_passo(ORDEM[atual - 1]);
    else router.push("/");
  }

  function avancar() {
    const atual = ORDEM.indexOf(passo);
    definir_passo(ORDEM[atual + 1]);
  }

  /** ISO `AAAA-MM-DD`, ou `null` se a pessoa deixou em branco. */
  function nascimento_iso(): string | null {
    if (!dia || !mes || !ano) return null;
    return `${ano.padStart(4, "0")}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
  }

  async function criar_conta() {
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

    // Com "Confirm email" ligado, o cadastro nao devolve sessao e o perfil
    // fica para o primeiro acesso, que a /perfil resolve.
    if (!data.session) {
      definir_erro(
        "Conta criada. Confirme o e-mail que enviamos e depois entre para terminar.",
      );
      definir_enviando(false);
      return;
    }

    const resposta = await fetch("/api/perfil", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        telefone: telefone || null,
        data_nascimento: nascimento_iso(),
      }),
    });

    if (!resposta.ok) {
      definir_erro("A conta foi criada, mas o perfil nao. Entre e complete o cadastro.");
      definir_enviando(false);
      return;
    }

    definir_enviando(false);
    definir_passo("sucesso");
  }

  async function salvar_intencao() {
    if (!intencao) return;
    definir_enviando(true);

    await fetch("/api/perfil", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intencao }),
    });

    router.refresh();
    // Quem chegou para adotar comeca vendo quem esta para adocao.
    router.push(intencao === "quero_adotar" ? "/animais?tipo=adocao" : "/animais");
  }

  // ---------------------------------------------------------------- intro
  if (passo === "intro") {
    return (
      <Casca>
        <FormasDeFundo />
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <Ilustracao
            arquivo="/ilustracoes/cadastro-intro.png"
            descricao="Tres cachorros brincando"
          />
          <h1 className="mt-8 font-titulo text-2xl leading-tight font-semibold text-escura">
            E hora do cadastro!
          </h1>
          <p className="mt-3 max-w-72 text-sm text-suave">
            Sao apenas alguns passos para voce se cadastrar, e bem rapido.
            Vamos la?
          </p>
        </div>
        <Rodape>
          <Botao largo onClick={() => definir_passo("nome")}>
            Vamos la!
          </Botao>
        </Rodape>
      </Casca>
    );
  }

  // -------------------------------------------------------------- sucesso
  if (passo === "sucesso") {
    return (
      <Casca>
        <FormasDeFundo />
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <Ilustracao
            arquivo="/ilustracoes/cadastro-sucesso.png"
            descricao="Pessoa cumprimentando um cachorro"
          />
          <h1 className="mt-8 font-titulo text-2xl leading-tight font-semibold text-escura">
            Cadastro realizado
            <br />
            com sucesso
          </h1>
          <p className="mt-3 max-w-72 text-sm text-suave">
            Agora vamos configurar o aplicativo especialmente para voce!
          </p>
        </div>
        <Rodape>
          <Botao largo onClick={() => definir_passo("intencao")}>
            Prosseguir
          </Botao>
        </Rodape>
      </Casca>
    );
  }

  // ------------------------------------------------------------- intencao
  if (passo === "intencao") {
    return (
      <Casca>
        <Topo aoVoltar={() => definir_passo("sucesso")} rotulo="Fechar" />
        <div className="flex flex-1 flex-col px-8">
          <h1 className="text-center font-titulo text-xl font-semibold">
            O que te trouxe aqui?
          </h1>

          <ul className="mt-6 grid gap-3">
            {INTENCOES.map((opcao) => {
              const marcada = intencao === opcao.valor;

              return (
                <li key={opcao.valor}>
                  <button
                    type="button"
                    onClick={() => definir_intencao(opcao.valor)}
                    aria-pressed={marcada}
                    className={
                      "relative w-full rounded-[--radius-padrao] border px-4 py-3 text-left transition " +
                      (marcada
                        ? "border-primaria bg-primaria text-white"
                        : "border-borda bg-cartao hover:border-primaria")
                    }
                  >
                    <span className="block text-sm font-semibold">{opcao.titulo}</span>
                    <span
                      className={
                        "block text-sm " + (marcada ? "text-white/85" : "text-suave")
                      }
                    >
                      {opcao.apoio}
                    </span>
                    {marcada && (
                      <span className="absolute top-2 right-2 grid size-5 place-items-center rounded-full bg-white text-xs text-primaria">
                        ✓
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <Rodape>
          <Botao largo disabled={!intencao || enviando} onClick={salvar_intencao}>
            {enviando ? "Salvando..." : "Proximo"}
          </Botao>
        </Rodape>
      </Casca>
    );
  }

  // ------------------------------------------------------- passos com campo
  const PERGUNTAS = {
    nome: {
      titulo: "Qual o seu nome?",
      apoio: "Seu nome ira aparecer junto ao perfil do seu pet!",
      pronto: nome.trim().length >= 2,
    },
    telefone: {
      titulo: "Qual o seu telefone?",
      apoio: "Pode ficar tranquilo! Nao mandaremos mensagens e ligacoes para voce",
      pronto: telefone.trim() !== "",
    },
    nascimento: {
      titulo: "Qual a sua data de nascimento?",
      apoio: null,
      pronto: dia !== "" && mes !== "" && ano.length === 4,
    },
    email: {
      titulo: "Qual o seu email?",
      apoio: "Pode ficar tranquilo! Usaremos apenas para criacao e confirmacao da sua conta.",
      pronto: /.+@.+\..+/.test(email),
    },
    senha: {
      titulo: "Defina sua senha",
      apoio: "*Sua senha deve conter no minimo 8 caracteres.",
      pronto: senha.length >= 8,
    },
  }[passo];

  const ultimo = passo === "senha";

  return (
    <Casca>
      <Topo aoVoltar={voltar} />

      <div className="flex flex-1 flex-col px-8">
        <h1 className="text-center font-titulo text-xl leading-snug font-semibold">
          {PERGUNTAS.titulo}
        </h1>

        {erro && <Aviso>{erro}</Aviso>}

        {/* y=260 num quadro de 844: o campo fica no primeiro terco, acima de
            onde o teclado sobe no celular. */}
        <div className="mt-24 flex justify-center">
          {passo === "nome" && (
            <CampoDeLinha
              apoio={PERGUNTAS.apoio}
              value={nome}
              onChange={(e) => definir_nome(e.target.value)}
              autoComplete="name"
              autoFocus
            />
          )}

          {passo === "telefone" && (
            <CampoDeLinha
              apoio={PERGUNTAS.apoio}
              type="tel"
              inputMode="tel"
              placeholder="(DDD) 00000-0000"
              value={telefone}
              onChange={(e) => definir_telefone(e.target.value)}
              autoComplete="tel"
              autoFocus
            />
          )}

          {/* Tres campos, como no desenho: dia, mes e ano separados. Um campo
              `date` unico traria o seletor do sistema, que e outra tela. */}
          {passo === "nascimento" && (
            <div className="w-full">
              <div className="flex items-end justify-center gap-4">
                <CampoDeLinha
                  aria-label="Dia"
                  inputMode="numeric"
                  maxLength={2}
                  placeholder="06"
                  value={dia}
                  onChange={(e) => definir_dia(e.target.value.replace(/\D/g, ""))}
                  className="w-14"
                  autoFocus
                />
                <CampoDeLinha
                  aria-label="Mes"
                  inputMode="numeric"
                  maxLength={2}
                  placeholder="10"
                  value={mes}
                  onChange={(e) => definir_mes(e.target.value.replace(/\D/g, ""))}
                  className="w-14"
                />
                <CampoDeLinha
                  aria-label="Ano"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="1999"
                  value={ano}
                  onChange={(e) => definir_ano(e.target.value.replace(/\D/g, ""))}
                  className="w-20"
                />
              </div>
            </div>
          )}

          {passo === "email" && (
            <CampoDeLinha
              apoio={PERGUNTAS.apoio}
              type="email"
              inputMode="email"
              placeholder="email@email.com"
              value={email}
              onChange={(e) => definir_email(e.target.value)}
              autoComplete="email"
              autoFocus
            />
          )}

          {passo === "senha" && (
            <CampoDeLinha
              apoio={PERGUNTAS.apoio}
              type="password"
              value={senha}
              onChange={(e) => definir_senha(e.target.value)}
              autoComplete="new-password"
              autoFocus
            />
          )}
        </div>
      </div>

      <Rodape>
        <Botao
          largo
          disabled={!PERGUNTAS.pronto || enviando}
          onClick={ultimo ? criar_conta : avancar}
        >
          {enviando ? "Criando..." : "Proximo"}
        </Botao>

        {passo === "nome" && (
          <p className="mt-4 text-center text-sm text-suave">
            Ja tem conta?{" "}
            <Link href="/entrar" className="font-semibold text-primaria">
              Entrar
            </Link>
          </p>
        )}
      </Rodape>
    </Casca>
  );
}

/* ------------------------------------------------------------------ casca */

function Casca({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative mx-auto flex min-h-dvh max-w-md flex-col">
      {children}
    </main>
  );
}

/** Seta de voltar em y=44, x=28 — a mesma posicao em todas as telas do fluxo. */
function Topo({ aoVoltar, rotulo = "Voltar" }: { aoVoltar: () => void; rotulo?: string }) {
  return (
    <div className="px-7 pt-3">
      <button
        type="button"
        onClick={aoVoltar}
        aria-label={rotulo}
        className="-ml-3 inline-grid size-11 place-items-center text-primaria"
      >
        <SetaVoltar className="size-6" />
      </button>
    </div>
  );
}

/** Botao colado no rodape, como nas telas do desenho. */
function Rodape({ children }: { children: React.ReactNode }) {
  return <div className="mt-auto px-8 pt-6 pb-10">{children}</div>;
}

/**
 * Ilustracao das telas de abertura e sucesso.
 *
 * `dog-paw/amico` e `dog-high-five/amico` no Figma — ambas da biblioteca
 * Storyset. Enquanto o arquivo nao estiver em `public/ilustracoes/`, o
 * espaco fica reservado com a proporcao do desenho (270x268), para o layout
 * nao mudar quando ela chegar.
 */
function Ilustracao({ arquivo, descricao }: { arquivo: string; descricao: string }) {
  const [falhou, definir_falhou] = useState(false);

  return (
    <div className="relative aspect-[270/268] w-[69%]">
      {!falhou && (
        <Image
          src={arquivo}
          alt={descricao}
          fill
          className="object-contain"
          onError={() => definir_falhou(true)}
        />
      )}
    </div>
  );
}
