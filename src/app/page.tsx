import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { MarcaComNome } from "@/components/marca";
import { BotaoLink } from "@/components/ui/botao";
import { usuario_atual } from "@/lib/auth";

/**
 * Boas-vindas — a tela "Login" do Figma (no 1:600).
 *
 * As medidas sao as do desenho, sobre o quadro de 390x844, convertidas para
 * porcentagem da altura para acompanharem telas de outro tamanho:
 *
 *   foto      586x752 a partir de (-196, -235) — sangra em cima e nos lados
 *   degrade   390x172 em y=346
 *   marca     186x88  em y=452
 *   titulo    320x56  em y=556
 *   Login     326x40  em y=644
 *   Cadastro  326x40  em y=700
 *   link      137x32  em y=756
 *
 * Os botoes tem **40 px de altura no desenho**, e nao os 44 do resto do
 * aplicativo. Seguimos o desenho aqui; a diferenca esta anotada no
 * docs/07-interface.md.
 *
 * A tela existe para **dar a escolha antes de exigir qualquer coisa**:
 * entrar, criar conta, ou seguir sem cadastro. O "Entrar sem cadastro" e a
 * porta visivel do RF-22, que e obrigatorio — sem ela, ninguem descobre que
 * da para navegar sem conta.
 */
export default async function BoasVindas() {
  if (await usuario_atual()) redirect("/animais");

  return (
    <main className="relative mx-auto flex h-dvh max-w-md flex-col overflow-hidden">
      {/* A foto vai de y=0 a y=517 dos 844 do desenho — 61% da altura. O
          `object-top` reproduz o enquadramento: no Figma ela comeca acima do
          quadro, entao o que se ve e o topo. */}
      <div className="relative h-[61%] shrink-0">
        <Image
          src="/marca/boas-vindas.jpg"
          alt=""
          fill
          priority
          sizes="28rem"
          className="object-cover object-top"
        />
        {/* O `Rectangle 208` do desenho: o degrade que funde a foto no branco,
            de y=346 a y=518. */}
        <div className="absolute inset-x-0 bottom-0 h-[34%] bg-linear-to-b from-transparent to-white" />
      </div>

      <div className="flex flex-1 flex-col items-center px-8">
        {/* 186 de 390 = 48% da largura, em y=452 (logo abaixo da foto). */}
        <MarcaComNome largura={186} className="-mt-8 w-[48%]" />

        <h1 className="mt-3 text-center font-titulo text-2xl leading-tight font-semibold text-secundaria">
          Conecte coracoes.
          <br />
          Reencontre historias.
        </h1>

        {/* 326 de 390 = 84%; os botoes ficam colados no rodape do desenho. */}
        <div className="mt-auto grid w-full gap-3.5 pb-6">
          <BotaoLink href="/entrar" largo>
            Login
          </BotaoLink>
          <BotaoLink
            href="/cadastro"
            aparencia="secundaria"
            largo
          >
            Cadastro
          </BotaoLink>
          <Link
            href="/animais"
            className="py-1 text-center text-sm font-semibold text-primaria"
          >
            Entrar sem cadastro
          </Link>
        </div>
      </div>
    </main>
  );
}
