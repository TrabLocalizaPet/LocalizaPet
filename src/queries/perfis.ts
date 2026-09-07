import { consultar } from "@/lib/db";
import type { EdicaoDePerfil, Perfil, PerfilPublico } from "@/types/perfil";

/**
 * Consultas de perfil (RF-19, RF-20, RF-21).
 *
 * Todo SQL do projeto mora aqui. O Supabase Auth cuida da identidade; o dado
 * do perfil e nosso, no Postgres, lido pelo driver `pg` no pooler.
 *
 * `perfis.id` recebe o id do usuario em `auth.users`, sem chave estrangeira
 * (DT-07) — e o que mantem o schema portavel e o seed rodando sem provedor.
 */

const COLUNAS = `
  id, nome, email, telefone, telefone_publico, papel, criado_em
`;

/**
 * Cria o perfil do usuario recem-cadastrado, ou devolve o que ja existe.
 *
 * Idempotente de proposito: o cadastro sao dois passos em servicos diferentes
 * — o provedor cria a identidade, nos criamos o perfil. Se o segundo falhar,
 * a pessoa fica com conta e sem perfil, e a proxima tentativa precisa
 * conseguir terminar o servico em vez de esbarrar em chave duplicada.
 *
 * `DO NOTHING` em vez de `DO UPDATE` porque esta funcao nao pode desfazer uma
 * edicao feita depois (RF-20): quem ja tem perfil, tem o seu.
 */
export async function garantir_perfil(dados: {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
}): Promise<Perfil> {
  const criados = await consultar<Perfil>(
    `INSERT INTO perfis (id, nome, email, telefone)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (id) DO NOTHING
     RETURNING ${COLUNAS}`,
    [dados.id, dados.nome, dados.email, dados.telefone],
  );

  if (criados.length > 0) return criados[0];

  const existentes = await consultar<Perfil>(
    `SELECT ${COLUNAS} FROM perfis WHERE id = $1`,
    [dados.id],
  );
  return existentes[0];
}

/** O perfil inteiro. Só para o próprio dono — devolve `email` e `papel`. */
export async function buscar_perfil(id: string): Promise<Perfil | null> {
  const linhas = await consultar<Perfil>(
    `SELECT ${COLUNAS} FROM perfis WHERE id = $1`,
    [id],
  );
  return linhas[0] ?? null;
}

/**
 * O perfil como um terceiro pode ve-lo (RF-21).
 *
 * RN-24 e RN-25 sao cumpridas **aqui, na consulta**: o e-mail nao e
 * selecionado, e o telefone so sai quando `telefone_publico` e verdadeiro.
 * Esconder na tela nao cumpriria a regra — o dado ainda viajaria na resposta
 * da API, onde qualquer um consegue ler.
 */
export async function buscar_perfil_publico(
  id: string,
): Promise<PerfilPublico | null> {
  const linhas = await consultar<PerfilPublico>(
    `SELECT id,
            nome,
            CASE WHEN telefone_publico THEN telefone ELSE NULL END AS telefone
       FROM perfis
      WHERE id = $1`,
    [id],
  );
  return linhas[0] ?? null;
}

/**
 * Atualiza os campos que o dono controla (RF-20).
 *
 * `papel` fica de fora de proposito: e atributo persistente do perfil
 * (RN-33), nao preferencia do usuario. Ninguem vira administrador editando o
 * proprio cadastro.
 */
export async function atualizar_perfil(
  id: string,
  dados: EdicaoDePerfil,
): Promise<Perfil | null> {
  const linhas = await consultar<Perfil>(
    `UPDATE perfis
        SET nome = $2,
            telefone = $3,
            telefone_publico = $4
      WHERE id = $1
      RETURNING ${COLUNAS}`,
    [id, dados.nome, dados.telefone, dados.telefone_publico],
  );
  return linhas[0] ?? null;
}
