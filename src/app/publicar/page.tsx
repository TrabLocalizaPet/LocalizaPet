"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { CENTRO_PADRAO } from "@/lib/geo";
import type { Especie, Porte, Sexo, TipoDeAnuncio } from "@/types/animal";

const Mapa = dynamic(() => import("@/components/mapa"), {
  ssr: false,
  loading: () => <div className="mapa carregando">Carregando o mapa...</div>,
});

/**
 * Publicar anuncio (RF-01, RF-02, RF-03).
 *
 * O tipo e escolhido no comeco, como no Figma ("O que te trouxe aqui?"), e
 * depois vem um formulario unico. Nao sao tres formularios: os tres fluxos
 * compartilham quase todos os campos, e o que muda entre eles cabe numa
 * pergunta e numa regra (RN-03).
 */

const ESCOLHAS: {
  tipo: TipoDeAnuncio;
  titulo: string;
  apoio: string;
}[] = [
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
    const a = anos === "" ? 0 : Number(anos);
    const m = meses === "" ? 0 : Number(meses);
    if (anos === "" && meses === "") return null;
    return a * 12 + m;
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

    if (resposta.status === 401) {
      router.replace("/entrar");
      return;
    }

    if (!resposta.ok) {
      definir_erro("Nao foi possivel publicar. Confira os campos.");
      definir_enviando(false);
      return;
    }

    // A tela de detalhe e a F-06. Por enquanto o anuncio publicado aparece
    // como pino no mapa.
    router.push("/mapa");
  }

  if (!tipo) {
    return (
      <main className="conta">
        <h1>O que te trouxe aqui?</h1>
        <p className="apoio">
          O tipo define o que o anuncio precisa. Da para mudar voltando.
        </p>

        <ul className="escolhas">
          {ESCOLHAS.map((escolha) => (
            <li key={escolha.tipo}>
              <button type="button" onClick={() => definir_tipo(escolha.tipo)}>
                <strong>{escolha.titulo}</strong>
                <span>{escolha.apoio}</span>
              </button>
            </li>
          ))}
        </ul>

        <p className="alternativa">
          Quer adotar? <a href="/mapa">Veja os pets perto de voce</a>
        </p>
      </main>
    );
  }

  return (
    <main className="tela-do-mapa">
      <header className="cabecalho-do-mapa">
        <h1>{ESCOLHAS.find((e) => e.tipo === tipo)!.titulo}</h1>
        <p className="apoio">
          <button
            className="voltar"
            type="button"
            onClick={() => definir_tipo(null)}
          >
            trocar o tipo
          </button>
        </p>
      </header>

      {erro && <p className="aviso">{erro}</p>}

      <form onSubmit={enviar} className="formulario-anuncio">
        <label className="campo">
          {/* RN-04: quem encontra um animal na rua normalmente nao sabe o
              nome, entao o campo nunca e obrigatorio. */}
          <span>Nome do pet {tipo === "encontrado" && "(se souber)"}</span>
          <input
            type="text"
            value={nome}
            onChange={(e) => definir_nome(e.target.value)}
            maxLength={80}
          />
        </label>

        <div className="dupla">
          <label className="campo">
            <span>Especie</span>
            <select
              value={especie}
              onChange={(e) => definir_especie(e.target.value as Especie)}
            >
              <option value="cachorro">Cachorro</option>
              <option value="gato">Gato</option>
              <option value="outro">Outro</option>
            </select>
          </label>

          <label className="campo">
            <span>Sexo</span>
            <select
              value={sexo}
              onChange={(e) => definir_sexo(e.target.value as Sexo | "")}
            >
              <option value="">Nao sei</option>
              <option value="macho">Macho</option>
              <option value="femea">Femea</option>
            </select>
          </label>
        </div>

        <div className="dupla">
          <label className="campo">
            <span>Porte</span>
            <select
              value={porte}
              onChange={(e) => definir_porte(e.target.value as Porte | "")}
            >
              <option value="">Nao sei</option>
              <option value="pequeno">Pequeno</option>
              <option value="medio">Medio</option>
              <option value="grande">Grande</option>
            </select>
          </label>

          <label className="campo">
            <span>Cor</span>
            <input
              type="text"
              value={cor}
              onChange={(e) => definir_cor(e.target.value)}
              maxLength={40}
              placeholder="caramelo, preto..."
            />
          </label>
        </div>

        <div className="dupla">
          <label className="campo">
            <span>Idade — anos</span>
            <input
              type="number"
              min={0}
              max={33}
              value={anos}
              onChange={(e) => definir_anos(e.target.value)}
            />
          </label>
          <label className="campo">
            <span>e meses</span>
            <input
              type="number"
              min={0}
              max={11}
              value={meses}
              onChange={(e) => definir_meses(e.target.value)}
            />
          </label>
        </div>

        <label className="campo">
          <span>Descricao</span>
          <textarea
            value={descricao}
            onChange={(e) => definir_descricao(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="Coleira, manchas, comportamento, onde costuma andar..."
          />
        </label>

        <div className="campo">
          <span>
            {exige_local
              ? "Onde foi visto pela ultima vez? (obrigatorio)"
              : "Onde o pet se encontra? (opcional)"}
          </span>
          <Mapa
            animais={[]}
            centro={CENTRO_PADRAO}
            local_escolhido={local}
            ao_escolher_local={(lat, lng) => definir_local([lat, lng])}
          />
          <p className="coordenada">
            {local ? (
              <>
                Local marcado:{" "}
                <code>
                  {local[0].toFixed(5)}, {local[1].toFixed(5)}
                </code>
              </>
            ) : (
              "Clique no mapa para marcar."
            )}
          </p>
        </div>

        <button className="botao" type="submit" disabled={enviando}>
          {enviando ? "Publicando..." : "Publicar anuncio"}
        </button>
      </form>
    </main>
  );
}
