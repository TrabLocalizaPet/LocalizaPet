import type { Metadata, Viewport } from "next";
import { Inter, Mitr } from "next/font/google";

import Navegacao from "@/components/navegacao";
import "./globals.css";

// As duas fontes do arquivo do Figma: Inter no corpo, Mitr nos titulos.
// Servidas pelo next/font, que as hospeda junto com a aplicacao — sem
// requisicao a um dominio de terceiro em cada visita.
const inter = Inter({ subsets: ["latin"], variable: "--fonte-corpo" });
const mitr = Mitr({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--fonte-titulo",
});

export const metadata: Metadata = {
  title: "LocalizaPet",
  description:
    "Cadastro publico de animais perdidos, encontrados e disponiveis para adocao, organizado por localizacao.",
};

/**
 * `viewportFit: "cover"` e o par do `pb-[env(safe-area-inset-bottom)]` da
 * navegacao: sem ele a barra de abas fica sob a faixa de gestos do iPhone e
 * o ultimo botao nao recebe toque.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f68b1e",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${mitr.variable}`}>
      {/* O espaco no rodape e da barra fixa do celular; no desktop ela vira
          cabecalho e o espaco deixa de ser preciso. */}
      <body className="pb-24 md:pb-0">
        <Navegacao />
        {children}
      </body>
    </html>
  );
}
