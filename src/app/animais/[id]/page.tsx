"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { EtiquetaDeSituacao, EtiquetaDeTipo } from "@/components/etiqueta";
import { Botao, BotaoLink } from "@/components/ui/botao";
import { Apoio, Aviso, Tela, Titulo } from "@/components/ui/tela";
import { ha_quanto_tempo, idade_por_extenso, resumo } from "@/lib/formato";
import type { AnimalEmDetalhe, Situacao } from "@/types/animal";
import type { Perfil } from "@/types/perfil";

const Mapa = dynamic(() => import("@/components/mapa"), {
  ssr: false,
  loading: () => (
    <div className="grid h-64 place-items-center rounded-[--radius-padrao] border border-borda bg-cartao text-sm text-suave">
      Carregando o mapa...
    </div>
  ),
});

/**
 * Detalhe do anuncio (RF-15) com o contato do autor (RF-21).
 *
 * Segue a tela do Figma: foto sangrada no topo, titulo com nome e idade,
 * resumo, descricao e o mapa de onde o animal esta. A foto e a F-09 e as
 * etiquetas de caracteristica sao a F-10 — o espaco das duas ja esta no
 * lugar, para o desenho nao mudar de forma quando elas chegarem.
 *
 * Esta tela **nao decide nada sobre privacidade**: o telefone chega da API
 * ja filtrado por RN-24, e quando o autor nao autorizou vem `null`.
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
    <Tela className="max-w-2xl">
      <Link href="/animais" className="text-sm font-semibold text-primaria">
        &larr; Todos os anuncios
      </Link>

      {/* Foto de capa, na proporcao do Figma. */}
      <div className="relative mt-3 flex aspect-[326/230] items-center justify-center overflow-hidden rounded-[--radius-padrao] bg-primaria/15">
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
          <span aria-hidden="true" className="font-titulo text-7xl text-primaria/70">
            {(animal.nome ?? "?").charAt(0).toUpperCase()}
          </span>
        )}
        <span className="absolute top-3 left-3 flex gap-1.5">
          <EtiquetaDeTipo tipo={animal.tipo_anuncio} />
          {/* Sobre a foto, onde o olho chega primeiro. O aviso mais abaixo
              diz a mesma coisa em palavras; quem abriu o link para ligar
              para o tutor nao devia precisar rolar para descobrir. */}
          {animal.situacao !== "ativo" && (
            <EtiquetaDeSituacao situacao={animal.situacao} />
          )}
        </span>
      </div>

      {/* As demais fotos. A capa ja apareceu acima. */}
      {animal.fotos.length > 1 && (
        <ul className="mt-2 grid grid-cols-4 gap-2">
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

      <div className="mt-4">
        <Titulo>
          {animal.nome ?? "Sem nome"}
          {animal.idade_meses !== null &&
            `, ${idade_por_extenso(animal.idade_meses)}`}
        </Titulo>
        <Apoio>{resumo(animal)}</Apoio>
      </div>

      {/* RN-10: o anuncio resolvido continua acessivel por link direto, mas
          precisa dizer que encerrou — senao alguem liga para o tutor de um
          caso ja fechado. */}
      {animal.situacao === "resolvido" && (
        <Aviso tom="bom">Este caso ja foi resolvido.</Aviso>
      )}

      {erro && <Aviso>{erro}</Aviso>}

      {animal.descricao && (
        <p className="mt-4 whitespace-pre-wrap text-base">{animal.descricao}</p>
      )}

      <section className="mt-6 rounded-[--radius-padrao] border border-borda bg-cartao p-4">
        <h2 className="font-titulo text-base font-medium">Contato</h2>
        <p className="mt-1 text-sm">
          Publicado por <strong>{animal.autor_nome}</strong> ·{" "}
          {ha_quanto_tempo(animal.criado_em)}
        </p>

        {animal.autor_telefone ? (
          <BotaoLink href={`tel:${animal.autor_telefone}`} className="mt-3">
            {animal.autor_telefone}
          </BotaoLink>
        ) : (
          // RN-24: nasce desligado. A ausencia e o padrao, nao uma falha.
          <p className="mt-2 text-sm text-suave">
            Esta pessoa preferiu nao exibir o telefone.
          </p>
        )}
      </section>

      {/* RF-08: so o autor, e so enquanto o anuncio esta ativo. */}
      {sou_o_autor && animal.situacao === "ativo" && (
        <section className="mt-6 rounded-[--radius-padrao] border border-borda bg-cartao p-4">
          <h2 className="font-titulo text-base font-medium">Este anuncio e seu</h2>

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

      {tem_local ? (
        <section className="mt-6">
          <h2 className="font-titulo text-base font-medium">
            {animal.tipo_anuncio === "adocao"
              ? "Onde o pet se encontra"
              : "Visto pela ultima vez"}
          </h2>
          {animal.visto_em && (
            <Apoio>
              {animal.endereco_texto ? `${animal.endereco_texto} · ` : ""}
              {ha_quanto_tempo(animal.visto_em)}
            </Apoio>
          )}

          {/* Um pino so, o deste anuncio. `tem_local` ja garantiu que a
              coordenada existe, e por isso a montagem e explicita. */}
          <div className="mt-2 h-64 overflow-hidden rounded-[--radius-padrao] md:h-80">
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
    </Tela>
  );
}
