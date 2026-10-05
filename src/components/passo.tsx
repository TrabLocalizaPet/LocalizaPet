"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useState } from "react";

import { classes } from "./ui/classes";
import { IconeDesmarcado, IconeMarcado, SetaVoltar } from "./ui/icones";

/**
 * As pecas das telas de passo do Figma.
 *
 * O desenho tem **dois fluxos em passos** — o cadastro da pessoa (nos 1:1892
 * e seguintes) e o do pet (nos 1:1922 e seguintes) — e os dois usam a mesma
 * casca: seta de voltar em y=44 e x=28, titulo em Mitr 24 centralizado logo
 * abaixo, o conteudo no meio e o botao de 326x40 embaixo.
 *
 * Estava tudo escrito dentro de `app/cadastro/page.tsx`, privado. Virou
 * componente quando o cadastro do pet precisou das mesmas pecas: utilitario
 * repetido em duas telas e componente faltando (DT-08).
 */

/** Quadro de 390x844 do desenho, centralizado no desktop. */
export function Casca({ children }: { children: ReactNode }) {
  return (
    <main className="relative mx-auto flex min-h-dvh max-w-md flex-col">
      {children}
    </main>
  );
}

/** Seta de voltar em y=44, x=28 — a mesma posicao em todas as telas do fluxo. */
export function Topo({
  aoVoltar,
  rotulo = "Voltar",
}: {
  aoVoltar: () => void;
  rotulo?: string;
}) {
  return (
    <div className="px-7 pt-3">
      <button
        type="button"
        onClick={aoVoltar}
        aria-label={rotulo}
        className="-ml-3 inline-grid size-11 place-items-center text-primaria"
      >
        <SetaVoltar className="size-6" />
      </button>
    </div>
  );
}

/**
 * Titulo da pergunta, com a linha de apoio opcional embaixo.
 *
 * Mitr 24 no desenho do cadastro do pet e 20 no da pessoa; o `tamanho`
 * escolhe entre os dois em vez de cada tela escrever a propria classe.
 */
export function TituloDoPasso({
  children,
  apoio,
  tamanho = "grande",
}: {
  children: ReactNode;
  apoio?: ReactNode;
  tamanho?: "grande" | "normal";
}) {
  return (
    <div className="px-8">
      <h1
        className={classes(
          "mt-[4dvh] text-center font-titulo leading-tight font-medium",
          tamanho === "grande" ? "text-2xl" : "text-xl font-semibold",
        )}
      >
        {children}
      </h1>
      {apoio && (
        <p className="mx-auto mt-4 max-w-66 text-center text-sm leading-snug text-suave/80">
          {apoio}
        </p>
      )}
    </div>
  );
}

/**
 * Item da lista de opcoes — no 1:2421 do Figma, com os dois estados.
 *
 * 56 px de altura, canto de 8, 16 px nas laterais. Selecionado inverte para
 * laranja e troca o circulo vazio pelo certo.
 *
 * E `<button aria-pressed>`, e nao `<input type=radio>`, porque o desenho
 * desenha a escolha inteira como um alvo so e porque algumas listas aceitam
 * desmarcar (sexo, por exemplo, pode ficar em "nao sei").
 */
export function OpcaoDeLista({
  rotulo,
  apoio,
  marcada,
  onClick,
}: {
  rotulo: ReactNode;
  apoio?: ReactNode;
  marcada: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={marcada}
      className={classes(
        "flex min-h-14 w-full items-center justify-between gap-3 rounded-[--radius-padrao] border px-4 py-3 text-left transition",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria",
        marcada
          ? "border-primaria bg-primaria text-white"
          : "border-[#c6c6c6] bg-cartao text-texto",
      )}
    >
      <span>
        <span className="block text-base font-medium">{rotulo}</span>
        {apoio && (
          <span
            className={classes(
              "block text-sm",
              marcada ? "text-white/85" : "text-suave",
            )}
          >
            {apoio}
          </span>
        )}
      </span>

      {marcada ? (
        <IconeMarcado className="size-6 shrink-0 text-white" />
      ) : (
        <IconeDesmarcado className="size-6 shrink-0 text-[#f4a462]" />
      )}
    </button>
  );
}

/** A lista inteira, com o espaco de 16 px entre os itens do desenho. */
export function ListaDeOpcoes({ children }: { children: ReactNode }) {
  return <ul className="mt-8 grid gap-4 px-8">{children}</ul>;
}

/**
 * Ilustracao das telas de abertura e de sucesso.
 *
 * A proporcao 270x268 e a do desenho, e a largura de 69% vem de 270 sobre os
 * 390 do quadro. O `onError` esconde o quadro se o arquivo sumir, em vez de
 * deixar o icone de imagem quebrada no meio da tela.
 */
export function Ilustracao({
  arquivo,
  descricao,
  className,
}: {
  arquivo: string;
  descricao: string;
  className?: string;
}) {
  const [falhou, definir_falhou] = useState(false);

  return (
    <div className={`relative aspect-[270/268] w-[69%] ${className ?? ""}`}>
      {!falhou && (
        <Image
          src={arquivo}
          alt={descricao}
          fill
          className="object-contain"
          onError={() => definir_falhou(true)}
        />
      )}
    </div>
  );
}
