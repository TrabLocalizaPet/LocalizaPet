import Image from "next/image";
import type { ReactNode } from "react";

import { MarcaComNome } from "./marca";

/**
 * Tela dividida — o desktop das telas de fluxo (boas-vindas, entrar,
 * cadastro, publicar e alerta).
 *
 * **O Figma nao tem desktop** (docs/07-interface.md). No celular estas telas
 * ocupam o quadro de 390 px inteiro; numa janela larga, a mesma coluna sozinha
 * no meio do branco parecia uma tela de celular esquecida no monitor. A
 * decisao do grupo foi dividir: a coluna do celular fica a direita, intacta,
 * e a esquerda ganha um painel com a ilustracao que o desenho ja tem.
 *
 * Nada novo e desenhado aqui. O painel so reaproveita os assets exportados.
 *
 * Abaixo de `lg` o painel nao existe e a tela e exatamente a do celular. A
 * divisao entra em `lg` (64rem), e nao em `md` como a navegacao: a 48rem
 * sobrariam ~320 px para o painel, e a ilustracao ficaria menor que na
 * propria coluna.
 *
 * O involucro da coluna e `relative`: os grafismos de fundo (`FormasDeFundo`)
 * se posicionam nele a partir de `md`, quando o `<main>` da tela deixa de ser
 * `relative`. Assim eles vao para os cantos da janela em vez de ficarem
 * cortados na borda da coluna de 28rem.
 */
export function TelaDividida({
  lateral,
  children,
}: {
  lateral: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(28rem,42%)]">
      {lateral}
      <div className="relative overflow-x-clip">{children}</div>
    </div>
  );
}

/**
 * O painel da esquerda: o creme da marca, o logotipo e a ilustracao do fluxo
 * num circulo branco — o mesmo miolo branco dos aneis da Splash.
 *
 * O circulo tambem resolve um problema pratico: `inicio-cadastro-pet.png` foi
 * exportado com fundo branco, e sobre o creme ele viraria um retangulo.
 *
 * `sticky` e `h-dvh`: os fluxos de publicacao rolam (mapa, fotos, descricao),
 * e o painel fica parado enquanto a coluna anda.
 *
 * `foto` troca a composicao pela foto sangrada, que e o caso da boas-vindas —
 * la a marca e a frase ja estao na coluna, e repeti-las seria ruido.
 */
export function PainelLateral({
  imagem,
  foto = false,
}: {
  imagem: string;
  foto?: boolean;
}) {
  if (foto) {
    return (
      <aside
        aria-hidden="true"
        className="sticky top-0 hidden h-dvh overflow-hidden lg:block"
      >
        {/* `quality` 90: a foto ja chega ampliada (ver a tabela de assets
            do docs/07-interface.md), e recomprimir no padrao de 75 somava
            artefato sobre artefato. */}
        <Image
          src={imagem}
          alt=""
          fill
          priority
          quality={90}
          sizes="58vw"
          className="object-cover"
        />
      </aside>
    );
  }

  return (
    <aside
      aria-hidden="true"
      className="sticky top-0 hidden h-dvh flex-col items-center justify-center gap-10 overflow-hidden bg-creme px-12 lg:flex"
    >
      <MarcaComNome largura={186} />

      <div className="relative grid aspect-square w-full max-w-md place-items-center rounded-full bg-white">
        <div className="relative size-[68%]">
          <Image src={imagem} alt="" fill sizes="20rem" className="object-contain" />
        </div>
      </div>

      {/* A frase da boas-vindas, em Mitr e na cor secundaria, como no no 1:600. */}
      <p className="text-center font-titulo text-2xl leading-tight font-semibold text-secundaria">
        Conecte corações.
        <br />
        Reencontre histórias.
      </p>
    </aside>
  );
}
