import { NextResponse } from "next/server";
import { z } from "zod";

import { usuario_atual } from "@/lib/auth";
import {
  atualizar_perfil,
  buscar_perfil,
  garantir_perfil,
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

const telefone = z
  .string()
  .trim()
  .max(20, "telefone longo demais")
  .nullish()
  .transform((valor) => (valor ? valor : null));

const CriacaoDePerfil = z.object({
  nome: z.string().trim().min(2, "nome muito curto").max(120),
  telefone,
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
  });

  return NextResponse.json(perfil, { status: 201 });
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
