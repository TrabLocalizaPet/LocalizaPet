"use client";

import type { ComponentType, SVGProps } from "react";

import { classes } from "./ui/classes";
import { IconeCoracao, IconePino, IconeTutor } from "./ui/icones";
import type { TipoDeAnuncio } from "@/types/animal";

/**
 * Atalhos por tipo de anuncio — nos 1:3283 a 1:3286 da Home no Figma.
 *
 * Quadrados de 72x72 com canto de 8 e sombra leve, icone de 24 e rotulo de
 * 11 px. O selecionado inverte: fundo laranja e conteudo branco.
 *
 * **O desenho tem quatro atalhos, e aqui sao tres.** O quarto e "Ongs", e
 * nao existe organizacao no modelo de dados (`docs/04-modelo-dados.md`) nem
 * requisito que a crie — seria um atalho para uma tela vazia. Mesma decisao
 * do "Mensagens" na barra de navegacao.
 *
 * Os tres que ficam sao os `tipo_anuncio` do schema (RN-02), e os rotulos sao
 * os do desenho: "Achar tutor" diz melhor que "Encontrado" o que a pessoa faz
 * ali — ela achou um animal e procura quem o perdeu.
 */

type Atalho = {
  tipo: TipoDeAnuncio;
  rotulo: string;
  Icone: ComponentType<SVGProps<SVGSVGElement>>;
};

const ATALHOS: Atalho[] = [
  { tipo: "perdido", rotulo: "Perdidos", Icone: IconePino },
  { tipo: "adocao", rotulo: "Adocao", Icone: IconeCoracao },
  { tipo: "encontrado", rotulo: "Achar tutor", Icone: IconeTutor },
];

export function AtalhosPorTipo({
  selecionado,
  ao_escolher,
}: {
  /** `null` e "todos", o estado em que a Home abre. */
  selecionado: TipoDeAnuncio | null;
  ao_escolher: (tipo: TipoDeAnuncio | null) => void;
}) {
  return (
    <ul className="flex items-center gap-3">
      {ATALHOS.map(({ tipo, rotulo, Icone }) => {
        const marcado = selecionado === tipo;

        return (
          <li key={tipo}>
            <button
              type="button"
              // Clicar no atalho ja marcado desmarca: sem isso nao haveria
              // como voltar a "todos" sem procurar o "Ver todos" la em cima.
              onClick={() => ao_escolher(marcado ? null : tipo)}
              aria-pressed={marcado}
              className={classes(
                "flex size-[72px] flex-col items-center justify-center gap-1 rounded-[--radius-padrao] shadow-[0_0_4px_0_rgba(0,0,0,0.2)] transition",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria",
                marcado ? "bg-primaria text-white" : "bg-cartao text-texto",
              )}
            >
              <Icone
                className={classes("size-6", marcado ? "text-white" : "text-primaria")}
              />
              <span className="text-[11px] leading-4 font-medium">{rotulo}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
