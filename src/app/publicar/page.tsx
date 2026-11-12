"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AvisoDeContato } from "@/components/aviso-de-contato";
import { BotaoDeLocalizacao } from "@/components/botao-de-localizacao";
import {
  Casca,
  Ilustracao,
  ListaDeOpcoes,
  OpcaoDeLista,
  TituloDoPasso,
  Topo,
} from "@/components/passo";
import { SeletorDeFotos } from "@/components/seletor-de-fotos";
import { Botao, BotaoLink } from "@/components/ui/botao";
import { Campo, CampoLongo, Selecao } from "@/components/ui/campo";
import { CampoDeLinha } from "@/components/ui/campo-de-linha";
import { Aviso } from "@/components/ui/tela";
import { entrar_e_voltar } from "@/lib/destino";
import { CENTRO_PADRAO } from "@/lib/geo";
import { useMinhaLocalizacao } from "@/lib/geolocalizacao";
import { digitos_ate } from "@/lib/mascaras";
import type { Especie, Porte, Sexo, TipoDeAnuncio } from "@/types/animal";

const Mapa = dynamic(() => import("@/components/mapa"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center text-sm text-suave">
      Carregando o mapa...
    </div>
  ),
});

/**
 * Publicar anuncio (RF-01, RF-02, RF-03) — fluxo "Cadastro do pet" do Figma,
 * uma pergunta por tela (nos 1:1624, 1:1922, 1:2132, 1:2162, 1:2190, 1:2877
 * e 1:1053).
 *
 * Era um formulario unico de rolagem longa. Virou passo a passo porque e o
 * que o desenho pede, e porque a pessoa que acabou de perder o animal chega
 * aqui no celular, na rua: uma pergunta de cada vez pede menos dela.
 *
 * **O anuncio so e criado no fim**, como no cadastro da pessoa. Os passos
 * apenas coletam; o `POST` acontece depois do local. Criar antes deixaria
 * anuncio pela metade a cada desistencia — e anuncio de perdido sem local
 * nem passa pela RN-03.
 *
 * **Tres diferencas do desenho, todas por causa do modelo de dados**
 * (`docs/04-modelo-dados.md`):
 *
 * - **a especie "Ave" nao existe** no `CHECK especie_conhecida`; o desenho a
 *   mostra, o schema tem `cachorro`, `gato` e `outro`
 * - **nao ha tela de raca.** Texto livre nao entrou no modelo, e inventar a
 *   coluna aqui seria decidir sozinho o que o grupo nao decidiu
 * - **porte, cor, idade e descricao** existem no schema e nenhuma tela do
 *   Figma os pergunta. Ficaram juntos num passo so de "detalhes", todos
 *   opcionais, em vez de virarem quatro telas que o desenho nao tem
 *
 * O tipo do anuncio tambem nao e perguntado no desenho — la ele vem da
 * intencao escolhida no cadastro. Aqui e o primeiro passo: `tipo_anuncio` e
 * `NOT NULL` (RN-02) e a intencao e preferencia, nao decide o anuncio
 * (ver `migrations/002_perfil_do_cadastro.sql`).
 */

type Passo =
  | "intro"
  | "tipo"
  | "nome"
  | "especie"
  | "sexo"
  | "detalhes"
  | "foto"
  | "local"
  | "sucesso";

const ORDEM: Passo[] = [
  "intro",
  "tipo",
  "nome",
  "especie",
  "sexo",
  "detalhes",
  "foto",
  "local",
];

const TIPOS: { tipo: TipoDeAnuncio; titulo: string; apoio: string }[] = [
  { tipo: "perdido", titulo: "Perdi meu pet", apoio: "Quero ajuda para encontra-lo" },
  { tipo: "encontrado", titulo: "Achei um pet perdido", apoio: "Quero encontrar o tutor" },
  { tipo: "adocao", titulo: "Quero colocar para adocao", apoio: "Quero encontrar um lar para o pet" },
];

const ESPECIES: { valor: Especie; rotulo: string }[] = [
  { valor: "cachorro", rotulo: "Cachorro" },
  { valor: "gato", rotulo: "Gato" },
  { valor: "outro", rotulo: "Outros" },
];

