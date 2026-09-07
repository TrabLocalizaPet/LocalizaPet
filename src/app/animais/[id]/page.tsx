"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { EtiquetaDeTipo } from "@/components/etiqueta";
import { BotaoLink } from "@/components/ui/botao";
import { Apoio, Aviso, Tela, Titulo } from "@/components/ui/tela";
import { ha_quanto_tempo, idade_por_extenso, resumo } from "@/lib/formato";
import type { AnimalEmDetalhe } from "@/types/animal";

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
 */
export default function Detalhe() {
  const { id } = useParams<{ id: string }>();
  const [animal, definir_animal] = useState<AnimalEmDetalhe | null>(null);
  const [estado, definir_estado] = useState<"carregando" | "ok" | "ausente">(
    "carregando",
  );

  useEffect(() => {
    fetch(`/api/animais/${id}`)
      .then(async (r) => {
        if (!r.ok) return definir_estado("ausente");
        definir_animal(await r.json());
        definir_estado("ok");
      })
      .catch(() => definir_estado("ausente"));
  }, [id]);

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
          <Link href="/" className="font-semibold text-primaria">
            Voltar para a listagem
          </Link>
        </Apoio>
      </Tela>
    );
  }

  const tem_local = animal.lat !== null && animal.lng !== null;

  return (
    <Tela className="max-w-2xl">
      <Link href="/" className="text-sm font-semibold text-primaria">
        &larr; Todos os anuncios
      </Link>

      {/* Espaco da foto (F-09), na proporcao do Figma. */}
      <div className="relative mt-3 flex aspect-[326/230] items-center justify-center overflow-hidden rounded-[--radius-padrao] bg-primaria/15">
        <span aria-hidden="true" className="font-titulo text-7xl text-primaria/70">
          {(animal.nome ?? "?").charAt(0).toUpperCase()}
        </span>
        <span className="absolute top-3 left-3">
          <EtiquetaDeTipo tipo={animal.tipo_anuncio} />
        </span>
      </div>

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
