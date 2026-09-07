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

/**
 * Um anuncio na listagem (RF-09, RF-10).
 *
 * `lat` e `lng` sao nulos quando o anuncio nao tem avistamento nenhum —
 * acontece so em adocao, que dispensa local (RN-03). O anuncio continua
 * aparecendo na lista; o que ele nao faz e aparecer na busca por raio.
 */
export type AnimalNaLista = {
  id: string;
  nome: string | null;
  tipo_anuncio: TipoDeAnuncio;
  especie: Especie;
  sexo: Sexo | null;
  porte: Porte | null;
  cor: string | null;
  idade_meses: number | null;
  criado_em: Date;
  lat: number | null;
  lng: number | null;
  endereco_texto: string | null;
};

/**
 * Um anuncio na tela de detalhe (RF-15, RF-21).
 *
 * `autor_telefone` ja chega filtrado por RN-24: vem `null` quando o autor
 * nao autorizou. A decisao acontece na consulta, nao na tela — esconder na
 * interface deixaria o telefone viajar na resposta da API.
 *
 * `autor_email` nao existe neste tipo, e e proposital (RN-25).
 */
export type AnimalEmDetalhe = AnimalNaLista & {
  descricao: string | null;
  situacao: Situacao;
  autor_id: string;
  autor_nome: string;
  autor_telefone: string | null;
  visto_em: Date | null;
};

/**
 * O que a criacao de anuncio recebe (RF-01, RF-02, RF-03).
 *
 * `autor_id` vem da sessao, nunca do corpo da requisicao.
 *
 * `local` e nulo apenas em anuncio de adocao (RN-03): sem coordenada o
 * anuncio nao aparece em busca por regiao, que e a funcao central do produto.
 */
export type NovoAnuncio = {
  autor_id: string;
  tipo_anuncio: TipoDeAnuncio;
  nome: string | null;
  especie: Especie;
  sexo: Sexo | null;
  porte: Porte | null;
  cor: string | null;
  idade_meses: number | null;
  descricao: string | null;
  local: { lat: number; lng: number } | null;
};
