"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { FormasDeFundo } from "@/components/formas-de-fundo";
import {
  Casca,
  Ilustracao,
  ListaDeOpcoes,
  OpcaoDeLista,
  TituloDoPasso,
  Topo,
} from "@/components/passo";
import { Botao } from "@/components/ui/botao";
import { CampoDeLinha } from "@/components/ui/campo-de-linha";
import { Aviso } from "@/components/ui/tela";
import { mensagem_de_auth } from "@/lib/auth-mensagens";
import { cliente_navegador } from "@/lib/auth-navegador";
import {
  data_de_nascimento,
  digitos_ate,
  email_plausivel,
  mascara_telefone,
  telefone_completo,
} from "@/lib/mascaras";
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
 *
 * **O grafismo do fundo aparece so na abertura e na tela de sucesso.** As
 * telas de pergunta e a de intencao sao brancas: elas tem uma pergunta so no
 * meio do vazio, e a mancha competiria com ela.
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

  /**
   * Os tres campos da data conversam entre si: completou o dia, o foco vai
   * para o mes; completou o mes, vai para o ano; apagou com o campo ja vazio,
   * volta para o anterior.
   *
   * No celular isso e a diferenca entre digitar oito numeros e digitar oito
   * numeros parando duas vezes para acertar o dedo no campo seguinte.
   */
  const campo_dia = useRef<HTMLInputElement>(null);
  const campo_mes = useRef<HTMLInputElement>(null);
  const campo_ano = useRef<HTMLInputElement>(null);

  /** Backspace num campo vazio devolve o foco ao anterior, sem apagar nada
   *  la: quem voltou quer ver o que escreveu antes de mexer. */
  function ao_apagar_vazio(
    evento: React.KeyboardEvent<HTMLInputElement>,
    valor: string,
    anterior: React.RefObject<HTMLInputElement | null>,
  ) {
    if (evento.key === "Backspace" && valor === "") {
      evento.preventDefault();
      anterior.current?.focus();
    }
  }

  function voltar() {
    const atual = ORDEM.indexOf(passo);
    if (atual > 0) definir_passo(ORDEM[atual - 1]);
    else router.push("/");
  }

  function avancar() {
    const atual = ORDEM.indexOf(passo);
    definir_passo(ORDEM[atual + 1]);
  }

  /**
   * `AAAA-MM-DD`, ou `null` se os tres campos nao formam uma data que
   * existe. Em branco tambem da `null` — a coluna aceita (`002_`).
   */
  const nascimento = data_de_nascimento(dia, mes, ano);

  async function criar_conta() {
    definir_erro(null);
    definir_enviando(true);

    const { data, error } = await cliente_navegador().auth.signUp({
      email,
      password: senha,
    });

    if (error) {
      definir_erro(mensagem_de_auth(error));
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
        data_nascimento: nascimento,
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
        {/* Sem a seta nao ha volta para as boas-vindas: a tela e a entrada do
            fluxo, e quem entrou por engano ficaria preso. */}
        <Topo aoVoltar={() => router.push("/")} />

        {/* Alturas do desenho: ilustracao em y=179 de 844, titulo em y=471,
            apoio em y=559 e botao em y=625. Descontando a seta (56 px), o
            primeiro espaco e 14dvh em vez de 21dvh. */}
        <div className="flex flex-col items-center px-8 text-center">
          <Ilustracao
            arquivo="/ilustracoes/inicio-cadastro.png"
            descricao="Dois cachorros sentados lado a lado"
            className="mt-[14dvh]"
          />
          <h1 className="mt-[3dvh] font-titulo text-2xl leading-tight font-semibold text-escura">
            E hora do cadastro!
          </h1>
          <p className="mt-[1dvh] max-w-72 text-sm text-suave">
            Sao apenas alguns passos para voce se cadastrar, e bem rapido.
            Vamos la?
          </p>
        </div>

        <div className="mt-[3dvh] px-8">
          <Botao largo onClick={() => definir_passo("nome")}>
            Vamos la!
          </Botao>
        </div>
      </Casca>
    );
  }

  // -------------------------------------------------------------- sucesso
  if (passo === "sucesso") {
    return (
      <Casca>
        <FormasDeFundo />
        {/* Sem seta de proposito: a conta ja existe, e voltar para o passo da
            senha nao desfaz nada — so confundiria. */}
        <div className="flex flex-col items-center px-8 text-center">
          <Ilustracao
            arquivo="/ilustracoes/ilustracao-cadastro-final.png"
            descricao="Pessoa cumprimentando um cachorro"
            className="mt-[21dvh]"
          />
          <h1 className="mt-[3dvh] font-titulo text-2xl leading-tight font-semibold text-escura">
            Cadastro realizado
            <br />
            com sucesso
          </h1>
          <p className="mt-[1dvh] max-w-72 text-sm text-suave">
            Agora vamos configurar o aplicativo especialmente para voce!
          </p>
        </div>

        <div className="mt-[3dvh] px-8">
          <Botao largo onClick={() => definir_passo("intencao")}>
            Prosseguir
          </Botao>
        </div>
      </Casca>
    );
  }

  // ------------------------------------------------------------- intencao
  if (passo === "intencao") {
    return (
      <Casca>
        <Topo aoVoltar={() => definir_passo("sucesso")} rotulo="Fechar" />

        <TituloDoPasso tamanho="normal">O que te trouxe aqui?</TituloDoPasso>

        <ListaDeOpcoes>
          {INTENCOES.map((opcao) => (
            <li key={opcao.valor}>
              <OpcaoDeLista
                rotulo={opcao.titulo}
                apoio={opcao.apoio}
                marcada={intencao === opcao.valor}
                onClick={() => definir_intencao(opcao.valor)}
              />
            </li>
          ))}
        </ListaDeOpcoes>
        {/* Aqui o botao fica mesmo perto do rodape: a lista de opcoes ocupa
            o meio da tela e o "Proximo" fecha a escolha embaixo. */}
        <div className="mt-auto px-8 pb-10">
          <Botao largo disabled={!intencao || enviando} onClick={salvar_intencao}>
            {enviando ? "Salvando..." : "Proximo"}
          </Botao>
        </div>
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
      pronto: telefone_completo(telefone),
    },
    nascimento: {
      titulo: "Qual a sua data de nascimento?",
      apoio: null,
      pronto: nascimento !== null,
    },
    email: {
      titulo: "Qual o seu email?",
      apoio: "Pode ficar tranquilo! Usaremos apenas para criacao e confirmacao da sua conta.",
      pronto: email_plausivel(email),
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

      {/* Posicoes do desenho, em proporcao da altura da tela: titulo em
          y=92 de 844, campo em y=260, botao em y=477. Somando a seta (56) com
          4dvh, 16.5dvh e 16.5dvh, os tres caem em 90, 258 e 476 numa tela de
          844 — dentro de 2 px do desenho, e proporcional em telas de outra
          altura.

          Em `dvh` e nao em `%` porque margem em porcentagem no CSS se mede
          pela **largura** do bloco, nao pela altura: com `%` tudo ficaria
          amontoado no topo. */}
      <TituloDoPasso tamanho="normal">{PERGUNTAS.titulo}</TituloDoPasso>

      <div className="flex flex-col px-8">
        {erro && <Aviso>{erro}</Aviso>}

        <div className="mt-[16.5dvh] flex justify-center">
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
              /* A mascara reescreve o valor a cada tecla, entao o campo
                 aceita texto colado e numero digitado do mesmo jeito. O
                 `maxLength` e o do formato completo, 15 caracteres. */
              onChange={(e) => definir_telefone(mascara_telefone(e.target.value))}
              maxLength={15}
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
                  ref={campo_dia}
                  aria-label="Dia"
                  inputMode="numeric"
                  maxLength={2}
                  placeholder="06"
                  value={dia}
                  onChange={(e) => {
                    const novo = digitos_ate(e.target.value, 2);
                    definir_dia(novo);
                    if (novo.length === 2) campo_mes.current?.focus();
                  }}
                  className="w-14"
                  autoFocus
                />
                <CampoDeLinha
                  ref={campo_mes}
                  aria-label="Mes"
                  inputMode="numeric"
                  maxLength={2}
                  placeholder="10"
                  value={mes}
                  onChange={(e) => {
                    const novo = digitos_ate(e.target.value, 2);
                    definir_mes(novo);
                    if (novo.length === 2) campo_ano.current?.focus();
                  }}
                  onKeyDown={(e) => ao_apagar_vazio(e, mes, campo_dia)}
                  className="w-14"
                />
                <CampoDeLinha
                  ref={campo_ano}
                  aria-label="Ano"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="1999"
                  value={ano}
                  onChange={(e) => definir_ano(digitos_ate(e.target.value, 4))}
                  onKeyDown={(e) => ao_apagar_vazio(e, ano, campo_mes)}
                  className="w-20"
                />
              </div>

              {/* Sem esta linha o unico sinal de 31/02 seria o botao
                  continuar apagado, e quem digitou nao saberia por que. */}
              {dia !== "" && mes !== "" && ano.length === 4 && nascimento === null && (
                <p className="mt-3 text-center text-xs text-suave">
                  Essa data nao existe. Confira o dia, o mes e o ano.
                </p>
              )}
            </div>
          )}

          {/* A conferencia acontece enquanto se digita, e nao no envio: so o
              passo seguinte e a senha, e descobrir o e-mail errado depois de
              criar a conta significa confirmacao que nunca chega.

              O espaco e tirado na entrada porque e-mail colado do WhatsApp ou
              do bloco de notas quase sempre vem com um sobrando, e o erro
              resultante nao tem como ser visto na tela. */}
          {passo === "email" && (
            <CampoDeLinha
              apoio={
                email !== "" && !email_plausivel(email)
                  ? "Confira: falta o @ ou o final do endereco (.com, .br)."
                  : PERGUNTAS.apoio
              }
              type="email"
              inputMode="email"
              placeholder="email@email.com"
              value={email}
              onChange={(e) => definir_email(e.target.value.trim())}
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

      {/* Botao em y=477 de 844 — 57% da altura, nao colado no rodape. No
          celular e onde ele fica logo acima do teclado. */}
      <div className="mt-[16.5dvh] px-8">
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
      </div>
    </Casca>
  );
}
