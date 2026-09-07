"use client";

import { useRef, useState } from "react";

import { Botao } from "./ui/botao";
import { classes } from "./ui/classes";

/**
 * Envio de fotos do anuncio (RF-05, RNF-10).
 *
 * O arquivo **nao passa pelo servidor**: a rota `/api/uploads` devolve uma
 * URL assinada e o navegador faz o `PUT` direto no R2. Alem de economizar,
 * evita o limite de tamanho do corpo de requisicao da funcao serverless, que
 * uma foto de celular estoura.
 *
 * O componente entrega ao formulario apenas as **chaves** dos objetos ja
 * enviados. A linha em `fotos` so nasce quando o anuncio e criado, na mesma
 * transacao (RN-34) — enviar arquivo nao cria anuncio.
 *
 * Consequencia aceita: abandonar o formulario depois de enviar deixa objetos
 * orfaos no bucket. Limpar isso exigiria uma varredura periodica, que e
 * trabalho para depois do MVP.
 */

const MAXIMO = 6; // RN-06
const TIPOS = ["image/jpeg", "image/png", "image/webp"];
const TAMANHO_MAXIMO = 8 * 1024 * 1024;

type Foto = { chave: string; previa: string };

export function SeletorDeFotos({
  fotos,
  ao_mudar,
}: {
  fotos: Foto[];
  ao_mudar: (fotos: Foto[]) => void;
}) {
  const entrada = useRef<HTMLInputElement>(null);
  const [enviando, definir_enviando] = useState(false);
  const [erro, definir_erro] = useState<string | null>(null);

  async function enviar_uma(arquivo: File): Promise<Foto> {
    const pedido = await fetch("/api/uploads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: arquivo.type }),
    });

    if (!pedido.ok) throw new Error("nao foi possivel preparar o envio");
    const { url, chave } = await pedido.json();

    // O PUT vai direto ao R2. Se falhar aqui e quase sempre CORS do bucket —
    // o risco registrado no 05-arquitetura, que so aparece contra o servico
    // de verdade.
    const envio = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": arquivo.type },
      body: arquivo,
    });

    if (!envio.ok) throw new Error("o bucket recusou o envio");

    return { chave, previa: URL.createObjectURL(arquivo) };
  }

  async function escolher(lista: FileList | null) {
    if (!lista?.length) return;
    definir_erro(null);

    const escolhidas = Array.from(lista);
    const cabe = MAXIMO - fotos.length;

    if (escolhidas.length > cabe) {
      definir_erro(`Cabe no maximo ${MAXIMO} fotos.`);
      return;
    }
    if (escolhidas.some((a) => !TIPOS.includes(a.type))) {
      definir_erro("Use JPEG, PNG ou WebP.");
      return;
    }
    if (escolhidas.some((a) => a.size > TAMANHO_MAXIMO)) {
      definir_erro("Cada foto precisa ter menos de 8 MB.");
      return;
    }

    definir_enviando(true);
    try {
      const novas = await Promise.all(escolhidas.map(enviar_uma));
      ao_mudar([...fotos, ...novas]);
    } catch (falha) {
      definir_erro(
        falha instanceof Error ? falha.message : "falha ao enviar a foto",
      );
    } finally {
      definir_enviando(false);
      if (entrada.current) entrada.current.value = "";
    }
  }

  function remover(chave: string) {
    ao_mudar(fotos.filter((f) => f.chave !== chave));
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-semibold">
        Fotos <span className="font-normal text-suave">(ate {MAXIMO})</span>
      </span>

      <div className="grid grid-cols-3 gap-2">
        {fotos.map((foto, indice) => (
          <div
            key={foto.chave}
            className="relative aspect-square overflow-hidden rounded-[--radius-padrao] border border-borda"
          >
            {/* `img` e nao `next/image`: a previa e um blob local, que o
                otimizador nao tem como buscar. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={foto.previa}
              alt={`Foto ${indice + 1}`}
              className="size-full object-cover"
            />
            {indice === 0 && (
              <span className="absolute bottom-0 w-full bg-black/55 py-0.5 text-center text-[10px] font-semibold text-white">
                capa
              </span>
            )}
            <button
              type="button"
              onClick={() => remover(foto.chave)}
              aria-label={`Remover foto ${indice + 1}`}
              className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-black/60 text-sm text-white"
            >
              ×
            </button>
          </div>
        ))}

        {fotos.length < MAXIMO && (
          <button
            type="button"
            onClick={() => entrada.current?.click()}
            disabled={enviando}
            className={classes(
              "grid aspect-square place-items-center rounded-[--radius-padrao]",
              "border border-dashed border-borda text-sm text-suave",
              "hover:border-primaria hover:text-primaria disabled:opacity-55",
            )}
          >
            {enviando ? "Enviando..." : "+ Foto"}
          </button>
        )}
      </div>

      <input
        ref={entrada}
        type="file"
        accept={TIPOS.join(",")}
        multiple
        hidden
        onChange={(e) => escolher(e.target.files)}
      />

      {erro && <p className="mt-2 text-sm text-perdido">{erro}</p>}

      {fotos.length > 1 && (
        <p className="mt-2 text-xs text-suave">
          A primeira foto e a capa, e e ela que aparece na listagem e no mapa.
        </p>
      )}

      {/* O botao acima ja abre o seletor; este e o caminho de teclado. */}
      <Botao
        aparencia="fantasma"
        type="button"
        onClick={() => entrada.current?.click()}
        className="sr-only focus:not-sr-only"
      >
        Escolher fotos
      </Botao>
    </div>
  );
}
