"use client";

import { useCallback, useState } from "react";

/**
 * A posicao do aparelho pelo navegador (RF-13).
 *
 * Morava dentro de `app/mapa/page.tsx`. Saiu de la quando o alerta de fuga e
 * o passo do local do `/publicar` precisaram da mesma coisa: quem esta na
 * rua, no lugar onde viu o animal pela ultima vez, nao deveria ter de achar
 * esse lugar arrastando um mapa no celular.
 *
 * O aceite e o caminho do erro: negar a permissao, estar sem GPS ou o tempo
 * esgotar **nao pode travar a tela**. Todo desfecho ruim vira o estado
 * `"negado"`, e quem usa continua tendo o toque no mapa como alternativa.
 *
 * O nome comeca com `use` porque e um hook do React — e e isso que faz o
 * lint conferir as regras de hook nele. A excecao a convencao de nomes do
 * projeto e do React, nao nossa.
 */

export type EstadoDaLocalizacao = "parado" | "buscando" | "achou" | "negado";

export type Posicao = {
  lat: number;
  lng: number;
  /** Raio de incerteza em metros, como o navegador informa. */
  precisao: number;
};

/**
 * Acima disto o ponto pode cair na quadra errada — vale avisar para conferir
 * no mapa. Duzentos metros e o que um celular dentro de casa costuma dar sem
 * GPS, so por Wi-Fi.
 */
export const PRECISAO_BOA = 200;

export function useMinhaLocalizacao() {
  const [estado, definir_estado] = useState<EstadoDaLocalizacao>("parado");
  const [posicao, definir_posicao] = useState<Posicao | null>(null);

  const pedir = useCallback(
    (ao_achar?: (posicao: Posicao) => void) => {
      if (!navigator.geolocation) return definir_estado("negado");

      definir_estado("buscando");
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const achada = {
            lat: coords.latitude,
            lng: coords.longitude,
            precisao: coords.accuracy,
          };
          definir_posicao(achada);
          definir_estado("achou");
          ao_achar?.(achada);
        },
        () => definir_estado("negado"),
        // Alta precisao: o local vira o primeiro avistamento (RN-12), e o
        // pino precisa estar na rua certa, nao no bairro certo. `maximumAge`
        // aceita uma leitura de ate um minuto — o animal sumiu agora, e uma
        // posicao de ontem do cache levaria o pino para outro lugar.
        { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
      );
    },
    [],
  );

  return { estado, posicao, pedir };
}
