"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ROTULO_DO_TIPO, ha_quanto_tempo, resumo } from "@/lib/formato";
import type { AnimalNaLista, TipoDeAnuncio } from "@/types/animal";

/**
 * Listagem de anuncios (RF-09, RF-10).
 *
 * Aberta: RF-22 garante que visitante navegue sem sessao.
 */

const ABAS: { valor: TipoDeAnuncio | null; rotulo: string }[] = [
  { valor: null, rotulo: "Todos" },
  { valor: "perdido", rotulo: "Perdidos" },
  { valor: "encontrado", rotulo: "Encontrados" },
  { valor: "adocao", rotulo: "Adocao" },
];

export default function Listagem() {
  const [tipo, definir_tipo] = useState<TipoDeAnuncio | null>(null);
  const [animais, definir_animais] = useState<AnimalNaLista[]>([]);
  const [carregando, definir_carregando] = useState(true);

  useEffect(() => {
    definir_carregando(true);
    const consulta = tipo ? `?tipo=${tipo}` : "";

    fetch(`/api/animais${consulta}`)
      .then((r) => r.json())
      .then(definir_animais)
      .catch(() => definir_animais([]))
      .finally(() => definir_carregando(false));
  }, [tipo]);

  return (
    <main className="tela-do-mapa">
      <header className="cabecalho-do-mapa">
        <h1>Pets proximos de voce</h1>
        <p className="apoio">
          Anuncios ativos, mais recentes primeiro.{" "}
          <Link href="/mapa">Ver no mapa</Link>
        </p>
      </header>

      <nav className="abas">
        {ABAS.map((aba) => (
          <button
            key={aba.rotulo}
            type="button"
            className={aba.valor === tipo ? "ativa" : ""}
            onClick={() => definir_tipo(aba.valor)}
          >
            {aba.rotulo}
          </button>
        ))}
      </nav>

      {carregando && <p className="apoio">Carregando...</p>}

      {!carregando && animais.length === 0 && (
        <p className="aviso">
          Nenhum anuncio deste tipo por enquanto.{" "}
          <Link href="/publicar">Publicar o primeiro</Link>
        </p>
      )}

      <ul className="cartoes">
        {animais.map((animal) => (
          <li key={animal.id}>
            <Link href={`/animais/${animal.id}`} className="cartao">
              <span className={`etiqueta ${animal.tipo_anuncio}`}>
                {ROTULO_DO_TIPO[animal.tipo_anuncio]}
              </span>
              {/* RN-04: quem acha um animal na rua nao sabe o nome. */}
              <strong>{animal.nome ?? "Sem nome"}</strong>
              <span className="resumo-do-cartao">{resumo(animal)}</span>
              <span className="quando">
                {animal.endereco_texto ? `${animal.endereco_texto} · ` : ""}
                {ha_quanto_tempo(animal.criado_em)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
