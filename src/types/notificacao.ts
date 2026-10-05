/**
 * Tipos da notificacao, espelhando o `CHECK tipo_conhecido` da `001_init.sql`
 * (RN-31).
 *
 * `novo_avistamento` e `possivel_match` ja existem no schema e ainda nao tem
 * quem os grave — sao a F-13 e o incremento 3. Estao aqui porque o dominio e
 * do banco, nao de quem grava.
 */
export type TipoDeNotificacao =
  | "novo_na_regiao"
  | "novo_avistamento"
  | "possivel_match";
