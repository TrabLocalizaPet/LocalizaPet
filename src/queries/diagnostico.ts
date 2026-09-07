import { consultar } from "@/lib/db";

/**
 * Consultas do painel de diagnostico (RF-31).
 *
 * Todo SQL do projeto mora em `src/queries/`. Route handler e pagina nao
 * escrevem query — e o que substitui a tipagem que um ORM daria.
 */

/** Tabelas que o `001_init.sql` precisa ter criado. */
export const TABELAS_ESPERADAS = [
  "perfis",
  "animais",
  "caracteristicas",
  "animal_caracteristicas",
  "fotos",
  "avistamentos",
  "areas_monitoradas",
  "notificacoes",
] as const;

export type VersaoDoBanco = {
  versao: string;
  agora: Date;
};

export async function versao_do_banco(): Promise<VersaoDoBanco> {
  const linhas = await consultar<{ versao: string; agora: Date }>(
    "SELECT version() AS versao, now() AS agora",
  );
  return linhas[0];
}

export type EstadoDoSchema = {
  postgis: string | null;
  tabelas_presentes: string[];
  tabelas_faltando: string[];
};

export async function estado_do_schema(): Promise<EstadoDoSchema> {
  const extensoes = await consultar<{ versao: string }>(
    "SELECT extversion AS versao FROM pg_extension WHERE extname = 'postgis'",
  );

  const tabelas = await consultar<{ nome: string }>(
    `SELECT table_name AS nome
       FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = ANY($1)`,
    [TABELAS_ESPERADAS],
  );

  const presentes = tabelas.map((linha) => linha.nome);

  return {
    postgis: extensoes[0]?.versao ?? null,
    tabelas_presentes: presentes,
    tabelas_faltando: TABELAS_ESPERADAS.filter(
      (nome) => !presentes.includes(nome),
    ),
  };
}
