"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

import { CENTRO_PADRAO } from "@/lib/geo";
import type { AnimalNoMapa, TipoDeAnuncio } from "@/types/animal";

/**
 * Mapa com Leaflet e OpenStreetMap (DT-04, RNF-12).
 *
 * Leaflet e biblioteca de navegador: toca `window` na importacao. Por isso o
 * componente e `"use client"` e quem o usa carrega com `ssr: false` — ver
 * `src/app/mapa/page.tsx`. Sem isso o build quebra.
 *
 * Leaflet puro, sem react-leaflet: o mapa tem ciclo de vida proprio e uma
 * camada a mais so acrescentaria uma versao para manter compativel com o
 * React.
 */

const COR: Record<TipoDeAnuncio, string> = {
  perdido: "#e7000b",
  encontrado: "#f68b1e",
  adocao: "#2e7d32",
};

// A inicial acompanha a cor de proposito. Cor sozinha nao distingue os tres
// tipos para quem nao enxerga a diferenca entre vermelho e verde — e sao
// justamente "perdido" e "adocao", os dois extremos do produto.
const INICIAL: Record<TipoDeAnuncio, string> = {
  perdido: "P",
  encontrado: "E",
  adocao: "A",
};

function pino(tipo: TipoDeAnuncio) {
  return L.divIcon({
    className: "",
    html: `<span class="pino" style="background:${COR[tipo]}">${INICIAL[tipo]}</span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

function alvo() {
  return L.divIcon({
    className: "",
    html: `<span class="pino alvo">+</span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

type Props = {
  animais: AnimalNoMapa[];
  centro: [number, number];
  /** Coordenada escolhida por clique (RF-04). `null` = nenhuma ainda. */
  local_escolhido: [number, number] | null;
  /** Quando presente, clicar no mapa escolhe um local. */
  ao_escolher_local?: (lat: number, lng: number) => void;
};

export default function Mapa({
  animais,
  centro,
  local_escolhido,
  ao_escolher_local,
}: Props) {
  const div = useRef<HTMLDivElement>(null);
  const mapa = useRef<L.Map | null>(null);
  const camada_pinos = useRef<L.LayerGroup | null>(null);
  const marca_escolhida = useRef<L.Marker | null>(null);

  // A funcao mora numa ref para o mapa nao precisar ser recriado toda vez que
  // o componente pai renderiza com um callback novo.
  const escolher = useRef(ao_escolher_local);
  escolher.current = ao_escolher_local;

  useEffect(() => {
    if (!div.current || mapa.current) return;

    const m = L.map(div.current).setView(CENTRO_PADRAO, 14);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      // Exigida pela licenca do OpenStreetMap.
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(m);

    m.on("click", (evento: L.LeafletMouseEvent) => {
      escolher.current?.(evento.latlng.lat, evento.latlng.lng);
    });

    camada_pinos.current = L.layerGroup().addTo(m);
    mapa.current = m;

    return () => {
      m.remove();
      mapa.current = null;
      camada_pinos.current = null;
      marca_escolhida.current = null;
    };
  }, []);

  // Pinos dos anuncios (RF-12).
  useEffect(() => {
    const camada = camada_pinos.current;
    if (!camada) return;

    camada.clearLayers();

    for (const animal of animais) {
      const nome = animal.nome ?? "Sem nome";
      L.marker([animal.lat, animal.lng], { icon: pino(animal.tipo_anuncio) })
        .bindPopup(
          `<strong>${nome}</strong><br>${animal.tipo_anuncio} · ${animal.especie}`,
        )
        .addTo(camada);
    }
  }, [animais]);

  // Centro (RF-13): muda quando a geolocalizacao responde.
  useEffect(() => {
    mapa.current?.setView(centro, 14);
  }, [centro]);

  // Marca do local escolhido por clique (RF-04).
  useEffect(() => {
    const m = mapa.current;
    if (!m) return;

    marca_escolhida.current?.remove();
    marca_escolhida.current = null;

    if (local_escolhido) {
      marca_escolhida.current = L.marker(local_escolhido, {
        icon: alvo(),
      }).addTo(m);
    }
  }, [local_escolhido]);

  return <div ref={div} className="mapa" />;
}
