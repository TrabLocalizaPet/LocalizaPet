"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { EtiquetaDeSituacao, EtiquetaDeTipo } from "@/components/etiqueta";
import { Botao } from "@/components/ui/botao";
import {
  IconeCompartilhar,
  IconeTelefone,
  SetaVoltar,
} from "@/components/ui/icones";
import { Apoio, Aviso, Tela, Titulo } from "@/components/ui/tela";
import { ha_quanto_tempo, idade_por_extenso, resumo } from "@/lib/formato";
import type { AnimalEmDetalhe, Situacao } from "@/types/animal";
import type { Perfil } from "@/types/perfil";

const Mapa = dynamic(() => import("@/components/mapa"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center rounded-[--radius-padrao] bg-creme/30 text-sm text-suave">
      Carregando o mapa...
    </div>
  ),
});

/**
 * Detalhe do anuncio (RF-15) com o contato do autor (RF-21) — tela do Figma
 * no 1:3429.
 *
 * O desenho, de cima para baixo: foto de 390x520 sangrando ate as bordas e
 * com o rodape arredondado em 48; a seta de voltar sobre ela; dois botoes
 * redondos de 80 que avancam sobre a foto, compartilhar e telefone; e o
 * conteudo a partir de y=584 — nome e idade em 24, a linha de especie e sexo
 * em 14, a descricao, as etiquetas de caracteristica e o mapa de 342x239 sob
 * "Ultima vez visto em".
 *
 * As etiquetas de caracteristica sao a F-10 (incremento 2): o espaco esta no
 * lugar, vazio, para a tela nao mudar de forma quando elas chegarem.
 *
 * Esta tela **nao decide nada sobre privacidade**: o telefone chega da API ja
 * filtrado por RN-24, e quando o autor nao autorizou vem `null`.
 *
 * O botao de encerrar (RF-08) aparece so para o autor, e **isso e conforto,
 * nao controle de acesso**: quem garante RN-10 e o `WHERE` do `UPDATE` na
 * consulta. Esconder o botao evita oferecer uma acao que seria recusada.
 */
