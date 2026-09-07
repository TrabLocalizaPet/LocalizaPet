"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { CENTRO_PADRAO } from "@/lib/geo";
import type { AnimalNoMapa } from "@/types/animal";

/**
 * Mapa dos anuncios (RF-04, RF-12, RF-13).
 *
 * `ssr: false` e o ponto todo: o Leaflet toca `window` ao ser importado, e
 * sem isto o build quebra na geracao das paginas (DT-04).
 */
const Mapa = dynamic(() => import("@/components/mapa"), {
  ssr: false,
  loading: () => <div className="mapa carregando">Carregando o mapa...</div>,
});

type EstadoDoCentro = "padrao" | "buscando" | "navegador" | "negado";

export default function PaginaDoMapa() {
  const [animais, definir_animais] = useState<AnimalNoMapa[]>([]);
  const [centro, definir_centro] = useState<[number, number]>(CENTRO_PADRAO);
  const [estado, definir_estado] = useState<EstadoDoCentro>("padrao");
  const [escolhido, definir_escolhido] = useState<[number, number] | null>(null);

  useEffect(() => {
    fetch("/api/animais/mapa")
      .then((r) => r.json())
      .then(definir_animais)
      .catch(() => definir_animais([]));
  }, []);

  /**
   * RF-13. O aceite da feature e o caminho do erro: negar a permissao **nao
   * pode travar a tela**. Todo desfecho — negado, indisponivel, tempo
   * esgotado — cai no centro padrao, que ja estava valendo desde o inicio.
   */
  function usar_minha_localizacao() {
    if (!navigator.geolocation) {
      definir_estado("negado");
      return;
    }

    definir_estado("buscando");
    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        definir_centro([posicao.coords.latitude, posicao.coords.longitude]);
        definir_estado("navegador");
      },
      () => definir_estado("negado"),
      { timeout: 8000 },
    );
  }

  return (
    <main className="tela-do-mapa">
      <header className="cabecalho-do-mapa">
        <h1>Pets perto de voce</h1>
        <p className="apoio">
          {animais.length} anuncio(s) ativo(s). Clique no mapa para marcar um
          local.
        </p>
      </header>

      <Mapa
        animais={animais}
        centro={centro}
        local_escolhido={escolhido}
        ao_escolher_local={(lat, lng) => definir_escolhido([lat, lng])}
      />

      <div className="controles-do-mapa">
        <button
          className="botao"
          type="button"
          onClick={usar_minha_localizacao}
          disabled={estado === "buscando"}
        >
          {estado === "buscando" ? "Localizando..." : "Usar minha localizacao"}
        </button>

        {estado === "negado" && (
          <p className="aviso">
            Nao conseguimos sua localizacao. O mapa continua no centro padrao —
            arraste ou use a busca.
          </p>
        )}

        <ul className="legenda">
          <li>
            <span className="pino" style={{ background: "#e7000b" }}>P</span>
            Perdido
          </li>
          <li>
            <span className="pino" style={{ background: "#f68b1e" }}>E</span>
            Encontrado
          </li>
          <li>
            <span className="pino" style={{ background: "#2e7d32" }}>A</span>
            Adocao
          </li>
        </ul>

        {/* O formulario de publicacao e a F-04. Aqui a coordenada so e
            exibida, para provar que o clique no mapa a define (RF-04). */}
        {escolhido && (
          <p className="coordenada">
            Local marcado: <code>{escolhido[0].toFixed(5)}, {escolhido[1].toFixed(5)}</code>
          </p>
        )}
      </div>
    </main>
  );
}
