import { consultar } from "@/lib/db";
import type { TipoDeNotificacao } from "@/types/notificacao";

/**
 * Consultas da caixa de notificacoes (RF-25, RF-26).
 *
 * RN-30: a notificacao e **gravada**, nao enviada. Estas consultas sao o
 * outro lado disso — a caixa que faz a gravacao valer alguma coisa. Quem
 * grava e a publicacao de anuncio (RF-24).
 */

export type NotificacaoNaCaixa = {
  id: string;
  tipo: TipoDeNotificacao;
  titulo: string;
  /** Para onde a notificacao leva. `null` se o anuncio foi apagado. */
  animal_id: string | null;
  lida_em: Date | null;
  criado_em: Date;
};

/**
 * A caixa de uma pessoa, mais recentes primeiro.
 *
 * Traz lidas e nao lidas: a caixa e historico, nao fila. O `LIMIT 50` evita
 * que uma conta antiga carregue tudo de uma vez — e a mesma razao do
 * `LIMIT 100` da listagem (RN-16).
 *
 * O indice `idx_notificacoes_pendentes` e parcial (`WHERE lida_em IS NULL`),
 * entao serve a contagem das nao lidas, nao a esta consulta. Com 50 linhas
 * por pessoa isso nao pesa.
 */
export async function notificacoes_do_perfil(
  perfil_id: string,
): Promise<NotificacaoNaCaixa[]> {
  return consultar<NotificacaoNaCaixa>(
    `SELECT id, tipo, titulo, animal_id, lida_em, criado_em
       FROM notificacoes
      WHERE perfil_id = $1
      ORDER BY criado_em DESC
      LIMIT 50`,
    [perfil_id],
  );
}

/**
 * Marca como lida (RF-26). Sem `ids`, marca todas.
 *
 * **O `perfil_id` esta sempre no `WHERE`**, mesmo quando os ids vem do
 * cliente: sem ele, mandar o id da notificacao de outra pessoa marcaria a
 * notificacao dela como lida.
 *
 * `lida_em IS NULL` evita reescrever a data de quem ja estava lida — a
 * primeira leitura e a que interessa.
 */
export async function marcar_lidas(
  perfil_id: string,
  ids: string[] | null,
): Promise<number> {
  const linhas = await consultar<{ id: string }>(
    `UPDATE notificacoes
        SET lida_em = now()
      WHERE perfil_id = $1
        AND lida_em IS NULL
        AND ($2::UUID[] IS NULL OR id = ANY($2))
      RETURNING id`,
    [perfil_id, ids],
  );
  return linhas.length;
}
