"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { ROTULO_DO_TIPO, ha_quanto_tempo, idade_por_extenso, resumo } from "@/lib/formato";
import type { AnimalEmDetalhe } from "@/types/animal";

const Mapa = dynamic(() => import("@/components/mapa"), {
  ssr: false,
  loading: () => <div className="mapa carregando">Carregando o mapa...</div>,
});

/**
 * Detalhe do anuncio (RF-15) com o contato do autor (RF-21).
 *
 * O telefone chega da API ja filtrado por RN-24: quando o autor nao
 * autorizou, o campo vem `null` e nao ha o que esconder aqui. Esta tela nao
 * decide nada sobre privacidade — quem decide e a consulta.
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
        if (!r.ok) {
          definir_estado("ausente");
          return;
        }
        definir_animal(await r.json());
        definir_estado("ok");
      })
      .catch(() => definir_estado("ausente"));
  }, [id]);

  if (estado === "carregando") {
    return (
      <main className="conta">
        <p className="apoio">Carregando...</p>
      </main>
    );
  }

  if (estado === "ausente" || !animal) {
    return (
      <main className="conta">
        <h1>Anuncio nao encontrado</h1>
        <p className="alternativa">
          <Link href="/animais">Voltar para a listagem</Link>
        </p>
      </main>
    );
  }

  const tem_local = animal.lat !== null && animal.lng !== null;

  return (
    <main className="tela-do-mapa">
      <p className="apoio">
        <Link href="/animais">&larr; Todos os anuncios</Link>
      </p>

      <header className="cabecalho-do-mapa">
        <span className={`etiqueta ${animal.tipo_anuncio}`}>
          {ROTULO_DO_TIPO[animal.tipo_anuncio]}
        </span>
        <h1>
          {animal.nome ?? "Sem nome"}
          {animal.idade_meses !== null && `, ${idade_por_extenso(animal.idade_meses)}`}
        </h1>
        <p className="apoio">{resumo(animal)}</p>
      </header>

      {/* RN-10: o anuncio resolvido continua acessivel por link direto, mas
          precisa dizer que encerrou — senao alguem liga para o tutor de um
          caso ja fechado. */}
      {animal.situacao === "resolvido" && (
        <p className="aviso bom">Este caso ja foi resolvido.</p>
      )}

      {animal.descricao && <p className="descricao">{animal.descricao}</p>}

      <section className="contato">
        <h2>Contato</h2>
        <p>
          Publicado por <strong>{animal.autor_nome}</strong> ·{" "}
          {ha_quanto_tempo(animal.criado_em)}
        </p>
        {animal.autor_telefone ? (
          <p>
            <a className="botao" href={`tel:${animal.autor_telefone}`}>
              {animal.autor_telefone}
            </a>
          </p>
        ) : (
          // RN-24: nasce desligado. A ausencia e o padrao, nao uma falha.
          <p className="apoio">
            Esta pessoa preferiu nao exibir o telefone.
          </p>
        )}
      </section>

      {tem_local ? (
        <section>
          <h2>
            {animal.tipo_anuncio === "adocao"
              ? "Onde o pet se encontra"
              : "Visto pela ultima vez"}
          </h2>
          {animal.visto_em && (
            <p className="apoio">
              {animal.endereco_texto ? `${animal.endereco_texto} · ` : ""}
              {ha_quanto_tempo(animal.visto_em)}
            </p>
          )}
          {/* Um pino so, o deste anuncio. O tipo do mapa exige coordenada
              nao-nula, e por isso a montagem e explicita: `tem_local` ja
              garantiu que as duas existem. */}
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
        </section>
      ) : (
        <p className="apoio">Este anuncio nao tem local informado.</p>
      )}
    </main>
  );
}
