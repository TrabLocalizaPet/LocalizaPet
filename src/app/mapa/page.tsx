"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { Botao } from "@/components/ui/botao";
import { Apoio, Aviso, Tela, Titulo } from "@/components/ui/tela";
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
  loading: () => (
    <div className="grid h-full place-items-center text-sm text-suave">
      Carregando o mapa...
    </div>
  ),
});

type EstadoDoCentro = "padrao" | "buscando" | "navegador" | "negado";

const LEGENDA = [
  { cor: "bg-perdido", inicial: "P", rotulo: "Perdido" },
  { cor: "bg-encontrado", inicial: "E", rotulo: "Encontrado" },
  { cor: "bg-adocao", inicial: "A", rotulo: "Adocao" },
];

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
   * esgotado — cai no centro padrao, que ja valia desde o inicio.
   */
  function usar_minha_localizacao() {
    if (!navigator.geolocation) return definir_estado("negado");

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
    <Tela>
      <Titulo>Pets perto de voce</Titulo>
      <Apoio>
        {animais.length} anuncio(s) ativo(s). Toque no mapa para marcar um
        local.
      </Apoio>

      {/* Altura em `dvh` para nao encolher quando a barra do navegador do
          celular aparece e some. */}
      <div className="mt-3 h-[55dvh] overflow-hidden rounded-[--radius-padrao] border border-borda md:h-[65vh]">
        <Mapa
          animais={animais}
          centro={centro}
          local_escolhido={escolhido}
          ao_escolher_local={(lat, lng) => definir_escolhido([lat, lng])}
        />
      </div>

      <Botao
        className="mt-3"
        largo
        onClick={usar_minha_localizacao}
        disabled={estado === "buscando"}
      >
        {estado === "buscando" ? "Localizando..." : "Usar minha localizacao"}
      </Botao>

      {estado === "negado" && (
        <Aviso>
          Nao conseguimos sua localizacao. O mapa continua no centro padrao —
          arraste para procurar.
        </Aviso>
      )}

      <ul className="mt-3 flex flex-wrap gap-4 text-sm text-suave">
        {LEGENDA.map((item) => (
          <li key={item.rotulo} className="flex items-center gap-1.5">
            <span
              className={`grid size-6 place-items-center rounded-full border-2 border-white text-xs font-bold text-white shadow ${item.cor}`}
            >
              {item.inicial}
            </span>
            {item.rotulo}
          </li>
        ))}
      </ul>

      {/* O formulario de publicacao e a F-04. Aqui a coordenada so e exibida,
          para provar que o toque no mapa a define (RF-04). */}
      {escolhido && (
        <p className="mt-3 text-sm">
          Local marcado:{" "}
          <code className="rounded border border-borda bg-cartao px-1.5 py-0.5">
            {escolhido[0].toFixed(5)}, {escolhido[1].toFixed(5)}
          </code>
        </p>
      )}
    </Tela>
  );
}
