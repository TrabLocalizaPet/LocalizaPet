"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { Botao } from "@/components/ui/botao";
import { Apoio, Aviso, Tela, Titulo } from "@/components/ui/tela";
import { CENTRO_PADRAO } from "@/lib/geo";
import { useMinhaLocalizacao } from "@/lib/geolocalizacao";
import type { AnimalNoMapa } from "@/types/animal";

/**
 * Mapa dos anuncios (RF-12, RF-13).
 *
 * O toque no mapa nao marca local aqui: isso era a prova do RF-04 antes de
 * a publicacao existir, e hoje mora no passo do local em `/publicar`.
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

const LEGENDA = [
  { cor: "bg-perdido", inicial: "P", rotulo: "Perdido" },
  { cor: "bg-encontrado", inicial: "E", rotulo: "Encontrado" },
  { cor: "bg-adocao", inicial: "A", rotulo: "Adoção" },
];

export default function PaginaDoMapa() {
  const [animais, definir_animais] = useState<AnimalNoMapa[]>([]);
  const [centro, definir_centro] = useState<[number, number]>(CENTRO_PADRAO);

  useEffect(() => {
    fetch("/api/animais/mapa")
      .then((r) => r.json())
      .then(definir_animais)
      .catch(() => definir_animais([]));
  }, []);

  // RF-13. Todo desfecho ruim cai no centro padrao, que ja valia desde o
  // inicio — ver `useMinhaLocalizacao`.
  const localizacao = useMinhaLocalizacao();
  const estado = localizacao.estado;

  function usar_minha_localizacao() {
    localizacao.pedir((posicao) => definir_centro([posicao.lat, posicao.lng]));
  }

  return (
    <Tela>
      {/* No desktop o botao sobe para a linha do titulo e o mapa ocupa a
          altura que sobra da janela: embaixo do mapa ele ficava abaixo da
          dobra, e o mapa e a tela. A grade so existe a partir de `md`; no
          celular a ordem e a do fluxo. */}
      <div className="md:grid md:grid-cols-[1fr_auto] md:items-end md:gap-x-6">
        <div>
          <Titulo>Pets perto de você</Titulo>
          <Apoio>
            {animais.length} anúncio(s) ativo(s). Toque num pino para ver o
            anúncio.
          </Apoio>
        </div>

        {/* Altura em `dvh` para nao encolher quando a barra do navegador do
            celular aparece e some. */}
        <div className="mt-3 h-[55dvh] overflow-hidden rounded-[--radius-padrao] border border-borda md:col-span-2 md:h-[calc(100dvh-15rem)] md:min-h-96">
          <Mapa
            animais={animais}
            centro={centro}
            local_escolhido={null}
          />
        </div>

        <Botao
          className="mt-3 md:col-start-2 md:row-start-1 md:mt-0 md:w-auto"
          largo
          onClick={usar_minha_localizacao}
          disabled={estado === "buscando"}
        >
          {estado === "buscando" ? "Localizando..." : "Usar minha localização"}
        </Botao>

        {estado === "negado" && (
          <div className="md:col-span-2">
            <Aviso>
              Não conseguimos sua localização. O mapa continua no centro padrão —
              arraste para procurar.
            </Aviso>
          </div>
        )}

        <ul className="mt-3 flex flex-wrap gap-4 text-sm text-suave md:col-span-2">
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
      </div>
    </Tela>
  );
}
