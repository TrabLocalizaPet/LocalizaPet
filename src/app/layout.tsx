import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LocalizaPet",
  description:
    "Cadastro publico de animais perdidos, encontrados e disponiveis para adocao, organizado por localizacao.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
