"use client";

import { useEffect, useMemo, useState } from "react";

import { AtalhosPorTipo } from "@/components/atalhos-por-tipo";
import { CabecalhoDaHome } from "@/components/cabecalho-da-home";
import { CampoDeBusca } from "@/components/campo-de-busca";
import { CartaoDeAnuncio } from "@/components/cartao-de-anuncio";
import { SinoDeNotificacoes } from "@/components/sino-de-notificacoes";
import { Apoio, Aviso, Tela } from "@/components/ui/tela";
import { resumo } from "@/lib/formato";
import type { AnimalNaLista, TipoDeAnuncio } from "@/types/animal";

/**
 * Home: listagem de anuncios (RF-09, RF-10) — tela "Home" do Figma (no 1:3254).
 *
 * A ordem do desenho, de cima para baixo: titulo "Inicio", barra de pesquisa,
 * os atalhos por tipo, a linha "Pets proximos de voce" com o "Ver todos", e os
 * cartoes de 326x230 empilhados. As medidas estao nos componentes; esta tela
 * so compoe (DT-08).
 *
 * Aberta, sem sessao — RF-22 garante que o visitante navegue sem conta.
 *
 * **Duas coisas do desenho ficaram de fora, por motivos diferentes.** O
 * atalho "Ongs" nao tem modelo de dados (ver `atalhos-por-tipo.tsx`), e o
 * bloqueio "Acesse o conteudo completo" — a caixa que o Figma poe sobre a
 * Home de quem nao tem conta — contraria o RF-22, que e requisito `M`. O
 * documento manda sobre o desenho.
 */
export default function Home() {
  const [tipo, definir_tipo] = useState<TipoDeAnuncio | null>(null);
  const [procurado, definir_procurado] = useState("");
  const [animais, definir_animais] = useState<AnimalNaLista[]>([]);
  const [carregando, definir_carregando] = useState(true);
  /** `null` ate a resposta chegar — ver `CabecalhoDaHome`. */
  const [autenticado, definir_autenticado] = useState<boolean | null>(null);

  // A Home e aberta (RF-22); isto so decide o que o cabecalho oferece.
  useEffect(() => {
    fetch("/api/perfil")
      .then((r) => definir_autenticado(r.status !== 401))
      .catch(() => definir_autenticado(false));
  }, []);

  // O tipo vai no `?tipo=` da API porque a consulta ja filtra por ele e usa o
  // indice parcial. O texto nao: a busca de verdade e a F-07, e mandar texto
  // para uma rota que nao o entende daria a impressao de que funciona.
  useEffect(() => {
    definir_carregando(true);

    fetch(`/api/animais${tipo ? `?tipo=${tipo}` : ""}`)
      .then((r) => r.json())
      .then(definir_animais)
      .catch(() => definir_animais([]))
      .finally(() => definir_carregando(false));
  }, [tipo]);

  /**
   * Filtro por texto no que ja esta na tela.
   *
   * E honesto quanto ao que faz: procura no nome e na descricao curta do
   * animal, entre os anuncios ja carregados. A busca por regiao, que e a
   * operacao central do produto, e a F-07 e acontece no banco.
   */
  const visiveis = useMemo(() => {
    const alvo = procurado.trim().toLowerCase();
    if (alvo === "") return animais;

    return animais.filter((animal) =>
      `${animal.nome ?? ""} ${resumo(animal)}`.toLowerCase().includes(alvo),
    );
  }, [animais, procurado]);

  return (
    <Tela>
      {/* Cabecalho do no 1:3273: sair a esquerda, "Inicio" ao centro, sino a
          direita. */}
      <CabecalhoDaHome
        titulo="Inicio"
        autenticado={autenticado}
        acao={<SinoDeNotificacoes autenticado={autenticado} />}
      />

      <div className="mt-6">
        <CampoDeBusca
          placeholder="Procure por pets, tutores ou adocoes"
          value={procurado}
          onChange={(e) => definir_procurado(e.target.value)}
        />
      </div>

      {/* 24 px acima dos atalhos e 16 abaixo, como no no 1:3282. */}
      <div className="mt-6 mb-4">
        <AtalhosPorTipo selecionado={tipo} ao_escolher={definir_tipo} />
      </div>

      {/* O titulo e o do desenho. Hoje a lista e "mais recentes primeiro", e
          so a F-07 (busca por raio) o torna literal — e ela ja esta prevista
          como a proxima feature, entao o titulo nasce certo em vez de mudar
          de novo. */}
      <div className="flex items-center justify-between pb-3">
        <h1 className="text-base font-bold">Pets proximos de voce</h1>

        {/* O "Ver todos" do desenho e o que desfaz o filtro. Some quando nao
            ha filtro nenhum: nao teria o que fazer. */}
        {(tipo !== null || procurado !== "") && (
          <button
            type="button"
            onClick={() => {
              definir_tipo(null);
              definir_procurado("");
            }}
            className="px-3 font-titulo text-sm text-primaria"
          >
            Ver todos
          </button>
        )}
      </div>

      {carregando && <Apoio>Carregando...</Apoio>}

      {!carregando && visiveis.length === 0 && (
        <Aviso>
          {procurado !== ""
            ? "Nenhum anuncio com esse texto entre os que estao na tela."
            : "Nenhum anuncio deste tipo por enquanto."}
        </Aviso>
      )}

      {/* Uma coluna no celular, que e o layout do Figma; o desktop aproveita a
          largura, que o desenho nao cobre (DT-08). */}
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visiveis.map((animal) => (
          <li key={animal.id}>
            <CartaoDeAnuncio animal={animal} />
          </li>
        ))}
      </ul>
    </Tela>
  );
}
