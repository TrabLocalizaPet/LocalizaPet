/**
 * Tipos do animal, compartilhados entre a API e as telas.
 *
 * Os literais espelham os `CHECK` do `001_init.sql`. SQL e string: nenhum
 * verificador confere nome de coluna nem valor de dominio por nos.
 */

export type TipoDeAnuncio = "perdido" | "encontrado" | "adocao";
export type Especie = "cachorro" | "gato" | "outro";
export type Sexo = "macho" | "femea";
export type Porte = "pequeno" | "medio" | "grande";
export type Situacao = "ativo" | "resolvido" | "arquivado";

/**
 * O que um pino do mapa precisa carregar (RF-12).
 *
 * De proposito, quase nada: o mapa desenha centenas destes de uma vez, e
 * descricao e caracteristicas so importam na tela de detalhe (F-06).
 *
 * A coordenada vem do avistamento **mais recente**, nao do anuncio — o
 * animal se move (RN-14).
 */
export type AnimalNoMapa = {
  id: string;
  nome: string | null;
  tipo_anuncio: TipoDeAnuncio;
  especie: Especie;
  lat: number;
  lng: number;
  visto_em: Date;
};