export default function Detalhe() {
  const { id } = useParams<{ id: string }>();
  const [animal, definir_animal] = useState<AnimalEmDetalhe | null>(null);
  const [estado, definir_estado] = useState<"carregando" | "ok" | "ausente">(
    "carregando",
  );
  /** `null` enquanto nao se sabe, e tambem para quem esta sem conta (RF-22). */
  const [meu_id, definir_meu_id] = useState<string | null>(null);
  const [confirmando, definir_confirmando] = useState(false);
  const [encerrando, definir_encerrando] = useState(false);
  const [erro, definir_erro] = useState<string | null>(null);
  const [recado, definir_recado] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/animais/${id}`)
      .then(async (r) => {
        if (!r.ok) return definir_estado("ausente");
        definir_animal(await r.json());
        definir_estado("ok");
      })
      .catch(() => definir_estado("ausente"));
  }, [id]);

  // Quem esta sem sessao recebe 401 aqui, e e um caminho normal: a tela e
  // aberta (RF-22). Sem perfil (404) tambem nao ha o que comparar.
  useEffect(() => {
    fetch("/api/perfil")
      .then(async (r) => {
        if (!r.ok) return;
        const perfil: Perfil = await r.json();
        definir_meu_id(perfil.id);
      })
      .catch(() => undefined);
  }, []);

  async function encerrar() {
    definir_erro(null);
    definir_encerrando(true);

    const resposta = await fetch(`/api/animais/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ situacao: "resolvido" }),
    });

    definir_encerrando(false);
    definir_confirmando(false);

    if (resposta.ok) {
      // A situacao vem da resposta, nao de um palpite da tela: e o banco que
      // acabou de decidir qual e.
      const { situacao }: { situacao: Situacao } = await resposta.json();
      definir_animal((atual) => (atual ? { ...atual, situacao } : atual));
      return;
    }

    // 409 e o caso das duas abas abertas: outra requisicao resolveu primeiro.
    // Nao e erro de quem clicou — a tela so precisa mostrar o estado certo.
    if (resposta.status === 409) {
      definir_erro("Este anuncio ja estava encerrado.");
      definir_animal((atual) =>
        atual ? { ...atual, situacao: "resolvido" } : atual,
      );
      return;
    }

    definir_erro("Nao foi possivel encerrar agora. Tente de novo.");
  }

  /**
   * Compartilhar (o botao creme do desenho).
   *
   * `navigator.share` existe no celular, que e onde o produto e usado; no
   * computador quase sempre nao existe, e ai o endereco vai para a area de
   * transferencia. Os dois caminhos avisam o que aconteceu — botao que parece
   * nao ter feito nada e pior que botao ausente.
   */
  async function compartilhar() {
    if (!animal) return;

    const endereco = window.location.href;
    const titulo = `${animal.nome ?? "Anuncio"} no LocalizaPet`;

    try {
      if (navigator.share) {
        await navigator.share({ title: titulo, url: endereco });
        return;
      }

      await navigator.clipboard.writeText(endereco);
      definir_recado("Link copiado.");
    } catch {
      // Cancelar o compartilhamento tambem cai aqui, e cancelar nao e erro.
      definir_recado(null);
    }
  }

  if (estado === "carregando") {
    return (
      <Tela largura="estreita">
        <Apoio>Carregando...</Apoio>
      </Tela>
    );
  }

  if (estado === "ausente" || !animal) {
    return (
      <Tela largura="estreita">
        <Titulo>Anuncio nao encontrado</Titulo>
        <Apoio>
          <Link href="/animais" className="font-semibold text-primaria">
            Voltar para a listagem
          </Link>
        </Apoio>
      </Tela>
    );
  }

  const tem_local = animal.lat !== null && animal.lng !== null;
  const sou_o_autor = meu_id !== null && meu_id === animal.autor_id;

  return (
    <main className="mx-auto w-full max-w-md pb-8 md:max-w-2xl">
      {/* ------------------------------------------------------------ foto */}
      {/* 390x520 no desenho: 1.33 de proporcao, com o rodape arredondado em
          48 e a imagem sangrando ate as bordas da tela. */}
      <div className="relative aspect-[390/520] w-full overflow-hidden rounded-b-[48px] bg-creme">
        {animal.foto_url ? (
          <Image
            src={animal.foto_url}
            alt={animal.nome ?? "Animal sem nome"}
            fill
            sizes="(min-width: 768px) 42rem, 100vw"
            priority
            className="object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="grid size-full place-items-center font-titulo text-8xl text-primaria/70"
          >
            {(animal.nome ?? "?").charAt(0).toUpperCase()}
          </span>
        )}

        {/* A seta fica sobre a foto, em y=44 e x=28 como nas demais telas. O
            circulo escuro atras existe para ela nao sumir numa foto clara —
            o desenho tem fotos escuras, a vida real nao garante isso. */}
        <Link
          href="/animais"
          aria-label="Voltar"
          className="absolute top-11 left-7 grid size-10 place-items-center rounded-full bg-escura/35 text-white backdrop-blur-xs"
        >
          <SetaVoltar className="size-6" />
        </Link>

        <span className="absolute top-11 right-7 flex gap-1.5">
          <EtiquetaDeTipo tipo={animal.tipo_anuncio} />
          {animal.situacao !== "ativo" && (
            <EtiquetaDeSituacao situacao={animal.situacao} />
          )}
        </span>
      </div>

      {/* ------------------------------------------------- acoes redondas */}
      {/* 80x80 no desenho, montados sobre o rodape da foto (y=480 de 520).
          O `-mt-10` e a metade da altura: metade sobre a foto, metade fora.

          `relative z-10` nao e enfeite: o quadro da foto e `relative`, e
          elemento posicionado pinta por cima de elemento que nao e. Sem isso
          a metade de cima dos botoes fica atras da foto. */}
      <div className="relative z-10 -mt-10 flex justify-center gap-6">
        <button
          type="button"
          onClick={compartilhar}
          aria-label="Compartilhar este anuncio"
          className="grid size-20 place-items-center rounded-full bg-creme text-secundaria shadow-[0_2px_12px_0_rgba(93,42,66,0.24)] transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
        >
          <IconeCompartilhar className="size-8" />
        </button>

        {/* RN-24: o telefone so existe aqui quando o autor autorizou. Sem
            numero nao ha botao — um telefone desligado no meio da tela so
            frustra quem reconheceu o animal. */}
        {animal.autor_telefone && (
          <a
            href={`tel:${animal.autor_telefone}`}
            aria-label={`Ligar para ${animal.autor_nome}`}
            className="grid size-20 place-items-center rounded-full bg-secundaria text-white shadow-[0_2px_12px_0_rgba(93,42,66,0.24)] transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
          >
            <IconeTelefone className="size-8" />
          </a>
        )}
      </div>

      {/* --------------------------------------------------------- conteudo */}
      <div className="px-6 pt-6">
        <h1 className="text-2xl leading-8 font-bold">
          {animal.nome ?? "Sem nome"}
          {animal.idade_meses !== null &&
            `, ${idade_por_extenso(animal.idade_meses)}`}
        </h1>
        <p className="mt-1 text-sm">{resumo(animal)}</p>

        {/* RF-21: quem publicou, e ha quanto tempo. O botao redondo acima da
            o telefone; esta linha diz de quem ele e. */}
        <p className="mt-1 text-sm text-suave">
          Publicado por {animal.autor_nome} · {ha_quanto_tempo(animal.criado_em)}
        </p>

        {!animal.autor_telefone && (
          <p className="mt-1 text-sm text-suave">
            Esta pessoa preferiu nao exibir o telefone.
          </p>
        )}

        {/* RN-10: o anuncio resolvido continua acessivel por link direto, mas
            precisa dizer que encerrou — senao alguem liga para o tutor de um
            caso ja fechado. */}
        {animal.situacao === "resolvido" && (
          <Aviso tom="bom">Este caso ja foi resolvido.</Aviso>
        )}

        {erro && <Aviso>{erro}</Aviso>}
        {recado && <Aviso tom="bom">{recado}</Aviso>}

        {animal.descricao && (
          <p className="mt-4 text-sm leading-5 whitespace-pre-wrap">
            {animal.descricao}
          </p>
        )}

        {/* As demais fotos. A capa ja apareceu no topo. */}
        {animal.fotos.length > 1 && (
          <ul className="mt-6 grid grid-cols-4 gap-2">
            {animal.fotos.slice(1).map((url, indice) => (
              <li
                key={url}
                className="relative aspect-square overflow-hidden rounded-[--radius-padrao] border border-borda"
              >
                <Image
                  src={url}
                  alt={`Foto ${indice + 2} de ${animal.nome ?? "animal sem nome"}`}
                  fill
                  sizes="8rem"
                  className="object-cover"
                />
              </li>
            ))}
          </ul>
        )}

        {/* ------------------------------------------------------ RF-08 */}
        {sou_o_autor && animal.situacao === "ativo" && (
          <section className="mt-6 rounded-[--radius-padrao] border border-borda bg-cartao p-4">
            <h2 className="font-titulo text-base font-medium">
              Este anuncio e seu
            </h2>

            {!confirmando ? (
              <>
                <p className="mt-1 text-sm text-suave">
                  {animal.tipo_anuncio === "adocao"
                    ? "Ja encontrou um lar para ele?"
                    : "Ja reencontrou o pet?"}{" "}
                  Encerrar tira o anuncio da listagem e da busca (RN-09).
                </p>
                <Botao
                  aparencia="secundaria"
                  largo
                  className="mt-3"
                  onClick={() => definir_confirmando(true)}
                >
                  Marcar como resolvido
                </Botao>
              </>
            ) : (
              /* Confirmacao em duas etapas, e nao `confirm()` do navegador:
                 encerrar nao tem desfazer nesta entrega, e a caixa do sistema
                 sai do desenho e trava a tela inteira. */
              <>
                <p className="mt-1 text-sm">
                  Encerrar nao tem como desfazer por aqui. Confirma?
                </p>
                <div className="mt-3 grid gap-2">
                  <Botao largo disabled={encerrando} onClick={encerrar}>
                    {encerrando ? "Encerrando..." : "Sim, esta resolvido"}
                  </Botao>
                  <Botao
                    aparencia="fantasma"
                    largo
                    disabled={encerrando}
                    onClick={() => definir_confirmando(false)}
                  >
                    Nao, continuar procurando
                  </Botao>
                </div>
              </>
            )}
          </section>
        )}

        {/* ------------------------------------------------------- o mapa */}
        {tem_local ? (
          <section className="mt-6">
            <h2 className="text-xl leading-7 font-bold">
              {animal.tipo_anuncio === "adocao"
                ? "Atualmente esta em"
                : "Ultima vez visto em"}
            </h2>
            {animal.visto_em && (
              <Apoio>
                {animal.endereco_texto ? `${animal.endereco_texto} · ` : ""}
                {ha_quanto_tempo(animal.visto_em)}
              </Apoio>
            )}

            {/* 342x239 no desenho — 1.43 de proporcao. Um pino so, o deste
                anuncio; `tem_local` ja garantiu que a coordenada existe. */}
            <div className="mt-3 aspect-[342/239] overflow-hidden rounded-[--radius-padrao]">
              <Mapa
                animais={[
                  {
                    id: animal.id,
                    nome: animal.nome,
                    tipo_anuncio: animal.tipo_anuncio,
                    especie: animal.especie,
                    lat: animal.lat!,
                    lng: animal.lng!,
                    visto_em: animal.visto_em ?? animal.criado_em,
                    foto_url: animal.foto_url,
                  },
                ]}
                centro={[animal.lat!, animal.lng!]}
                local_escolhido={null}
              />
            </div>
          </section>
        ) : (
          <Apoio>Este anuncio nao tem local informado.</Apoio>
        )}
      </div>
    </main>
  );
}
