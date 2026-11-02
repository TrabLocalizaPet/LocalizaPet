"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Casca, TituloDoPasso, Topo } from "@/components/passo";
import { SeletorDeFotos } from "@/components/seletor-de-fotos";
import { Botao } from "@/components/ui/botao";
import { Campo, CampoLongo, Selecao } from "@/components/ui/campo";
import { Aviso } from "@/components/ui/tela";
import { para_data_hora_local } from "@/lib/formato";
import { CENTRO_PADRAO } from "@/lib/geo";
import type { Especie } from "@/types/animal";

const Mapa = dynamic(() => import("@/components/mapa"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center text-sm text-suave">
      Carregando o mapa...
    </div>
  ),
});

/**
 * Alerta de fuga (RF-01) — o anuncio de perdido feito as pressas.
 *
 * O `/publicar` pergunta uma coisa por tela, em oito passos, e serve aos tres
 * tipos de anuncio. Quem acabou de ver o portao aberto nao tem esse tempo: as
 * primeiras horas sao as que mais contam, e e nelas que o aviso precisa
 * chegar a quem mora perto (RF-24). Aqui e uma tela so, com o essencial.
 *
 * **Nao e outro tipo de anuncio.** E um `perdido` como qualquer outro, pela
 * mesma rota e na mesma transacao (RN-34) — so que com menos perguntas e uma
 * a mais: **quando** o animal sumiu, que vira o `visto_em` do primeiro
 * avistamento (RN-12). O formulario completo grava "agora"; no alerta, quem
 * percebeu a fuga uma hora depois diz isso.
 *
 * O que fica de fora (sexo, porte, cor, idade) e opcional no schema; quem
 * quiser descrever melhor tem a descricao livre, e o `/publicar` continua
 * existindo para o anuncio caprichado.
 */

const ESPECIES: { valor: Especie; rotulo: string }[] = [
  { valor: "cachorro", rotulo: "Cachorro" },
  { valor: "gato", rotulo: "Gato" },
  { valor: "outro", rotulo: "Outros" },
];

export default function AlertaDeFuga() {
  const router = useRouter();

  const [nome, definir_nome] = useState("");
  const [especie, definir_especie] = useState<Especie | "">("");
  // Abre em "agora": e o caso mais comum, e a pessoa so mexe se nao for.
  const [quando, definir_quando] = useState(() => para_data_hora_local(new Date()));
  const [local, definir_local] = useState<[number, number] | null>(null);
  const [fotos, definir_fotos] = useState<{ chave: string; previa: string }[]>([]);
  const [descricao, definir_descricao] = useState("");

  const [erro, definir_erro] = useState<string | null>(null);
  const [enviando, definir_enviando] = useState(false);

  // Mesma conferencia do `/publicar`: sem sessao vai entrar, sem perfil vai
  // completar o cadastro — antes de preencher, e nao depois.
  useEffect(() => {
    fetch("/api/perfil").then((r) => {
      if (r.status === 401) router.replace("/entrar");
      if (r.status === 404) router.replace("/perfil");
    });
  }, [router]);

  const agora = para_data_hora_local(new Date());
  // O campo e texto `AAAA-MM-DDTHH:MM`, e nesse formato a ordem alfabetica e
  // a cronologica — comparar string basta.
  const quando_valido = quando !== "" && quando <= agora;
  const pronto = especie !== "" && local !== null && quando_valido;

  async function publicar() {
    if (!pronto || !especie || !local) return;

    definir_erro(null);
    definir_enviando(true);

    const resposta = await fetch("/api/animais", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo_anuncio: "perdido",
        nome: nome || null,
        especie,
        descricao: descricao || null,
        local: { lat: local[0], lng: local[1] },
        // `new Date` le o `datetime-local` no fuso do aparelho; o ISO sai em
        // UTC, sem ambiguidade para o banco.
        visto_em: new Date(quando).toISOString(),
        fotos: fotos.map((f) => f.chave),
      }),
    }).catch(() => null);

    if (!resposta) {
      definir_erro("Sem conexao. Confira a internet e tente de novo.");
      definir_enviando(false);
      return;
    }

    if (resposta.status === 401) return router.replace("/entrar");
    if (resposta.status === 409) return router.replace("/perfil");

    if (!resposta.ok) {
      definir_erro("Nao foi possivel publicar o alerta. Confira os campos.");
      definir_enviando(false);
      return;
    }

    // Direto para o anuncio: e o link que a pessoa vai querer compartilhar.
    const { id } = await resposta.json();
    router.push(`/animais/${id}`);
  }

  return (
    <Casca>
      <Topo aoVoltar={() => router.push("/publicar")} />

      <TituloDoPasso apoio="So o essencial. O alerta aparece na hora para quem procura e para quem monitora a regiao.">
        Meu pet fugiu
      </TituloDoPasso>

      <div className="mt-6 grid gap-4 px-8">
        {erro && <Aviso>{erro}</Aviso>}

        <Selecao
          rotulo="Especie"
          value={especie}
          onChange={(e) => definir_especie(e.target.value as Especie | "")}
          required
        >
          <option value="" disabled>
            Escolha
          </option>
          {ESPECIES.map((opcao) => (
            <option key={opcao.valor} value={opcao.valor}>
              {opcao.rotulo}
            </option>
          ))}
        </Selecao>

        <Campo
          rotulo="Nome do pet"
          type="text"
          value={nome}
          onChange={(e) => definir_nome(e.target.value)}
          maxLength={80}
          placeholder="Maggie"
        />

        <Campo
          rotulo="Quando sumiu?"
          type="datetime-local"
          value={quando}
          max={agora}
          onChange={(e) => definir_quando(e.target.value)}
          apoio={
            quando !== "" && quando > agora
              ? "Essa hora ainda nao chegou. Confira o dia e a hora."
              : undefined
          }
          required
        />
      </div>

      {/* O mapa sangra ate as bordas, como no passo do local do `/publicar`. */}
      <div className="mt-6">
        <p className="px-8 text-sm font-semibold">Onde foi visto pela ultima vez?</p>
        <p className="mt-1 px-8 text-xs text-suave">
          {local
            ? `Local marcado em ${local[0].toFixed(5)}, ${local[1].toFixed(5)}.`
            : "Toque no mapa para marcar."}
        </p>
        <div className="mt-3 h-[36dvh] min-h-64">
          <Mapa
            animais={[]}
            centro={CENTRO_PADRAO}
            local_escolhido={local}
            ao_escolher_local={(lat, lng) => definir_local([lat, lng])}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 px-8">
        <SeletorDeFotos fotos={fotos} ao_mudar={definir_fotos} />

        <CampoLongo
          rotulo="Descricao"
          value={descricao}
          onChange={(e) => definir_descricao(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Coleira, manchas, se atende pelo nome, se tem medo de gente..."
        />
      </div>

      <div className="mt-auto px-8 pt-8 pb-10">
        <Botao largo disabled={!pronto || enviando} onClick={publicar}>
          {enviando ? "Publicando..." : "Publicar alerta"}
        </Botao>
      </div>
    </Casca>
  );
}
