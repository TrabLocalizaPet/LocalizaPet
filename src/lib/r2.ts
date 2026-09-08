import {
  S3Client,
  HeadBucketCommand,
  PutObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";

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

/** Os unicos formatos aceitos. Vale no servidor, nao so no seletor de arquivo. */
export const TIPOS_DE_IMAGEM = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type TipoDeImagem = (typeof TIPOS_DE_IMAGEM)[number];

const EXTENSAO: Record<TipoDeImagem, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * URL assinada para o navegador enviar o arquivo **direto ao R2** (RNF-10).
 *
 * O arquivo nunca passa pela funcao serverless. Isso nao e so economia: o
 * corpo da requisicao na Vercel tem limite de tamanho, e uma foto de celular
 * o estoura com facilidade.
 *
 * A chave e gerada aqui, e nao aceita do cliente: nome de arquivo vindo do
 * navegador permitiria sobrescrever objeto de outra pessoa. Ela leva o id do
 * autor no caminho, o que torna obvio de quem e cada objeto ao olhar o
 * bucket.
 *
 * Dez minutos de validade — tempo de sobra para um envio e curto o bastante
 * para a URL nao virar um direito de escrita permanente se vazar.
 */
export async function url_assinada_para_upload(
  autor_id: string,
  tipo: TipoDeImagem,
): Promise<{ url: string; chave: string }> {
  const chave = `animais/${autor_id}/${randomUUID()}.${EXTENSAO[tipo]}`;

  const url = await getSignedUrl(
    obter_cliente_r2(),
    new PutObjectCommand({
      Bucket: nome_do_bucket(),
      Key: chave,
      ContentType: tipo,
    }),
    { expiresIn: 600 },
  );

  return { url, chave };
}

/**
 * Apaga objetos do bucket.
 *
 * **Chamar sempre DEPOIS de apagar as linhas no banco.** Na ordem inversa, um
 * erro na transacao deixaria um anuncio apontando para foto inexistente —
 * quebrado e visivel. Nesta ordem, o pior caso e um arquivo esquecido no
 * bucket: invisivel e barato.
 *
 * Por isso tambem nao lanca: falhar aqui nao pode desfazer uma exclusao que
 * ja aconteceu no banco. O erro e registrado e a vida segue.
 *
 * `DeleteObjects` leva ate mil chaves numa requisicao so — apagar um anuncio
 * com seis fotos custa uma chamada, nao seis.
 */
export async function excluir_objetos(chaves: string[]): Promise<void> {
  if (chaves.length === 0) return;

  try {
    await obter_cliente_r2().send(
      new DeleteObjectsCommand({
        Bucket: nome_do_bucket(),
        Delete: { Objects: chaves.map((Key) => ({ Key })), Quiet: true },
      }),
    );
  } catch (erro) {
    console.error("nao foi possivel apagar do R2:", chaves, erro);
  }
}

/** Usado pelo painel de diagnostico: confirma credencial e bucket. */
export async function testar_bucket(): Promise<void> {
  await obter_cliente_r2().send(
    new HeadBucketCommand({ Bucket: nome_do_bucket() }),
  );
}
