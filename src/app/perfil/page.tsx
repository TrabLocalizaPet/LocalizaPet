"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Botao } from "@/components/ui/botao";
import { Campo, Interruptor } from "@/components/ui/campo";
import { IconeAjustes, Seta } from "@/components/ui/icones";
import { Apoio, Aviso, Tela, Titulo } from "@/components/ui/tela";
import { cliente_navegador } from "@/lib/auth-navegador";
import { mascara_telefone, telefone_completo } from "@/lib/mascaras";
import type { AnimalNaLista, Situacao } from "@/types/animal";
import type { Perfil } from "@/types/perfil";

type MeuAnuncio = AnimalNaLista & { situacao: Situacao };
type Estado = "carregando" | "sem_perfil" | "pronto";

/**
 * Perfil (RF-19, RF-20) — tela "Perfil" do Figma (no 1:3350).
 *
 * O desenho e uma **tela de visita**, nao um formulario: foto redonda de 96,
 * nome em 24 no marrom da marca, a contagem de pets em rosa e a lista dos
 * anuncios da pessoa, cada um com a foto em circulo de 48 e a seta a direita.
 * A engrenagem no canto superior esquerdo e que leva aos ajustes.
 *
 * Era so o formulario de edicao antes. Ele continua existindo, atras da
 * engrenagem — e ali que moram nome, telefone, RF-20 e o sair.
 *
 * **Nao ha foto de perfil no modelo de dados.** `perfis` nao tem coluna de
 * imagem (`docs/04-modelo-dados.md`), entao o circulo mostra a inicial sobre
 * o creme da marca. Inventar a coluna aqui seria decidir sozinho o que o
 * grupo nao decidiu.
 *
 * O sino de notificacoes do desenho fica de fora: a caixa de notificacoes e a
 * F-14, do incremento 3.
 *
 * Tres situacoes, e a terceira e a que costuma ser esquecida:
 *
 * - sem sessao (401) -> vai para /entrar
 * - com sessao e sem perfil (404) -> o cadastro parou entre os dois passos, e
 *   esta tela termina o servico
 * - com perfil -> a tela de visita
 */
