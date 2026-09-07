# 03 — Regras de negócio

Cada regra indica **onde será garantida**. Regra que só existe em documento
não é regra: é intenção. A coluna aponta o ponto do sistema responsável por
fazê-la valer — um `CHECK` no schema, uma validação na entrada da API ou uma
transação.

Isso é o que torna a regra verificável na implementação: quem for escrever o
código sabe onde ela mora, e quem revisar sabe onde procurar.

---

## Anúncio

| ID | Regra | Onde é garantida |
|---|---|---|
| **RN-01** | Os papéis **de anúncio** são situacionais, não cargos. A mesma pessoa é Tutor num anúncio e Localizador em outro. O papel decorre do `tipo_anuncio`, não do perfil. | `perfis` não guarda papel de anúncio |
| **RN-02** | Todo anúncio pertence a exatamente um tipo: `perdido`, `encontrado` ou `adocao`. | `CHECK (tipo_anuncio IN (...))` |
| **RN-03** | Anúncio de `perdido` ou `encontrado` **exige** local. Sem coordenada ele não aparece em nenhuma busca por região, que é a função central do produto. Anúncio de `adocao` dispensa. | validação na entrada da API, após o schema Zod |
| **RN-04** | O nome do animal é opcional. Quem encontra um animal na rua normalmente não sabe o nome. | `nome TEXT` sem `NOT NULL` |
| **RN-05** | A idade, quando informada, fica entre 0 e 399 meses. | `CHECK (idade_meses >= 0 AND idade_meses < 400)` |
| **RN-06** | Um anúncio tem no máximo 6 fotos. | schema Zod na entrada da API |

## Ciclo de vida do anúncio

| ID | Regra | Onde é garantida |
|---|---|---|
| **RN-07** | Um anúncio está em um de três estados: `ativo`, `resolvido` ou `arquivado`. Nasce `ativo`. | `CHECK (situacao IN (...))`, `DEFAULT 'ativo'` |
| **RN-08** | Um anúncio tem data de resolução **se e somente se** estiver resolvido. | `CONSTRAINT resolucao_coerente` |
| **RN-09** | Apenas anúncios `ativo` aparecem em listagens e buscas. | `WHERE situacao = 'ativo'` nas consultas de listagem e busca |
| **RN-10** | O autor pode marcar o próprio anúncio como resolvido — é o que fecha o ciclo "animal encontrado". | — |

## Localização e busca

| ID | Regra | Onde é garantida |
|---|---|---|
| **RN-11** | A posição é armazenada como `GEOGRAPHY(POINT, 4326)`, para que distância saia em metros reais, sem conversão na aplicação. | `avistamentos.local`, `areas_monitoradas.centro` |
| **RN-12** | O primeiro avistamento de um anúncio é o local do desaparecimento (ou de onde o animal foi encontrado). Os seguintes são relatos de terceiros. | primeiro avistamento gravado junto do anúncio; ordenação por `visto_em DESC` |
| **RN-13** | Um avistamento pode ser anônimo — o relato é útil mesmo sem cadastro. | `autor_id UUID REFERENCES perfis(id) ON DELETE SET NULL` |
| **RN-14** | A busca por raio considera o **avistamento mais recente** de cada animal, não o primeiro. O animal se move. | `LEFT JOIN LATERAL ... ORDER BY visto_em DESC LIMIT 1` |
| **RN-15** | O raio de busca fica entre 500 m e 50 km. O padrão é 5 km. | `CHECK (raio_metros BETWEEN 500 AND 50000)`; padrão na consulta |
| **RN-16** | Uma busca devolve no máximo 100 anúncios, do mais próximo ao mais distante. | `LIMIT 100`, `ORDER BY distancia_metros` |
| **RN-17** | O endereço em texto é **derivado** da coordenada e é melhor esforço. Se o Nominatim falhar, o anúncio é criado do mesmo jeito. A busca nunca depende dele — usa a coordenada. | geocodificação devolve `null` em qualquer falha |

## Características do animal

