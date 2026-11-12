"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { classes } from "./ui/classes";
import { Seta } from "./ui/icones";

/**
 * Carrossel das fotos do anuncio, na foto grande do detalhe.
 *
 * O anuncio aceita ate 6 fotos (o `max(6)` da rota), mas o detalhe mostrava a capa em
 * tamanho grande e as outras como miniaturas paradas, de 8rem. Para quem
 * tenta reconhecer o proprio animal, a foto de lado ou a da mancha na pata
 * importa tanto quanto a capa.
 *
 * **A rolagem e do navegador** (`scroll-snap`), e nao uma animacao nossa: o
 * arrastar no celular tem a inercia e o "encaixe" que a pessoa ja conhece, e
 * funciona mesmo antes de o JavaScript carregar. O componente so acompanha
 * em qual foto a rolagem parou e, no sentido contrario, rola ate a foto
 * escolhida por fora (seta, teclado ou miniatura).
 *
 * O indice mora em quem usa (`atual`/`ao_mudar`) porque as miniaturas ficam
 * em outra coluna no desktop, fora deste componente.
 */
export function CarrosselDeFotos({
  fotos,
  nome,
  atual,
  ao_mudar,
}: {
  fotos: string[];
  nome: string;
  atual: number;
  ao_mudar: (indice: number) => void;
}) {
  const trilho = useRef<HTMLDivElement>(null);
  const espera = useRef<ReturnType<typeof setTimeout>>(undefined);

  // De fora para dentro: a seta ou a miniatura mudou o indice, e a rolagem
  // vai ate ele. A tolerancia de 2 px evita rolar de novo quando a mudanca
  // veio da propria rolagem.
  useEffect(() => {
    const t = trilho.current;
    if (!t) return;
    const alvo = atual * t.clientWidth;
    if (Math.abs(t.scrollLeft - alvo) < 2) return;

    const sem_movimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    t.scrollTo({ left: alvo, behavior: sem_movimento ? "auto" : "smooth" });
  }, [atual]);

  /**
   * De dentro para fora: so depois que a rolagem para. Atualizar a cada
   * evento brigava com a rolagem suave de uma miniatura distante — passando
   * pela foto 2 a caminho da 4, o indice virava 2 e a rolagem voltava.
   */
  function ao_rolar() {
    clearTimeout(espera.current);
    espera.current = setTimeout(() => {
      const t = trilho.current;
      if (!t || t.clientWidth === 0) return;
      const indice = Math.round(t.scrollLeft / t.clientWidth);
      if (indice !== atual) ao_mudar(indice);
    }, 120);
  }

  useEffect(() => () => clearTimeout(espera.current), []);

  const varias = fotos.length > 1;
  const ir = (indice: number) =>
    ao_mudar(Math.min(fotos.length - 1, Math.max(0, indice)));

  return (
    <div
      role="region"
      aria-roledescription="carrossel"
      aria-label={`Fotos de ${nome}`}
      className="absolute inset-0"
    >
      <div
        ref={trilho}
        onScroll={ao_rolar}
        // Com teclado: o trilho recebe foco e as setas trocam de foto.
        tabIndex={varias ? 0 : undefined}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") ir(atual + 1);
          if (e.key === "ArrowLeft") ir(atual - 1);
        }}
        className="flex size-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-primaria [&::-webkit-scrollbar]:hidden"
      >
        {fotos.map((url, indice) => (
          <div
            key={url}
            role="group"
            aria-roledescription="foto"
            aria-label={`${indice + 1} de ${fotos.length}`}
            className="relative size-full shrink-0 snap-center"
          >
            <Image
              src={url}
              alt={indice === 0 ? nome : `Foto ${indice + 1} de ${nome}`}
              fill
              sizes="(min-width: 768px) 28rem, 100vw"
              priority={indice === 0}
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {varias && (
        <>
          {/* Setas so a partir de `md`: no celular o gesto e arrastar, e dois
              botoes sobre a foto tampariam justamente o animal. */}
          <button
            type="button"
            onClick={() => ir(atual - 1)}
            disabled={atual === 0}
            aria-label="Foto anterior"
            className="absolute top-1/2 left-3 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-escura/35 text-white backdrop-blur-xs transition hover:bg-escura/50 disabled:invisible md:grid"
          >
            <Seta className="size-3.5 -rotate-90" />
          </button>
          <button
            type="button"
            onClick={() => ir(atual + 1)}
            disabled={atual === fotos.length - 1}
            aria-label="Próxima foto"
            className="absolute top-1/2 right-3 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-escura/35 text-white backdrop-blur-xs transition hover:bg-escura/50 disabled:invisible md:grid"
          >
            <Seta className="size-3.5 rotate-90" />
          </button>

          {/* Os pontos ficam acima dos botoes redondos, que avancam 40 px
              sobre o rodape da foto. Decorativos para leitor de tela: o
              "2 de 4" ja esta em cada foto. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-14 flex justify-center gap-1.5"
          >
            {fotos.map((url, indice) => (
              <span
                key={url}
                className={classes(
                  "h-2 rounded-full shadow-[0_0_2px_rgba(0,0,0,0.4)] transition-all",
                  indice === atual ? "w-5 bg-white" : "w-2 bg-white/60",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
