import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { MarcaComNome } from "@/components/marca";
import { BotaoLink } from "@/components/ui/botao";
import { usuario_atual } from "@/lib/auth";

/**
 * Boas-vindas — a tela "Login" do Figma (no 1:600).
 *
 * E a porta do produto, e existe para **dar a escolha antes de exigir
 * qualquer coisa**: entrar, criar conta, ou seguir sem cadastro.
 *
 * O "Entrar sem cadastro" nao e cortesia: e a porta visivel do RF-22, que e
 * obrigatorio. Antes desta tela o requisito estava cumprido na API e
 * invisivel na interface — ninguem descobria que dava para navegar sem
 * conta.
 *
 * Quem ja tem sessao nao precisa escolher nada, e vai direto para a
 * listagem.
 */
export default async function BoasVindas() {
  if (await usuario_atual()) redirect("/animais");

  return (
    <main className="flex min-h-dvh flex-col">
      {/* Foto sangrada com o degrade para o branco, como no desenho. */}
      <div className="relative flex-1">
        <Image
          src="/marca/boas-vindas.jpg"
          alt=""
          fill
          priority
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-white/20 to-white" />
      </div>

      <div className="-mt-16 flex flex-col items-center gap-5 px-6 pb-10">
        <MarcaComNome largura={168} />

        {/* O rosa e o `theme/secondary` do Figma, usado aqui e no botao de
            curtir — os dois momentos afetivos do produto. */}
        <h1 className="text-center font-titulo text-2xl leading-tight font-semibold text-secundaria">
          Conecte coracoes.
          <br />
          Reencontre historias.
        </h1>

        <div className="grid w-full max-w-sm gap-3">
          <BotaoLink href="/entrar" largo>
            Login
          </BotaoLink>
          <BotaoLink href="/cadastro" aparencia="secundaria" largo>
            Cadastro
          </BotaoLink>
          <Link
            href="/animais"
            className="py-2 text-center text-sm font-semibold text-primaria"
          >
            Entrar sem cadastro
          </Link>
        </div>
      </div>
    </main>
  );
}
