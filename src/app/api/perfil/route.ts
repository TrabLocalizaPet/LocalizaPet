import { NextResponse } from "next/server";
import { z } from "zod";

import { usuario_atual } from "@/lib/auth";
import { FORMATO_TELEFONE } from "@/lib/mascaras";
import {
  atualizar_perfil,
  buscar_perfil,
  garantir_perfil,
  registrar_intencao,
} from "@/queries/perfis";

/**
 * Perfil do usuario autenticado (RF-19, RF-20).
 *
 * As tres rotas exigem sessao. Rota que exige sessao confere sessao no
 * proprio handler — o middleware so renova o cookie, nao barra ninguem
 * (RF-22).
 *
 * **A identidade vem sempre da sessao, nunca do corpo.** Aceitar um `id` ou
 * um `email` enviado pelo cliente deixaria qualquer pessoa criar ou editar o
 * perfil de outra.
 */

/**
 * O telefone chega formatado, no mesmo formato que a mascara da tela produz
 * (`src/lib/mascaras.ts`).
 *
 * A coluna e TEXT e aceitaria qualquer coisa; quem decide a convencao e esta
 * rota. Guardar formatado — e nao digito cru — e o que o `scripts/seed.ts`
 * faz desde a F-02, e o detalhe do anuncio (RF-21) exibe a coluna como ela
 * esta. Duas convencoes na mesma coluna obrigariam toda tela a adivinhar
 * qual delas veio.
 *
 * Vazio vira `null`, nao string vazia: quem apagou o campo nao informou
 * telefone, e RN-24 trata ausencia, nao `""`.
 */
const telefone = z
  .string()
  .trim()
  .nullish()
  .transform((valor) => (valor ? valor : null))
  .refine((valor) => valor === null || FORMATO_TELEFONE.test(valor), {
    message: "telefone deve estar no formato (DD) 00000-0000",
  });

const CriacaoDePerfil = z.object({
  nome: z.string().trim().min(2, "nome muito curto").max(120),
  telefone,
  // A faixa repete o CHECK da 002_ para devolver 422 com mensagem util em vez
  // de deixar o banco recusar com erro cru.
  data_nascimento: z
    .iso
    .date()
    .refine((d) => d > "1900-01-01" && d <= new Date().toISOString().slice(0, 10), {
      message: "data de nascimento fora da faixa aceita",
    })
    .nullish()
    .transform((v) => v ?? null),
});

const RegistroDeIntencao = z.object({
  intencao: z.enum(["perdi_pet", "achei_pet", "quero_adotar", "quero_doar"]),
});

const EdicaoDePerfil = z.object({
  nome: z.string().trim().min(2, "nome muito curto").max(120),
  telefone,
  telefone_publico: z.boolean(),
});

function sem_sessao() {
  return NextResponse.json({ erro: "e preciso estar autenticado" }, { status: 401 });
}

function entrada_invalida(erro: z.ZodError) {
  return NextResponse.json(
    { erro: "dados invalidos", detalhes: z.treeifyError(erro) },
    { status: 422 },
  );
}

export async function GET() {
  const usuario = await usuario_atual();
  if (!usuario) return sem_sessao();

  const perfil = await buscar_perfil(usuario.id);
  if (!perfil) {
    // Tem conta no provedor e nao tem perfil: o cadastro parou no meio.
    // A tela de cadastro refaz o POST e o servico termina.
    return NextResponse.json({ erro: "perfil ainda nao criado" }, { status: 404 });
  }

  return NextResponse.json(perfil);
}

export async function POST(requisicao: Request) {
  const usuario = await usuario_atual();
  if (!usuario) return sem_sessao();

  const corpo = CriacaoDePerfil.safeParse(await requisicao.json());
  if (!corpo.success) return entrada_invalida(corpo.error);

  // O e-mail sai da sessao, nao do corpo: e o provedor quem garante que ele
  // foi verificado e que e unico.
  const perfil = await garantir_perfil({
    id: usuario.id,
    nome: corpo.data.nome,
    email: usuario.email ?? "",
    telefone: corpo.data.telefone,
    data_nascimento: corpo.data.data_nascimento,
  });

  return NextResponse.json(perfil, { status: 201 });
}

/**
 * Ultimo passo do cadastro: "O que te trouxe aqui?" (tela do Figma).
 *
 * Rota propria, e nao um campo do PATCH, porque e outro momento — obrigar a
 * tela de onboarding a reenviar nome e telefone so para nao apaga-los seria
 * convidar ao engano.
 */
export async function PUT(requisicao: Request) {
  const usuario = await usuario_atual();
  if (!usuario) return sem_sessao();

  const corpo = RegistroDeIntencao.safeParse(await requisicao.json());
  if (!corpo.success) return entrada_invalida(corpo.error);

  const perfil = await registrar_intencao(usuario.id, corpo.data.intencao);
  if (!perfil) {
    return NextResponse.json({ erro: "perfil ainda nao criado" }, { status: 404 });
  }

  return NextResponse.json(perfil);
}

export async function PATCH(requisicao: Request) {
  const usuario = await usuario_atual();
  if (!usuario) return sem_sessao();

  const corpo = EdicaoDePerfil.safeParse(await requisicao.json());
  if (!corpo.success) return entrada_invalida(corpo.error);

  // O WHERE da consulta usa o id da sessao, entao nao ha como editar o perfil
  // de outra pessoa mesmo que alguem tente.
  const perfil = await atualizar_perfil(usuario.id, corpo.data);
  if (!perfil) {
    return NextResponse.json({ erro: "perfil ainda nao criado" }, { status: 404 });
  }

  return NextResponse.json(perfil);
}