export default function MinhaConta() {
  const router = useRouter();
  const [estado, definir_estado] = useState<Estado>("carregando");
  const [ajustes, definir_ajustes] = useState(false);

  const [nome, definir_nome] = useState("");
  const [telefone, definir_telefone] = useState("");
  const [telefone_publico, definir_telefone_publico] = useState(false);
  const [email, definir_email] = useState("");
  const [meus, definir_meus] = useState<MeuAnuncio[]>([]);

  const [aviso, definir_aviso] = useState<string | null>(null);
  const [erro, definir_erro] = useState<string | null>(null);
  const [salvando, definir_salvando] = useState(false);

  useEffect(() => {
    async function carregar() {
      const resposta = await fetch("/api/perfil");

      if (resposta.status === 401) return router.replace("/entrar");
      if (resposta.status === 404) {
        // Sem perfil nao ha o que visitar: a tela abre direto nos ajustes,
        // que e onde o cadastro se completa.
        definir_ajustes(true);
        return definir_estado("sem_perfil");
      }

      const perfil: Perfil = await resposta.json();
      definir_nome(perfil.nome);
      definir_telefone(perfil.telefone ?? "");
      definir_telefone_publico(perfil.telefone_publico);
      definir_email(perfil.email);
      definir_estado("pronto");

      const anuncios = await fetch("/api/perfil/animais");
      if (anuncios.ok) definir_meus(await anuncios.json());
    }

    carregar();
  }, [router]);

  /** Em branco e valido (nao informou); pela metade, nao. */
  const telefone_pronto = telefone === "" || telefone_completo(telefone);

  async function salvar(evento: React.FormEvent) {
    evento.preventDefault();
    definir_erro(null);
    definir_aviso(null);
    definir_salvando(true);

    const criando = estado === "sem_perfil";
    const resposta = await fetch("/api/perfil", {
      method: criando ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        criando
          ? { nome, telefone: telefone || null }
          : { nome, telefone: telefone || null, telefone_publico },
      ),
    });

    if (!resposta.ok) {
      definir_erro("Nao foi possivel salvar. Tente de novo.");
      definir_salvando(false);
      return;
    }

    const perfil: Perfil = await resposta.json();
    definir_nome(perfil.nome);
    definir_telefone(perfil.telefone ?? "");
    definir_telefone_publico(perfil.telefone_publico);
    definir_email(perfil.email);
    definir_estado("pronto");
    definir_aviso("Alteracoes salvas.");
    definir_salvando(false);
  }

  async function sair() {
    await cliente_navegador().auth.signOut();
    router.refresh();
    router.push("/entrar");
  }

  if (estado === "carregando") {
    return (
      <Tela largura="estreita">
        <Apoio>Carregando...</Apoio>
      </Tela>
    );
  }

  // ---------------------------------------------------------------- ajustes
  if (ajustes) {
    return (
      <Tela largura="estreita">
        <Titulo>
          {estado === "sem_perfil" ? "Complete seu cadastro" : "Ajustes da conta"}
        </Titulo>
        <Apoio>
          {estado === "sem_perfil"
            ? "Sua conta ja existe. Faltam so estes dados."
            : email}
        </Apoio>

        {erro && <Aviso>{erro}</Aviso>}
        {aviso && <Aviso tom="bom">{aviso}</Aviso>}

        <form onSubmit={salvar} className="mt-4 grid gap-3">
          <Campo
            rotulo="Nome"
            type="text"
            value={nome}
            onChange={(e) => definir_nome(e.target.value)}
            minLength={2}
            required
          />
          {/* A rota recusa telefone fora do formato (422). O campo mascara o
              que se digita, e o apoio explica o que falta enquanto o numero
              esta incompleto — melhor que mandar e receber o erro. */}
          <Campo
            rotulo="Telefone"
            type="tel"
            inputMode="tel"
            value={telefone}
            onChange={(e) => definir_telefone(mascara_telefone(e.target.value))}
            maxLength={15}
            placeholder="(21) 99999-9999"
            apoio={
              telefone !== "" && !telefone_completo(telefone)
                ? "Faltam digitos: DDD e o numero, com 8 ou 9 digitos."
                : undefined
            }
          />

          {estado === "pronto" && (
            <Interruptor
              rotulo="Mostrar meu telefone nos anuncios"
              apoio="Desligado, ninguem ve seu telefone — nem na tela, nem na resposta da API. Nasce desligado (RN-24)."
              checked={telefone_publico}
              onChange={(e) => definir_telefone_publico(e.target.checked)}
            />
          )}

          <Botao type="submit" largo disabled={salvando || !telefone_pronto}>
            {salvando ? "Salvando..." : "Salvar"}
          </Botao>
        </form>

        {estado === "pronto" && (
          <div className="mt-3 grid gap-3">
            <Botao
              aparencia="secundaria"
              largo
              type="button"
              onClick={() => definir_ajustes(false)}
            >
              Voltar ao perfil
            </Botao>
            <Botao aparencia="fantasma" largo type="button" onClick={sair}>
              Sair
            </Botao>
          </div>
        )}
      </Tela>
    );
  }

  // ----------------------------------------------------------------- perfil
  return (
    <Tela largura="estreita">
      {/* Cabecalho do desenho: engrenagem a esquerda, "Perfil" ao centro. O
          sino da direita e a F-14, e nao existe ainda. */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => definir_ajustes(true)}
          aria-label="Ajustes da conta"
          className="-ml-2 grid size-11 place-items-center text-primaria"
        >
          <IconeAjustes className="size-6" />
        </button>
        <p className="text-xs">Perfil</p>
        <span className="size-11" aria-hidden="true" />
      </div>

      <div className="mt-6 flex flex-col items-center">
        {/* 96 px no desenho. Sem coluna de foto no modelo, fica a inicial. */}
        <span
          aria-hidden="true"
          className="grid size-24 place-items-center rounded-full bg-creme font-titulo text-4xl text-primaria"
        >
          {nome.charAt(0).toUpperCase()}
        </span>

        <h1 className="mt-3 text-2xl font-bold text-terciaria">{nome}</h1>
        <p className="mt-1 text-sm text-secundaria">
          <strong className="font-bold">{meus.length}</strong>{" "}
          {meus.length === 1 ? "pet" : "pets"}
        </p>
      </div>

      <ul className="mt-8 grid gap-3">
        {meus.map((animal) => (
          <li key={animal.id}>
            <Link
              href={`/animais/${animal.id}`}
              className="flex items-center gap-3 rounded-[--radius-padrao] py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
            >
              <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-creme">
                {animal.foto_url ? (
                  <Image
                    src={animal.foto_url}
                    alt=""
                    fill
                    sizes="3rem"
                    className="object-cover"
                  />
                ) : (
                  <span aria-hidden="true" className="font-titulo text-primaria">
                    {(animal.nome ?? "?").charAt(0).toUpperCase()}
                  </span>
                )}
              </span>

              <span className="flex-1 text-base font-medium text-terciaria">
                {animal.nome ?? "Sem nome"}
              </span>

              {/* O encerrado continua na lista do autor (RN-09 vale para quem
                  procura), mas precisa aparecer como encerrado. A etiqueta
                  propria vem com a F-11, que e outra branch; aqui basta a
                  palavra. */}
              {animal.situacao !== "ativo" && (
                <span className="text-xs text-suave">
                  {animal.situacao === "resolvido" ? "Resolvido" : "Arquivado"}
                </span>
              )}

              <Seta className="size-3 rotate-90 text-escura" />
            </Link>
          </li>
        ))}
      </ul>

      {meus.length === 0 && (
        <Apoio className="text-center">
          Voce ainda nao publicou nenhum anuncio.{" "}
          <Link href="/publicar" className="font-semibold text-primaria">
            Publicar o primeiro
          </Link>
        </Apoio>
      )}
    </Tela>
  );
}
