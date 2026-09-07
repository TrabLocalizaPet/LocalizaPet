/**
 * Constantes de geolocalizacao.
 *
 * Vivem aqui, e nao em `components/mapa.tsx`, por um motivo que custa um
 * build quebrado para descobrir: aquele arquivo importa o Leaflet, que toca
 * `window` na importacao. Um `import { CENTRO_PADRAO } from "@/components/mapa"`
 * e estatico — arrasta o modulo inteiro para o bundle do servidor e derruba a
 * pre-renderizacao, mesmo que o componente seja carregado com `ssr: false`.
 *
 * `dynamic(..., { ssr: false })` so protege o que e importado **por dentro**
 * dele. Constante compartilhada com codigo de servidor fica fora.
 */

/** Centro de Niteroi. Vale enquanto a geolocalizacao nao responde (RF-13). */
export const CENTRO_PADRAO: [number, number] = [-22.9068, -43.1289];
