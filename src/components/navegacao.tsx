"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";

import { MarcaComNome } from "./marca";
import { classes } from "./ui/classes";
import {
  IconeBuscar,
  IconeInicio,
  IconePata,
  IconePerfil,
  IconeSino,
} from "./ui/icones";

/**
 * Navegacao, desenhada a partir da `navbar` do Figma (no 1:3312).
 *
 * No desenho a barra tem cinco lugares: Inicio, Buscar, o botao central
 * "Central Pet" com a pata, Mensagens e Perfil. **Mensagens fica de fora** —
 * o produto nao tem conversa entre pessoas (DT-05), e um lugar que leva a
 * lugar nenhum e pior que um lugar a menos.
 *
 * O botao central sobe acima da barra, como no desenho, e e o de publicar:
 * e a acao que o produto quer que aconteca.
 *
 * Mobile primeiro (DT-08): o que esta escrito sem prefixo e o layout de
 * 390 px; o `md:` transforma a barra em cabecalho, porque o Figma nao tem
 * desenho de desktop e a decisao esta registrada no docs/07-interface.md.
 */

type Destino = {
  href: string;
  rotulo: string;
  Icone: ComponentType<SVGProps<SVGSVGElement>>;
};

const ANTES: Destino[] = [
  { href: "/animais", rotulo: "Inicio", Icone: IconeInicio },
  { href: "/mapa", rotulo: "Buscar", Icone: IconeBuscar },
];

/**
 * Dois de cada lado, e isso **nao e enfeite**: a pata fica no meio da barra
 * so se os lados tiverem o mesmo numero de itens. Com dois a esquerda e um a
 * direita, como estava, ela caia a 62,5% da largura — perto do meio o
 * bastante para ninguem saber dizer o que estava errado, longe o bastante
 * para parecer torto.
 *
 * O desenho tem cinco lugares (Inicio, Buscar, Central Pet, Mensagens,
 * Perfil). "Mensagens" continua fora, porque nao ha conversa entre pessoas
 * (DT-05), e quem ocupa o lugar e "Avisos" — que existe desde a caixa de
 * notificacoes (RF-25) e assim fica alcancavel de qualquer tela, nao so da
 * Home.
 */
const DEPOIS: Destino[] = [
  { href: "/notificacoes", rotulo: "Avisos", Icone: IconeSino },
  { href: "/perfil", rotulo: "Perfil", Icone: IconePerfil },
];

function estaAtivo(caminho: string, href: string) {
  return caminho.startsWith(href);
}

function Aba({ destino, ativo }: { destino: Destino; ativo: boolean }) {
  const { Icone } = destino;

  return (
    <Link
      href={destino.href}
      aria-current={ativo ? "page" : undefined}
      className={classes(
        // 44px de alvo de toque: o produto e usado no celular, na rua.
        "flex min-h-11 flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition",
        "md:min-h-0 md:flex-row md:gap-2 md:rounded-[--radius-padrao] md:px-3 md:py-2 md:text-sm",
        ativo ? "text-primaria font-semibold" : "text-suave hover:text-texto",
      )}
    >
      <Icone className="size-6 md:size-5" />
      {destino.rotulo}
    </Link>
  );
}

export default function Navegacao() {
  const caminho = usePathname();

  // Telas sem barra: a de boas-vindas e as de conta, porque no Figma elas
  // vem antes de haver aonde navegar; o painel de diagnostico, que e
  // ferramenta de quem desenvolve e nao tela de produto; e o cadastro do
  // pet, que e um fluxo em passos — no desenho ele ocupa a tela inteira, e
  // a barra competiria com o "Proximo" bem onde ele fica.
  const SEM_BARRA = ["/", "/entrar", "/cadastro", "/diagnostico", "/publicar"];
  if (SEM_BARRA.some((r) => (r === "/" ? caminho === "/" : caminho.startsWith(r)))) {
    return null;
  }

  const publicando = caminho.startsWith("/publicar");

  return (
    <nav
      aria-label="Navegacao principal"
      className={classes(
        "fixed inset-x-0 bottom-0 z-[1000] flex items-stretch border-t border-borda bg-cartao",
        "pb-[env(safe-area-inset-bottom)]",
        "md:sticky md:top-0 md:bottom-auto md:block md:border-t-0 md:border-b md:py-2",
      )}
    >
      {/* No desktop o conteudo da barra fica na mesma coluna central das
          telas (max-w-4xl do componente Tela), em vez de grudado nas bordas
          da janela: a barra e o cabecalho, e cabecalho desalinhado do
          conteudo faz a pagina parecer torta. */}
      <div className="contents md:mx-auto md:flex md:w-full md:max-w-4xl md:items-center md:gap-6 md:px-5">
      <Link href="/animais" className="hidden md:block">
        <MarcaComNome />
      </Link>

      <div className="flex flex-1 items-stretch md:items-center md:justify-center md:gap-1">
        {ANTES.map((destino) => (
          <Aba
            key={destino.href}
            destino={destino}
            ativo={estaAtivo(caminho, destino.href)}
          />
        ))}

        {/* "Central Pet": no celular ele sobe acima da barra, no meio, como
            no Figma. No desktop sai do meio e vai para a ponta direita
            (`md:order-last md:ml-auto`): ali ele deixa de disputar o centro
            com as abas e passa a ocupar o lugar onde cabecalho de web poe a
            acao principal. */}
        <Link
          href="/publicar"
          aria-label="Publicar anuncio"
          aria-current={publicando ? "page" : undefined}
          className="flex flex-1 flex-col items-center md:order-last md:ml-auto md:flex-none md:flex-row md:gap-2"
        >
          <IconePata
            className={classes(
              "-mt-5 size-16 drop-shadow-md transition md:mt-0 md:size-10 md:drop-shadow-none",
              publicando && "scale-105",
            )}
          />
          <span
            className={classes(
              "pb-2 text-xs md:pb-0 md:text-sm",
              publicando ? "text-primaria font-semibold" : "text-suave",
            )}
          >
            Publicar
          </span>
        </Link>

        {DEPOIS.map((destino) => (
          <Aba
            key={destino.href}
            destino={destino}
            ativo={estaAtivo(caminho, destino.href)}
          />
        ))}
      </div>
      </div>
    </nav>
  );
}
