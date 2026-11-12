/**
 * Ida ao login com volta marcada.
 *
 * Quem toca em Publicar sem sessao vai para o `/entrar` e, depois de entrar,
 * deve voltar ao Publicar — nao cair na Home e ter de achar o botao de novo.
 * O caminho de volta viaja no `?de=` da URL.
 */

/** URL do login que, depois de entrar, devolve a pessoa a `caminho`. */
export function entrar_e_voltar(caminho: string): string {
  return `/entrar?de=${encodeURIComponent(caminho)}`;
}

/**
 * O `?de=` lido da URL, se for um caminho deste site; senao, `padrao`.
 *
 * Aceita so o que comeca com uma barra e nao com duas: `//outro.site` e
 * `/\outro.site` o navegador trata como outro dominio, e o login viraria um
 * redirecionamento aberto — um link nosso levando a pagina de terceiro.
 */
export function destino_de_volta(busca: string, padrao: string): string {
  const de = new URLSearchParams(busca).get("de");
  if (!de || !de.startsWith("/") || de.startsWith("//") || de.startsWith("/\\")) {
    return padrao;
  }
  return de;
}
