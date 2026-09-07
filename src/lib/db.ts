import { Pool } from "pg";

/**
 * Pool unico do Postgres.
 *
 * Criado sob demanda, nao em escopo de modulo: o build da Vercel importa este
 * arquivo sem as variaveis de ambiente, e um pool criado na importacao
 * quebraria o build (ver 05-arquitetura).
 *
 * Em desenvolvimento o pool fica pendurado em globalThis para o hot reload do
 * Next nao abrir um pool novo a cada alteracao de arquivo.
 */

const global_com_pool = globalThis as typeof globalThis & { pool_pg?: Pool };

export function obter_pool(): Pool {
  if (global_com_pool.pool_pg) return global_com_pool.pool_pg;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL nao esta definida");
  }

  const local = url.includes("localhost") || url.includes("127.0.0.1");

  const pool = new Pool({
    connectionString: url,
    // O plano gratuito do Supabase tem poucas conexoes e cada funcao
    // serverless abre a sua. Ver RNF-06.
    max: 3,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
    ssl: local ? undefined : { rejectUnauthorized: false },
  });

  global_com_pool.pool_pg = pool;
  return pool;
}

/** Atalho para consulta avulsa. O SQL em si mora em `src/queries/`. */
export async function consultar<T extends Record<string, unknown>>(
  texto: string,
  valores: unknown[] = [],
): Promise<T[]> {
  const resultado = await obter_pool().query<T>(texto, valores);
  return resultado.rows;
}
