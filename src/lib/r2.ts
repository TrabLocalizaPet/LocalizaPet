import { S3Client, HeadBucketCommand } from "@aws-sdk/client-s3";

/**
 * Cliente do Cloudflare R2.
 *
 * O R2 fala o protocolo S3, entao usamos o SDK da AWS apontando para o
 * endpoint da Cloudflare, com `region: "auto"` (DT-03).
 *
 * Criado sob demanda, pelo mesmo motivo do pool do Postgres.
 */

const global_com_r2 = globalThis as typeof globalThis & { cliente_r2?: S3Client };

function exigir(nome: string): string {
  const valor = process.env[nome];
  if (!valor) throw new Error(`${nome} nao esta definida`);
  return valor;
}

export function obter_cliente_r2(): S3Client {
  if (global_com_r2.cliente_r2) return global_com_r2.cliente_r2;

  const cliente = new S3Client({
    region: "auto",
    endpoint: `https://${exigir("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: exigir("R2_ACCESS_KEY_ID"),
      secretAccessKey: exigir("R2_SECRET_ACCESS_KEY"),
    },
  });

  global_com_r2.cliente_r2 = cliente;
  return cliente;
}

export function nome_do_bucket(): string {
  return exigir("R2_BUCKET");
}

/** Monta a URL publica de um objeto a partir da chave guardada no banco. */
export function url_publica(chave: string): string {
  return `${exigir("R2_PUBLIC_URL").replace(/\/$/, "")}/${chave}`;
}

/** Usado pelo painel de diagnostico: confirma credencial e bucket. */
export async function testar_bucket(): Promise<void> {
  await obter_cliente_r2().send(
    new HeadBucketCommand({ Bucket: nome_do_bucket() }),
  );
}