const SEXOS: { valor: Sexo; rotulo: string }[] = [
  { valor: "macho", rotulo: "Macho" },
  { valor: "femea", rotulo: "Femea" },
];

export default function Publicar() {
  const router = useRouter();

  const [passo, definir_passo] = useState<Passo>("intro");

  const [tipo, definir_tipo] = useState<TipoDeAnuncio | null>(null);
  const [nome, definir_nome] = useState("");
  const [especie, definir_especie] = useState<Especie | null>(null);
  const [sexo, definir_sexo] = useState<Sexo | null>(null);
  const [porte, definir_porte] = useState<Porte | "">("");
  const [cor, definir_cor] = useState("");
  const [anos, definir_anos] = useState("");
  const [meses, definir_meses] = useState("");
  const [descricao, definir_descricao] = useState("");
  const [fotos, definir_fotos] = useState<{ chave: string; previa: string }[]>([]);
  const [local, definir_local] = useState<[number, number] | null>(null);
  const [centro, definir_centro] = useState<[number, number]>(CENTRO_PADRAO);
  const localizacao = useMinhaLocalizacao();

  const [criado_id, definir_criado_id] = useState<string | null>(null);
  const [erro, definir_erro] = useState<string | null>(null);
  const [enviando, definir_enviando] = useState(false);

  // Publicar exige sessao **e perfil**. A rota tambem confere — aqui e so
  // para nao deixar a pessoa percorrer os passos todos antes de descobrir.
  // O 404 e a conta sem perfil (cadastro parado entre os dois passos): o
  // anuncio precisa de um autor em `perfis`, e a /perfil termina o cadastro.
  useEffect(() => {
    fetch("/api/perfil").then((r) => {
      if (r.status === 401) router.replace(entrar_e_voltar("/publicar"));
      if (r.status === 404) router.replace("/perfil");
    });
  }, [router]);

  // `?tipo=` e o fim do cadastro dizendo o que a pessoa veio fazer ("Achei
  // um pet", "Quero colocar para adocao"). Perguntar de novo na tela
  // seguinte seria repetir a pergunta que ela acabou de responder; o tipo ja
  // vem marcado e o passo dele fica para tras, a uma seta de distancia.
  // Lido de `window.location` pelo mesmo motivo da Home (sem Suspense).
  useEffect(() => {
    const pedido = new URLSearchParams(window.location.search).get("tipo");
    if (TIPOS.some((opcao) => opcao.tipo === pedido)) {
      definir_tipo(pedido as TipoDeAnuncio);
      definir_passo("nome");
    }
  }, []);

  const exige_local = tipo === "perdido" || tipo === "encontrado";

  function voltar() {
    const atual = ORDEM.indexOf(passo);
    if (atual > 0) definir_passo(ORDEM[atual - 1]);
    else router.push("/animais");
  }

  function avancar() {
    definir_passo(ORDEM[ORDEM.indexOf(passo) + 1]);
  }

  function idade_em_meses(): number | null {
    if (anos === "" && meses === "") return null;
    return (anos === "" ? 0 : Number(anos)) * 12 + (meses === "" ? 0 : Number(meses));
  }

  /**
   * A idade cabe na RN-05 (0 a 399 meses) e os meses fecham um ano?
   *
   * Conferido no proprio passo, e nao so na rota: 33 anos e 4 meses ja sao
   * 400, e sem isto a pessoa so descobria no "Publicar", tres telas depois,
   * com uma mensagem que nao dizia qual campo estava errado.
   */
  const idade = idade_em_meses();
  const idade_valida =
    (meses === "" || Number(meses) <= 11) && (idade === null || idade <= 399);

  async function publicar() {
    definir_erro(null);

    // RN-03 conferida antes de enviar, para dizer o que falta em vez de
    // receber um 422 generico. A rota confere de novo — esta e conveniencia,
    // nao a garantia.
    if (exige_local && !local) {
      definir_erro("Marque no mapa onde o animal foi visto pela ultima vez.");
      return;
    }

    definir_enviando(true);

    // Sem rede o `fetch` lanca em vez de responder. Sem o `catch`, o botao
    // ficava em "Publicando..." desabilitado para sempre, e a pessoa — na
    // rua, com sinal ruim — perdia tudo o que tinha preenchido.
    const resposta = await fetch("/api/animais", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo_anuncio: tipo,
        nome: nome || null,
        especie,
        sexo,
        porte: porte || null,
        cor: cor || null,
        idade_meses: idade_em_meses(),
        descricao: descricao || null,
        local: local ? { lat: local[0], lng: local[1] } : null,
        // So as chaves: os arquivos ja estao no R2, enviados direto pelo
        // navegador. A ordem define a capa.
        fotos: fotos.map((f) => f.chave),
      }),
    }).catch(() => null);

    if (!resposta) {
      definir_erro("Sem conexao. Confira a internet e toque em Publicar de novo.");
      definir_enviando(false);
      return;
    }

    if (resposta.status === 401) return router.replace(entrar_e_voltar("/publicar"));
    if (resposta.status === 409) return router.replace("/perfil");

    if (!resposta.ok) {
      definir_erro("Nao foi possivel publicar. Confira os campos.");
      definir_enviando(false);
      return;
    }

    const { id } = await resposta.json();
    definir_criado_id(id);
    definir_enviando(false);
    definir_passo("sucesso");
  }

  // ---------------------------------------------------------------- intro
  if (passo === "intro") {
    return (
      <Casca>
        <Topo aoVoltar={() => router.push("/animais")} />

        <div className="flex flex-col items-center px-8 text-center">
          <Ilustracao
            arquivo="/ilustracoes/inicio-cadastro-pet.png"
            descricao="Um cachorro e um gato lado a lado"
            className="mt-[12dvh]"
          />
          <h1 className="mt-[3dvh] font-titulo text-2xl leading-tight font-medium text-escura">
            Cadastro do pet!
          </h1>
          <p className="mt-[1dvh] max-w-80 text-sm text-suave">
            Se voce perdeu, encontrou ou quer colocar um pet para adocao, conte
            pra gente os detalhes. Assim conseguimos ajudar mais rapido!
          </p>
        </div>

        <div className="mt-[3dvh] grid gap-3 px-8">
          <Botao largo onClick={avancar}>
            Vamos la!
          </Botao>
          {/* O atalho de quem nao tem tempo para oito telas: o pet acabou de
              fugir e o aviso precisa sair agora. */}
          <BotaoLink href="/alerta" aparencia="secundaria" largo>
            Meu pet acabou de fugir
          </BotaoLink>
        </div>
      </Casca>
    );
  }

  // -------------------------------------------------------------- sucesso
  if (passo === "sucesso") {
    return (
      <Casca>
        {/* Sem seta: o anuncio ja existe, e voltar ao passo do local nao
            desfaz nada — so confundiria. */}
        <div className="flex flex-col items-center px-8 text-center">
          <Ilustracao
            arquivo="/ilustracoes/ilustracao-cadastro-final.png"
            descricao="Pessoa cumprimentando um cachorro"
            className="mt-[18dvh]"
          />
          <h1 className="mt-[3dvh] font-titulo text-2xl leading-tight font-medium text-escura">
            Pet cadastrado
            <br />
            com sucesso!
          </h1>
          <p className="mt-[1dvh] max-w-72 text-sm text-suave">
            {
              {
                perdido: "O anuncio ja aparece no mapa e na lista. Tomara que ele volte logo!",
                encontrado: "O anuncio ja aparece no mapa e na lista para o tutor encontrar.",
                adocao: "O anuncio ja aparece na lista para quem quer adotar.",
              }[tipo ?? "perdido"]
            }
          </p>
        </div>

        <div className="mt-[3dvh] px-8">
          <Botao largo onClick={() => router.push(`/animais/${criado_id}`)}>
            Ver o anuncio
          </Botao>
        </div>
      </Casca>
    );
  }

  // --------------------------------------------------------- passos do meio
  /**
   * O que cada passo pergunta e o que ele exige para liberar o "Proximo".
   *
   * Quase tudo e opcional, e de proposito: RN-04 (nome), e o resto so existe
   * no schema como coluna que aceita nulo. O que trava e `tipo_anuncio`,
   * `especie` — as duas colunas `NOT NULL` — e o local, por RN-03.
   */
  const PERGUNTA = {
    tipo: { titulo: "O que te trouxe aqui?", apoio: null, pronto: tipo !== null },
    nome: {
      // RN-04: quem acha um animal na rua nao sabe o nome — e a pergunta
      // escrita para o dono fazia parecer que era obrigatorio.
      titulo: tipo === "encontrado" ? "Sabe o nome do pet?" : "Qual o nome do pet?",
      apoio:
        tipo === "encontrado"
          ? "Se a coleira tiver um nome, escreva aqui. Se nao, pode seguir sem responder."
          : "Esse nome ira aparecer junto ao perfil do seu pet!",
      pronto: true,
    },
    especie: {
      titulo: "Qual e a especie do pet?",
      apoio: null,
      pronto: especie !== null,
    },
    sexo: {
      titulo: "Qual o sexo do pet?",
      apoio: "Se nao souber, pode seguir sem responder.",
      pronto: true,
    },
    detalhes: {
      titulo: "Mais alguma coisa sobre ele?",
      apoio: "Tudo aqui e opcional, mas ajuda quem for reconhecer o pet.",
      pronto: idade_valida,
    },
    foto: {
      titulo: "Hora da foto do pet!",
      apoio: "Capricha! Essa foto ira aparecer no perfil para identificar o pet.",
      pronto: true,
    },
    local: {
      titulo: {
        perdido: "Onde o pet foi visto pela ultima vez?",
        encontrado: "Onde voce encontrou o pet?",
        adocao: "Aonde esse pet se encontra?",
      }[tipo ?? "perdido"],
      apoio: {
        perdido: "Precisamos saber a ultima localizacao para ajudar na busca do pet.",
        encontrado: "E por perto daqui que o tutor vai procurar.",
        adocao: "Opcional para adocao, mas e assim que te encontram por perto.",
      }[tipo ?? "perdido"],
      pronto: !exige_local || local !== null,
    },
  }[passo];

  const ultimo = passo === "local";

  return (
    <Casca>
      <Topo aoVoltar={voltar} />

      <TituloDoPasso apoio={PERGUNTA.apoio}>{PERGUNTA.titulo}</TituloDoPasso>

      {erro && (
        <div className="px-8">
          <Aviso>{erro}</Aviso>
        </div>
      )}

      {/* ------------------------------------------------------------ tipo */}
      {passo === "tipo" && (
        <ListaDeOpcoes>
          {TIPOS.map((opcao) => (
            <li key={opcao.tipo}>
              <OpcaoDeLista
                rotulo={opcao.titulo}
                apoio={opcao.apoio}
                marcada={tipo === opcao.tipo}
                onClick={() => definir_tipo(opcao.tipo)}
              />
            </li>
          ))}
        </ListaDeOpcoes>
      )}

      {/* ------------------------------------------------------------ nome */}
      {passo === "nome" && (
        <div className="mt-[14dvh] px-8">
          <CampoDeLinha
            aria-label="Nome do pet"
            value={nome}
            onChange={(e) => definir_nome(e.target.value)}
            maxLength={80}
            placeholder="Maggie"
            autoFocus
          />
        </div>
      )}

      {/* --------------------------------------------------------- especie */}
      {passo === "especie" && (
        <ListaDeOpcoes>
          {ESPECIES.map((opcao) => (
            <li key={opcao.valor}>
              <OpcaoDeLista
                rotulo={opcao.rotulo}
                marcada={especie === opcao.valor}
                onClick={() => definir_especie(opcao.valor)}
              />
            </li>
          ))}
        </ListaDeOpcoes>
      )}

      {/* ------------------------------------------------------------ sexo */}
      {passo === "sexo" && (
        <ListaDeOpcoes>
          {SEXOS.map((opcao) => (
            <li key={opcao.valor}>
              <OpcaoDeLista
                rotulo={opcao.rotulo}
                // Clicar de novo desmarca: `sexo` aceita nulo no schema, e
                // "nao sei" e a resposta certa de quem achou o animal na rua.
                marcada={sexo === opcao.valor}
                onClick={() =>
                  definir_sexo(sexo === opcao.valor ? null : opcao.valor)
                }
              />
            </li>
          ))}
        </ListaDeOpcoes>
      )}

      {/* -------------------------------------------------------- detalhes */}
      {passo === "detalhes" && (
        <div className="mt-8 grid gap-3 px-8">
          <div className="grid grid-cols-2 gap-3">
            <Selecao
              rotulo="Porte"
              value={porte}
              onChange={(e) => definir_porte(e.target.value as Porte | "")}
            >
              <option value="">Nao sei</option>
              <option value="pequeno">Pequeno</option>
              <option value="medio">Medio</option>
              <option value="grande">Grande</option>
            </Selecao>

            <Campo
              rotulo="Cor"
              type="text"
              value={cor}
              onChange={(e) => definir_cor(e.target.value)}
              maxLength={40}
              placeholder="caramelo, preto..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Texto numerico, e nao `type="number"`: o campo numerico do
                navegador aceita "-1" e "1.5", que a rota recusa (RN-05 e
                inteiro). So digito entra, como na data do cadastro. */}
            <Campo
              rotulo="Idade — anos"
              inputMode="numeric"
              value={anos}
              onChange={(e) => definir_anos(digitos_ate(e.target.value, 2))}
            />
            <Campo
              rotulo="e meses"
              inputMode="numeric"
              value={meses}
              onChange={(e) => definir_meses(digitos_ate(e.target.value, 2))}
              apoio={
                meses !== "" && Number(meses) > 11
                  ? "De 0 a 11 — 12 meses ja e um ano."
                  : undefined
              }
            />
          </div>

          {idade !== null && idade > 399 && (
            <p className="text-xs text-perdido">
              A idade vai ate 33 anos e 3 meses.
            </p>
          )}

          <CampoLongo
            rotulo="Descricao"
            value={descricao}
            onChange={(e) => definir_descricao(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="Coleira, manchas, comportamento, onde costuma andar..."
          />
        </div>
      )}

      {/* ------------------------------------------------------------ foto */}
      {/* O desenho tem um quadro unico de 230x290 com a camera no meio. O
          seletor ja faz isso e cuida das ate 6 fotos (RN-06) e do envio
          direto ao R2 (RNF-10), entao e ele que fica. */}
      {passo === "foto" && (
        <div className="mt-8 px-8">
          <SeletorDeFotos fotos={fotos} ao_mudar={definir_fotos} />
        </div>
      )}

      {/* ----------------------------------------------------------- local */}
      {/* No desenho a resposta e um endereco digitado, com sugestoes. A busca
          por endereco depende do Nominatim, que e a F-12; ate la o local sai
          do mapa, que e o que a RN-11 guarda de todo jeito — uma coordenada.
          O mapa ocupa o rodape da tela, na altura do desenho (303 de 844). */}
      {passo === "local" && (
        <div className="mt-6 flex flex-1 flex-col">
          {/* RF-13: marca o local e leva o mapa ate ele, como no alerta de
              fuga. O toque no mapa continua ajustando. */}
          <div className="mb-3 px-8">
            <BotaoDeLocalizacao
              estado={localizacao.estado}
              posicao={localizacao.posicao}
              ao_pedir={() =>
                localizacao.pedir(({ lat, lng }) => {
                  definir_local([lat, lng]);
                  definir_centro([lat, lng]);
                })
              }
            />
          </div>

          <p className="px-8 text-center text-sm text-suave">
            {local ? (
              <>
                Local marcado em{" "}
                <code>
                  {local[0].toFixed(5)}, {local[1].toFixed(5)}
                </code>
              </>
            ) : (
              "Toque no mapa para marcar."
            )}
          </p>

          <div className="mt-4 h-[36dvh] min-h-64">
            <Mapa
              animais={[]}
              centro={centro}
              local_escolhido={local}
              ao_escolher_local={(lat, lng) => definir_local([lat, lng])}
            />
          </div>
        </div>
      )}

      <div className="mt-auto grid gap-4 px-8 pt-8 pb-10">
        {/* No ultimo passo, antes do Publicar: e ai que a pessoa decide. */}
        {ultimo && <AvisoDeContato />}
        <Botao
          largo
          disabled={!PERGUNTA.pronto || enviando}
          onClick={ultimo ? publicar : avancar}
        >
          {enviando ? "Publicando..." : ultimo ? "Publicar" : "Proximo"}
        </Botao>
      </div>
    </Casca>
  );
}
