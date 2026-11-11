"use client";

import { Botao } from "./ui/botao";
import { IconePino } from "./ui/icones";
import { Apoio, Aviso } from "./ui/tela";
import {
  PRECISAO_BOA,
  type EstadoDaLocalizacao,
  type Posicao,
} from "@/lib/geolocalizacao";

/**
 * "Usar minha localizacao", com o que aconteceu depois (RF-13).
 *
 * Fica acima do mapa nas telas que marcam local. **O toque no mapa continua
 * valendo** (RF-04): o GPS e o atalho de quem esta no lugar, nao a unica
 * porta — quem viu o animal fugir ontem, na casa da avo, marca no mapa.
 *
 * Os recados existem porque o botao sozinho mentiria nos dois desfechos
 * ruins: negado parece que nao fez nada, e impreciso parece que acertou.
 */
export function BotaoDeLocalizacao({
  estado,
  posicao,
  ao_pedir,
}: {
  estado: EstadoDaLocalizacao;
  posicao: Posicao | null;
  ao_pedir: () => void;
}) {
  return (
    <div className="grid gap-2">
      <Botao
        aparencia="secundaria"
        largo
        type="button"
        onClick={ao_pedir}
        disabled={estado === "buscando"}
      >
        <IconePino className="mr-2 inline size-5 align-[-0.2em]" />
        {estado === "buscando" ? "Localizando..." : "Usar minha localizacao"}
      </Botao>

      {estado === "negado" && (
        <Aviso>
          Nao conseguimos sua localizacao. Toque no mapa para marcar o local.
        </Aviso>
      )}

      {estado === "achou" && posicao && posicao.precisao > PRECISAO_BOA && (
        <Apoio>
          Localizacao aproximada, com cerca de {Math.round(posicao.precisao)} m de
          margem. Confira o ponto e toque no mapa para ajustar.
        </Apoio>
      )}
    </div>
  );
}
