"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { CartaoDeAnuncio } from "@/components/cartao-de-anuncio";
import { Apoio, Aviso, Tela, Titulo } from "@/components/ui/tela";
import { classes } from "@/components/ui/classes";
import type { AnimalNaLista, TipoDeAnuncio } from "@/types/animal";

/**
 * Home: listagem de anuncios (RF-09, RF-10).
 *
 * Aberta — RF-22 garante que visitante navegue sem sessao.
 *
 * O Figma tem aqui uma barra de busca e quatro atalhos redondos por tipo. A
 * busca e a F-07; as abas abaixo fazem o papel dos atalhos por enquanto.
 */

const ABAS: { valor: TipoDeAnuncio | null; rotulo: string }[] = [
  { valor: null, rotulo: "Todos" },
  { valor: "perdido", rotulo: "Perdidos" },
  { valor: "encontrado", rotulo: "Encontrados" },
  { valor: "adocao", rotulo: "Adocao" },
];

export default function Home() {
  const [tipo, definir_tipo] = useState<TipoDeAnuncio | null>(null);
  const [animais, definir_animais] = useState<AnimalNaLista[]>([]);
  const [carregando, definir_carregando] = useState(true);

  useEffect(() => {
    definir_carregando(true);

    fetch(`/api/animais${tipo ? `?tipo=${tipo}` : ""}`)
      .then((r) => r.json())
      .then(definir_animais)
      .catch(() => definir_animais([]))
      .finally(() => definir_carregando(false));
  }, [tipo]);

  return (
    <Tela>
      <Titulo>Pets proximos de voce</Titulo>
      <Apoio>
        Anuncios ativos, mais recentes primeiro.{" "}
        <Link href="/mapa" className="text-primaria font-semibold">
          Ver no mapa
        </Link>
      </Apoio>

      {/* Rolagem horizontal no celular: quatro abas nao cabem em 390 px sem
          apertar o alvo de toque. */}
      <div className="-mx-5 mt-4 mb-4 flex gap-2 overflow-x-auto px-5 pb-1">
        {ABAS.map((aba) => (
          <button
            key={aba.rotulo}
            type="button"
            onClick={() => definir_tipo(aba.valor)}
            className={classes(
              "min-h-9 shrink-0 rounded-full border px-4 text-sm transition",
              aba.valor === tipo
                ? "border-primaria bg-primaria text-white font-semibold"
                : "border-borda bg-cartao text-texto hover:border-primaria",
            )}
          >
            {aba.rotulo}
          </button>
        ))}
      </div>

      {carregando && <Apoio>Carregando...</Apoio>}

      {!carregando && animais.length === 0 && (
        <Aviso>
          Nenhum anuncio deste tipo por enquanto.{" "}
          <Link href="/publicar" className="text-primaria font-semibold">
            Publicar o primeiro
          </Link>
        </Aviso>
      )}

      {/* Uma coluna no celular, como no Figma; o desktop aproveita a largura. */}
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {animais.map((animal) => (
          <li key={animal.id}>
            <CartaoDeAnuncio animal={animal} />
          </li>
        ))}
      </ul>
    </Tela>
  );
}
