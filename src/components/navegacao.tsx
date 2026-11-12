"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { ComponentType, SVGProps } from "react";

import { MarcaComNome } from "./marca";
import { classes } from "./ui/classes";
import {
  IconeBuscar,
  IconeInicio,
  IconePata,
  IconePerfil,
  IconeSair,
  IconeSino,
} from "./ui/icones";
import { useSair } from "@/lib/auth-navegador";
import type { NotificacaoNaCaixa } from "@/queries/notificacoes";

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
  { href: "/animais", rotulo: "Início", Icone: IconeInicio },
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

/**
 * Evento que a caixa de notificacoes dispara depois de marcar como lida, para
 * a contagem do cabecalho nao continuar mostrando o numero antigo enquanto a
 * pessoa ainda esta na caixa.
 */
export const NOTIFICACOES_MUDARAM = "localizapet:notificacoes-mudaram";

/**
 * Quem esta navegando e quantas notificacoes nao leu.
 *
 * No celular isto fica no cabecalho da Home (o sino e o sair); no desktop
 * aquele cabecalho some, e o que ele dizia passa a morar aqui. Uma requisicao
 * so responde as duas perguntas: `/api/notificacoes` devolve 401 para o
 * visitante (RF-22) e a caixa para quem entrou.
 *
 * Busca de novo a cada troca de tela, como o sino: em ambiente serverless nao
 * ha conexao aberta para empurrar o numero (RN-30).
 */
function useCaixa(caminho: string, ativa: boolean) {
  const [autenticado, definir_autenticado] = useState<boolean | null>(null);
  const [nao_lidas, definir_nao_lidas] = useState(0);

  useEffect(() => {
    if (!ativa) return;

    function buscar() {
      fetch("/api/notificacoes")
        .then(async (r) => {
          definir_autenticado(r.status !== 401);
          if (!r.ok) return definir_nao_lidas(0);
          const caixa: NotificacaoNaCaixa[] = await r.json();
          definir_nao_lidas(caixa.filter((n) => n.lida_em === null).length);
        })
        .catch(() => undefined);
    }

    buscar();
    window.addEventListener(NOTIFICACOES_MUDARAM, buscar);
    return () => window.removeEventListener(NOTIFICACOES_MUDARAM, buscar);
  }, [caminho, ativa]);

  return { autenticado, nao_lidas };
}

function Aba({
  destino,
  ativo,
  contagem = 0,
}: {
  destino: Destino;
  ativo: boolean;
  contagem?: number;
}) {
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
      {/* So no desktop: no celular o numero ja esta no sino da Home, que e o
          que o Figma desenha, e a aba fica como no desenho. */}
      {contagem > 0 && (
        <span className="hidden min-w-5 place-items-center rounded-full bg-perdido px-1.5 text-xs font-bold text-white md:grid">
          {contagem > 9 ? "9+" : contagem}
          <span className="sr-only">{contagem === 1 ? " não lida" : " não lidas"}</span>
        </span>
      )}
    </Link>
  );
}

// Telas sem barra: a de boas-vindas e as de conta, porque no Figma elas
// vem antes de haver aonde navegar; o painel de diagnostico, que e
// ferramenta de quem desenvolve e nao tela de produto; e o cadastro do
// pet, que e um fluxo em passos — no desenho ele ocupa a tela inteira, e
// a barra competiria com o "Proximo" bem onde ele fica. O alerta de fuga
// e o mesmo caso, com o "Publicar alerta" no rodape.
const SEM_BARRA = ["/", "/entrar", "/cadastro", "/diagnostico", "/publicar", "/alerta"];

export default function Navegacao() {
  const caminho = usePathname();
  const sem_barra = SEM_BARRA.some((r) =>
    r === "/" ? caminho === "/" : caminho.startsWith(r),
  );
  const { autenticado, nao_lidas } = useCaixa(caminho, !sem_barra);
  const sair = useSair();

  if (sem_barra) return null;

  const publicando = caminho.startsWith("/publicar");

  return (
    <nav
      aria-label="Navegação principal"
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
          aria-label="Publicar anúncio"
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
            contagem={destino.href === "/notificacoes" ? nao_lidas : 0}
          />
        ))}
      </div>

      {/* O sair do cabecalho da Home, que no desktop nao aparece. Para o
          visitante o lugar vira o "Entrar", pelo mesmo motivo de la: e o que
          falta para ele. Nada aparece enquanto nao se sabe, para nao piscar. */}
      {autenticado === true && (
        <button
          type="button"
          onClick={sair}
          className="hidden items-center gap-2 rounded-[--radius-padrao] px-3 py-2 text-sm text-suave transition hover:text-texto md:flex"
        >
          <IconeSair className="size-5" />
          Sair
        </button>
      )}
      {autenticado === false && (
        <Link
          href="/entrar"
          className="hidden rounded-[--radius-padrao] px-3 py-2 text-sm font-semibold text-primaria md:block"
        >
          Entrar
        </Link>
      )}
      </div>
    </nav>
  );
}
