import type { NextConfig } from "next";

/**
 * As fotos dos animais vivem no R2 (DT-03), num dominio que muda por
 * ambiente (DT-06). O `next/image` so carrega imagem de host declarado, e
 * declarar `**` deixaria a aplicacao servir de proxy para qualquer imagem da
 * internet.
 *
 * Entao: o dominio `r2.dev`, que e o padrao dos buckets, mais o host do
 * `R2_PUBLIC_URL` quando ele for um dominio proprio. Lido no build, que e
 * quando esta configuracao e avaliada.
 */
function host_do_bucket(): string | null {
  const url = process.env.R2_PUBLIC_URL;
  if (!url) return null;

  try {
    return new URL(url).hostname;
  } catch {
    // Variavel mal preenchida nao pode derrubar o build: sem ela, sobra o
    // r2.dev, e o painel de diagnostico avisa que o R2 esta fora.
    return null;
  }
}

const proprio = host_do_bucket();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.dev" },
      ...(proprio && !proprio.endsWith("r2.dev")
        ? ([{ protocol: "https", hostname: proprio }] as const)
        : []),
    ],
  },
};

export default nextConfig;
