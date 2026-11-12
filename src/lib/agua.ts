"use client";

import { useEffect, useState } from "react";

/**
 * O ponto marcado parece estar na agua?
 *
 * Nasceu de um anuncio real: a Fiona "sumiu perto do Campo de Sao Bento" e
 * o pino foi parar na Baia de Guanabara, 1,7 km a oeste. Toque errado no
 * mapa ou localizacao do navegador de computador, que erra por quilometros —
 * nao ha como saber, mas os dois tem o mesmo remedio: avisar na hora,
 * enquanto a pessoa ainda pode corrigir.
 *
 * **Como sabe.** Le a cor do pixel do pino no proprio tile do OpenStreetMap
 * que o mapa ja mostra. No estilo padrao do OSM a agua e sempre `#aad3df`, e
 * nenhuma outra coisa usa essa cor. Sem servico novo, sem chave e sem custo
 * (RNF-01, RNF-12); o tile do zoom 17 costuma ja estar no cache do navegador.
 * Os tiles do OSM mandam `Access-Control-Allow-Origin: *`, o que permite ler
 * o pixel num canvas.
 *
 * **E heuristica, e o aviso nao bloqueia.** Animal pode estar num barco, no
 * pier ou numa ilha pequena que o tile nao desenha. Em qualquer falha (tile
 * fora, sem rede) a resposta e `false`: melhor nao avisar do que avisar
 * errado.
 */

const AGUA = [170, 211, 223] as const;
const TOLERANCIA = 6;
const ZOOM = 17;

/** Tile e pixel dentro dele, pela projecao do OSM (Web Mercator). */
function posicao_no_tile(lat: number, lng: number) {
  const n = 2 ** ZOOM;
  const x = ((lng + 180) / 360) * n;
  const rad = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n;
  return {
    tx: Math.floor(x),
    ty: Math.floor(y),
    px: Math.floor((x % 1) * 256),
    py: Math.floor((y % 1) * 256),
  };
}

export async function parece_agua(lat: number, lng: number): Promise<boolean> {
  const { tx, ty, px, py } = posicao_no_tile(lat, lng);

  try {
    const imagem = new Image();
    imagem.crossOrigin = "anonymous";
    imagem.src = `https://tile.openstreetmap.org/${ZOOM}/${tx}/${ty}.png`;
    await imagem.decode();

    const tela = document.createElement("canvas");
    tela.width = tela.height = 256;
    const contexto = tela.getContext("2d", { willReadFrequently: true });
    if (!contexto) return false;
    contexto.drawImage(imagem, 0, 0);

    // O pixel exato pode cair num rotulo ou numa borda desenhada sobre a
    // agua. O ponto e os quatro vizinhos a 3 px: tres de cinco decidem.
    const amostras = [
      [0, 0],
      [-3, 0],
      [3, 0],
      [0, -3],
      [0, 3],
    ].map(([dx, dy]) => {
      const x = Math.min(255, Math.max(0, px + dx));
      const y = Math.min(255, Math.max(0, py + dy));
      const [r, g, b] = contexto.getImageData(x, y, 1, 1).data;
      return [r, g, b].every((c, i) => Math.abs(c - AGUA[i]) <= TOLERANCIA);
    });

    return amostras.filter(Boolean).length >= 3;
  } catch {
    return false;
  }
}

/**
 * `true` quando o ponto escolhido parece estar na agua. Reconsulta a cada
 * mudanca do ponto e descarta a resposta de um ponto que ja foi trocado —
 * sem isso, dois toques rapidos podiam mostrar o aviso do primeiro.
 */
export function useNaAgua(local: [number, number] | null): boolean {
  const [na_agua, definir_na_agua] = useState(false);

  useEffect(() => {
    definir_na_agua(false);
    if (!local) return;

    let valido = true;
    parece_agua(local[0], local[1]).then((sim) => {
      if (valido) definir_na_agua(sim);
    });
    return () => {
      valido = false;
    };
  }, [local]);

  return na_agua;
}
