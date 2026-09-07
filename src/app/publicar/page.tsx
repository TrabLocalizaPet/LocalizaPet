"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Botao } from "@/components/ui/botao";
import { Campo, CampoLongo, Selecao } from "@/components/ui/campo";
import { Apoio, Aviso, Tela, Titulo } from "@/components/ui/tela";
import { CENTRO_PADRAO } from "@/lib/geo";
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
 * Publicar anuncio (RF-01, RF-02, RF-03).
 *
 * O tipo e escolhido no comeco, como na tela "O que te trouxe aqui?" do
 * Figma, e depois vem o formulario. Nao sao tres formularios: os tres fluxos
 * compartilham quase todos os campos, e o que muda entre eles cabe numa
 * pergunta e numa regra (RN-03).
 *
 * **Divergencia conhecida do Figma:** la o cadastro do pet tem uma pergunta
 * por tela. Registrada em `docs/07-interface.md`.
 */

const ESCOLHAS: { tipo: TipoDeAnuncio; titulo: string; apoio: string }[] = [
  {
    tipo: "perdido",
    titulo: "Perdi meu pet",
    apoio: "Quero ajuda para encontra-lo",
  },
  {
    tipo: "encontrado",
    titulo: "Achei um pet perdido",
    apoio: "Quero encontrar o tutor",
  },
  {
    tipo: "adocao",
    titulo: "Quero colocar para adocao",
    apoio: "Quero encontrar um lar para o pet",
  },
];

