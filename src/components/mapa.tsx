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

// O Leaflet injeta esta marcacao fora do React, entao o estilo vai inline em
// vez de classe do Tailwind: utilitario que so aparece dentro de uma string
// montada em tempo de execucao nao entra no CSS gerado.
const PINO =
  "display:grid;place-items:center;width:26px;height:26px;border-radius:50%;" +
  "color:#fff;font-size:12px;font-weight:700;border:2px solid #fff;" +
  "box-shadow:0 1px 3px rgb(0 0 0 / 0.35)";

/**
 * Pino com a foto do animal (RF-05, RF-12).
 *
 * A foto ocupa o circulo e a **borda** passa a carregar a cor do tipo. So
 * isso nao bastaria: cor sozinha nao distingue perdido de adocao para quem
 * nao ve vermelho e verde. Por isso vai junto um selo com a inicial, no
 * canto — mesma informacao da legenda, em cima da foto.
 *
 * Sem foto, cai no circulo colorido com a inicial, que e o que existia antes.
 */
function pino_com_foto(animal: AnimalNoMapa) {
  const cor = COR[animal.tipo_anuncio];

  return L.divIcon({
    className: "",
    html: `
      <span style="position:relative;display:block;width:44px;height:44px">
        <img src="${animal.foto_url}" alt=""
             style="width:44px;height:44px;border-radius:50%;object-fit:cover;
                    border:3px solid ${cor};box-shadow:0 1px 4px rgb(0 0 0 / 0.35);
                    background:#fff" />
        <span style="position:absolute;right:-2px;bottom:-2px;display:grid;
                     place-items:center;width:18px;height:18px;border-radius:50%;
                     background:${cor};color:#fff;font-size:10px;font-weight:700;
                     border:2px solid #fff">${INICIAL[animal.tipo_anuncio]}</span>
      </span>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

function pino(tipo: TipoDeAnuncio) {
  return L.divIcon({
    className: "",
    html: `<span style="${PINO};background:${COR[tipo]}">${INICIAL[tipo]}</span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

function alvo() {
  return L.divIcon({
    className: "",
    html: `<span style="${PINO};background:#332430">+</span>`,
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
      const icone = animal.foto_url
        ? pino_com_foto(animal)
        : pino(animal.tipo_anuncio);

      L.marker([animal.lat, animal.lng], { icon: icone })
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

  // A altura vem de quem usa: no detalhe o mapa e um bloco, na tela do mapa
  // ele ocupa o que sobra. O componente so preenche o espaco que recebe.
  return <div ref={div} className="h-full w-full" />;
}
