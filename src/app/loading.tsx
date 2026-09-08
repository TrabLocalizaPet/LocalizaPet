import { Splash } from "@/components/splash";

/**
 * A Splash aparece **enquanto a `/` decide para onde mandar voce**.
 *
 * No Figma ela e a primeira tela do fluxo, antes do Login. Numa aplicacao
 * web, uma tela de abertura por tempo fixo so atrasaria o conteudo. Aqui ela
 * ganha a funcao que ja existia: a `/` consulta a sessao no servidor para
 * redirecionar quem ja entrou (RF-22), e essa espera precisava de alguma
 * coisa na tela.
 *
 * Mesma imagem do desenho, com um proposito real em vez de um `setTimeout`.
 */
export default function Carregando() {
  return <Splash />;
}