export default function Publicar() {
  const router = useRouter();

  const [tipo, definir_tipo] = useState<TipoDeAnuncio | null>(null);
  const [nome, definir_nome] = useState("");
  const [especie, definir_especie] = useState<Especie>("cachorro");
  const [sexo, definir_sexo] = useState<Sexo | "">("");
  const [porte, definir_porte] = useState<Porte | "">("");
  const [cor, definir_cor] = useState("");
  const [anos, definir_anos] = useState("");
  const [meses, definir_meses] = useState("");
  const [descricao, definir_descricao] = useState("");
  const [local, definir_local] = useState<[number, number] | null>(null);
  const [erro, definir_erro] = useState<string | null>(null);
  const [enviando, definir_enviando] = useState(false);

  // Publicar exige sessao. A rota tambem confere — aqui e so para nao deixar
  // a pessoa preencher o formulario inteiro antes de descobrir.
  useEffect(() => {
    fetch("/api/perfil").then((r) => {
      if (r.status === 401) router.replace("/entrar");
    });
  }, [router]);

  const exige_local = tipo === "perdido" || tipo === "encontrado";

  function idade_em_meses(): number | null {
    if (anos === "" && meses === "") return null;
    return (anos === "" ? 0 : Number(anos)) * 12 + (meses === "" ? 0 : Number(meses));
  }

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    definir_erro(null);

    // RN-03 conferida antes de enviar, para dizer o que falta em vez de
    // devolver um 422 generico. A rota confere de novo — esta e conveniencia,
    // nao a garantia.
    if (exige_local && !local) {
      definir_erro("Marque no mapa onde o animal foi visto pela ultima vez.");
      return;
    }

    definir_enviando(true);

    const resposta = await fetch("/api/animais", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo_anuncio: tipo,
        nome: nome || null,
        especie,
        sexo: sexo || null,
        porte: porte || null,
        cor: cor || null,
        idade_meses: idade_em_meses(),
        descricao: descricao || null,
        local: local ? { lat: local[0], lng: local[1] } : null,
      }),
    });

    if (resposta.status === 401) return router.replace("/entrar");

    if (!resposta.ok) {
      definir_erro("Nao foi possivel publicar. Confira os campos.");
      definir_enviando(false);
      return;
    }

    const { id } = await resposta.json();
    router.push(`/animais/${id}`);
  }

  if (!tipo) {
    return (
      <Tela largura="estreita">
        <Titulo>O que te trouxe aqui?</Titulo>
        <Apoio>O tipo define o que o anuncio precisa. Da para mudar depois.</Apoio>

        <ul className="mt-5 grid gap-3">
          {ESCOLHAS.map((escolha) => (
            <li key={escolha.tipo}>
              <button
                type="button"
                onClick={() => definir_tipo(escolha.tipo)}
                className="min-h-11 w-full rounded-[--radius-padrao] border border-borda bg-cartao px-4 py-3 text-left transition hover:border-primaria focus-visible:border-primaria focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
              >
                <span className="block font-semibold">{escolha.titulo}</span>
                <span className="block text-sm text-suave">{escolha.apoio}</span>
              </button>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-center text-sm text-suave">
          Quer adotar?{" "}
          <Link href="/" className="font-semibold text-primaria">
            Veja os pets perto de voce
          </Link>
        </p>
      </Tela>
    );
  }

  return (
    <Tela className="max-w-2xl">
      <Titulo>{ESCOLHAS.find((e) => e.tipo === tipo)!.titulo}</Titulo>
      <button
        type="button"
        onClick={() => definir_tipo(null)}
        className="mt-1 text-sm font-semibold text-primaria underline underline-offset-2"
      >
        trocar o tipo
      </button>

      {erro && <Aviso>{erro}</Aviso>}

      <form onSubmit={enviar} className="mt-4 grid gap-3">
        {/* RN-04: quem encontra um animal na rua normalmente nao sabe o nome,
            entao o campo nunca e obrigatorio. */}
        <Campo
          rotulo={`Nome do pet${tipo === "encontrado" ? " (se souber)" : ""}`}
          type="text"
          value={nome}
          onChange={(e) => definir_nome(e.target.value)}
          maxLength={80}
        />

        <div className="grid grid-cols-2 gap-3">
          <Selecao
            rotulo="Especie"
            value={especie}
            onChange={(e) => definir_especie(e.target.value as Especie)}
          >
            <option value="cachorro">Cachorro</option>
            <option value="gato">Gato</option>
            <option value="outro">Outro</option>
          </Selecao>

          <Selecao
            rotulo="Sexo"
            value={sexo}
            onChange={(e) => definir_sexo(e.target.value as Sexo | "")}
          >
            <option value="">Nao sei</option>
            <option value="macho">Macho</option>
            <option value="femea">Femea</option>
          </Selecao>
        </div>

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
          <Campo
            rotulo="Idade — anos"
            type="number"
            min={0}
            max={33}
            value={anos}
            onChange={(e) => definir_anos(e.target.value)}
          />
          <Campo
            rotulo="e meses"
            type="number"
            min={0}
            max={11}
            value={meses}
            onChange={(e) => definir_meses(e.target.value)}
          />
        </div>

        <CampoLongo
          rotulo="Descricao"
          value={descricao}
          onChange={(e) => definir_descricao(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="Coleira, manchas, comportamento, onde costuma andar..."
        />

        <div>
          <span className="mb-1.5 block text-sm font-semibold">
            {exige_local
              ? "Onde foi visto pela ultima vez? (obrigatorio)"
              : "Onde o pet se encontra? (opcional)"}
          </span>
          <div className="h-64 overflow-hidden rounded-[--radius-padrao] border border-borda md:h-80">
            <Mapa
              animais={[]}
              centro={CENTRO_PADRAO}
              local_escolhido={local}
              ao_escolher_local={(lat, lng) => definir_local([lat, lng])}
            />
          </div>
          <p className="mt-1 text-xs text-suave">
            {local ? (
              <>
                Local marcado:{" "}
                <code>
                  {local[0].toFixed(5)}, {local[1].toFixed(5)}
                </code>
              </>
            ) : (
              "Toque no mapa para marcar."
            )}
          </p>
        </div>

        <Botao type="submit" largo disabled={enviando} className="mt-2">
          {enviando ? "Publicando..." : "Publicar anuncio"}
        </Botao>
      </form>
    </Tela>
  );
}
