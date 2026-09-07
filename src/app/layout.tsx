import type { Metadata } from "next";
import { Inter, Mitr } from "next/font/google";
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${mitr.variable}`}>
      <body>{children}</body>
    </html>
  );
}