| ID | Regra | Onde é garantida |
|---|---|---|
| **RN-18** | Característica é **tri-estado**: sim, não, ou não se sabe. A **ausência** de linha em `animal_caracteristicas` significa "ninguém informou" — diferente de "sabemos que não". | Chave primária composta; ausência de linha |
| **RN-19** | O catálogo de características é mantido pelo **administrador**, pela interface do sistema. Acrescentar "convive com gatos" não exige migration. | Tabela `caracteristicas` com `chave` única |
| **RN-20** | Quem publica anúncio **apenas seleciona** características do catálogo. Não digita texto livre nem cria entrada nova. Isso mantém o vocabulário controlado e o filtro por característica utilizável. | `animal_caracteristicas.caracteristica_id` referencia o catálogo |
| **RN-21** | Uma característica pode valer só para uma espécie. `NULL` vale para todas. | `caracteristicas.especie` |
| **RN-22** | Característica em uso não pode ser excluída do catálogo; só desativada. Excluir apagaria a informação dos anúncios que já a usam. | `ON DELETE RESTRICT`; coluna `ativa` |
| **RN-23** | Característica desativada não aparece para seleção em anúncio novo, mas continua visível nos anúncios que já a possuem. | `caracteristicas.ativa` |

> **Ao implementar:** característica selecionada vira linha em
> `animal_caracteristicas`, nunca coluna em `animais`. Ver
> [04 — Modelo de dados](04-modelo-dados.md#características-em-catálogo-mantido-pelo-administrador).

## Contato e privacidade

| ID | Regra | Onde é garantida |
|---|---|---|
| **RN-24** | O telefone do autor só aparece no anúncio se ele autorizou. | `perfis.telefone_publico`, `DEFAULT false` |
| **RN-25** | O e-mail do perfil é único e nunca é exibido publicamente. | `email TEXT NOT NULL UNIQUE` |
| **RN-26** | Excluir um perfil remove seus anúncios, fotos e áreas monitoradas. Os avistamentos que ele relatou **permanecem**, anonimizados — a informação de onde o animal foi visto é útil ao tutor independentemente de quem relatou. | `ON DELETE CASCADE` vs. `ON DELETE SET NULL` em `avistamentos.autor_id` |

## Áreas monitoradas e notificações

| ID | Regra | Onde é garantida |
|---|---|---|
| **RN-27** | Um usuário define uma ou mais regiões de interesse e é notificado quando surge anúncio dentro do raio. | `areas_monitoradas` |
| **RN-28** | Área com lista de tipos vazia notifica sobre **todos** os tipos. | `tipos TEXT[] NOT NULL DEFAULT '{}'` |
| **RN-29** | Área pode ser desativada sem ser excluída, preservando o histórico. | `ativa BOOLEAN`; índice parcial `WHERE ativa` |
| **RN-30** | Notificação é **gravada no banco**, não enviada. A caixa de notificações funciona sem depender de e-mail ou push. | `notificacoes` |
| **RN-31** | Existem três motivos de notificação: `novo_na_regiao`, `novo_avistamento`, `possivel_match`. | `CHECK (tipo IN (...))` |

## Administração

| ID | Regra | Onde é garantida |
|---|---|---|
| **RN-32** | Apenas o administrador cria, edita e desativa características do catálogo. Usuário comum só seleciona (RN-20). | `perfis.papel` |
| **RN-33** | O papel de administrador é atributo **persistente** do perfil, ao contrário dos papéis de anúncio (RN-01), que são situacionais. | `CHECK (papel IN ('usuario', 'admin'))` |

## Integridade

| ID | Regra | Onde é garantida |
|---|---|---|
| **RN-34** | Criar um anúncio grava anúncio, primeiro avistamento e fotos **atomicamente**. Se qualquer parte falhar, nada é gravado — anúncio de perdido sem local seria inútil (RN-03). | transação única na criação do anúncio |
| **RN-35** | Cada migration é aplicada dentro de uma transação, e uma só vez. | runner de migrations, tabela `_migrations` |

---

## Onde vivem as regras

| Camada | Regras |
|---|---|
| Schema (`CHECK`, FK, constraint) | RN-02, RN-04, RN-05, RN-07, RN-08, RN-11, RN-13, RN-15, RN-18, RN-20, RN-21, RN-22, RN-25, RN-26, RN-28, RN-29, RN-31, RN-33 |
| Validação de entrada na API | RN-03, RN-06 |
| Consulta (`WHERE`, `ORDER BY`, `LIMIT`) | RN-09, RN-14, RN-16, RN-23, RN-24 |
| Transação | RN-34, RN-35 |
| Lógica de aplicação | RN-01, RN-10, RN-12, RN-17, RN-19, RN-27, RN-30, RN-32 |

A maior parte cai no schema, o que é proposital: regra garantida por `CHECK`
não depende de ninguém lembrar dela no código.

O acompanhamento de **o que já foi implementado** não fica aqui — fica nas
issues do GitHub, com horas previstas e realizadas, que é o que alimenta o
burndown e o EVM da disciplina.
