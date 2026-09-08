import { consultar } from "@/lib/db";

/**
 * Consultas de fotos (RF-05).
 *
 * A tabela guarda `url` e `chave_r2` separados de proposito: apagar o objeto
 * no R2 precisa da chave, e deriva-la da URL seria fragil se o dominio
 * publico mudar (ver 04-modelo-dados).
 */

/**
 * As chaves das fotos de um anuncio.
 *
 * Chamada **antes** de apagar o anuncio: o `ON DELETE CASCADE` leva as linhas
 * de `fotos` junto, e depois disso nao ha mais como saber quais objetos
 * ficaram orfaos no bucket.
 */
export async function chaves_das_fotos(animal_id: string): Promise<string[]> {
  const linhas = await consultar<{ chave_r2: string }>(
    "SELECT chave_r2 FROM fotos WHERE animal_id = $1",
    [animal_id],
  );
  return linhas.map((linha) => linha.chave_r2);
}

/**
 * A chave ja pertence a algum anuncio publicado?
 *
 * Serve de trava antes de apagar um objeto: enquanto o arquivo esta so no
 * formulario, remove-lo e limpeza; depois de publicado, seria destruir a foto
 * de um anuncio no ar.
 */
export async function chave_publicada(chave: string): Promise<boolean> {
  const linhas = await consultar<{ existe: boolean }>(
    "SELECT true AS existe FROM fotos WHERE chave_r2 = $1 LIMIT 1",
    [chave],
  );
  return linhas.length > 0;
}
