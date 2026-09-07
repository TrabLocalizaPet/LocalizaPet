/**
 * Tipos do perfil, compartilhados entre a API e as telas.
 *
 * Os literais espelham o `CHECK (papel IN ('usuario','admin'))` do
 * `001_init.sql`. Se um dia mudarem la, mudam aqui — o SQL e string e nenhum
 * verificador confere isso por nos.
 */

export type Papel = "usuario" | "admin";

/** O perfil inteiro. So o proprio dono ve isto. */
export type Perfil = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  telefone_publico: boolean;
  papel: Papel;
  criado_em: Date;
};

/**
 * O que um terceiro pode ver de um perfil.
 *
 * Sem `email`, que nunca e exibido publicamente (RN-25), e sem `papel`, que
 * nao diz respeito a quem olha um anuncio. O `telefone` vem `null` quando o
 * dono nao autorizou (RN-24) — a decisao acontece na consulta, nao na tela.
 */
export type PerfilPublico = {
  id: string;
  nome: string;
  telefone: string | null;
};

/** Campos que o dono pode alterar na propria conta (RF-20). */
export type EdicaoDePerfil = {
  nome: string;
  telefone: string | null;
  telefone_publico: boolean;
};
