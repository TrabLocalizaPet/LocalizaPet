import { consultar } from "@/lib/db";
import type { AnimalNoMapa } from "@/types/animal";

/**
 * Consultas de animais (RF-12).
 *
 * Todo SQL do projeto mora aqui.
 */

/**
 * Os anuncios ativos que tem coordenada, para desenhar os pinos (RF-12).
 *
 * Tres decisoes nesta consulta:
 *
 * **`LEFT JOIN LATERAL` com `LIMIT 1`** pega o avistamento mais recente de
 * cada animal (RN-14, RNF-05). O animal se move: guardar um unico local no
 * anuncio perderia o rastro, e o pino tem de estar onde ele foi visto por
 * ultimo, nao onde sumiu.
 *
 * **`ST_Y` e `ST_X` sobre `::geometry`** convertem a `GEOGRAPHY` de volta em
 * numeros. Repare na ordem: `ST_X` e a longitude e `ST_Y` e a latitude — o
 * PostGIS trabalha em (X, Y), o mapa fala (lat, lng), e trocar os dois poe o
 * pino no oceano sem erro nenhum.
 *
 * **`JOIN`, nao `LEFT JOIN`, no resultado lateral**: anuncio de adocao pode
 * nao ter local (RN-03), e sem coordenada nao ha pino para desenhar.
 *
 * `situacao = 'ativo'` cumpre RN-09 e usa o indice parcial `idx_animais_tipo`.
 */
export async function animais_no_mapa(): Promise<AnimalNoMapa[]> {
  return consultar<AnimalNoMapa>(
    `SELECT a.id,
            a.nome,
            a.tipo_anuncio,
            a.especie,
            ST_Y(v.local::geometry) AS lat,
            ST_X(v.local::geometry) AS lng,
            v.visto_em
       FROM animais a
       JOIN LATERAL (
            SELECT av.local, av.visto_em
              FROM avistamentos av
             WHERE av.animal_id = a.id
             ORDER BY av.visto_em DESC
             LIMIT 1
       ) v ON true
      WHERE a.situacao = 'ativo'
      ORDER BY v.visto_em DESC`,
  );
}
