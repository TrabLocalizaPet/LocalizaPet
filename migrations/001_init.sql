-- 001_init.sql — schema inicial do LocalizaPet.
--
-- Derivado de docs/04-modelo-dados.md. A partir daqui a relacao se inverte:
-- este arquivo passa a mandar, e divergencia no documento e defeito do
-- documento.
--
-- Migration aplicada NUNCA e editada. Correcao vira 002_ (RNF-09) — alterar
-- este arquivo depois de aplicado quebra o banco de quem ja rodou.
--
-- As regras de negocio citadas nos comentarios estao em
-- docs/03-regras-negocio.md. Regra que o schema garante e regra que o handler
-- nao precisa lembrar de checar.

CREATE EXTENSION IF NOT EXISTS postgis;

-- ---------------------------------------------------------------------------
-- perfis
-- ---------------------------------------------------------------------------
-- `id` sem DEFAULT: espelha o id do provedor de autenticacao, e e gravado pela
-- aplicacao. Tambem sem FK para `auth.users` — mantem o schema portavel se o
-- grupo trocar de provedor (DP-02) e permite rodar o seed sem provedor nenhum.
CREATE TABLE perfis (
  id                UUID PRIMARY KEY,
  nome              TEXT NOT NULL,
  email             TEXT NOT NULL UNIQUE,                  -- RN-25
  telefone          TEXT,
  telefone_publico  BOOLEAN NOT NULL DEFAULT false,        -- RN-24
  papel             TEXT NOT NULL DEFAULT 'usuario',       -- RN-33
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT papel_conhecido CHECK (papel IN ('usuario', 'admin'))
);

-- ---------------------------------------------------------------------------
-- animais
-- ---------------------------------------------------------------------------
-- Os tres fluxos (perdido, encontrado, adocao) moram na mesma tabela: a busca
-- por regiao varre os tres de uma vez, e tabelas separadas exigiriam UNION na
-- operacao central do produto.
CREATE TABLE animais (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  autor_id      UUID NOT NULL REFERENCES perfis(id) ON DELETE CASCADE, -- RN-26
  tipo_anuncio  TEXT NOT NULL,                             -- RN-02
  nome          TEXT,                                      -- RN-04: quem acha
                                                           -- na rua nao sabe
  especie       TEXT NOT NULL,
  sexo          TEXT,
  porte         TEXT,
  cor           TEXT,
  idade_meses   INTEGER,                                   -- RN-05
  descricao     TEXT,
  situacao      TEXT NOT NULL DEFAULT 'ativo',             -- RN-07
  resolvido_em  TIMESTAMPTZ,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- DP-01: nada atualiza esta coluna hoje; ela e copia de criado_em. Decidir
  -- entre trigger BEFORE UPDATE em migration futura ou remover.
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT tipo_anuncio_conhecido
    CHECK (tipo_anuncio IN ('perdido', 'encontrado', 'adocao')),
  CONSTRAINT especie_conhecida
    CHECK (especie IN ('cachorro', 'gato', 'outro')),
  CONSTRAINT sexo_conhecido
    CHECK (sexo IN ('macho', 'femea')),                    -- NULL = nao se sabe
  CONSTRAINT porte_conhecido
    CHECK (porte IN ('pequeno', 'medio', 'grande')),
  CONSTRAINT idade_plausivel
    CHECK (idade_meses >= 0 AND idade_meses < 400),        -- RN-05
  CONSTRAINT situacao_conhecida
    CHECK (situacao IN ('ativo', 'resolvido', 'arquivado')),
  -- RN-08: tem data de resolucao se e somente se esta resolvido. As duas
  -- direcoes importam — resolvido sem data perde o historico, e data em
  -- anuncio ativo e contradicao.
  CONSTRAINT resolucao_coerente CHECK (
    (situacao = 'resolvido' AND resolvido_em IS NOT NULL) OR
    (situacao <> 'resolvido' AND resolvido_em IS NULL)
  )
);

-- ---------------------------------------------------------------------------
-- caracteristicas — catalogo mantido pelo administrador (RN-19, RN-32)
-- ---------------------------------------------------------------------------
-- Vocabulario controlado: quem publica seleciona, nao digita. Sem isso
-- "castrado", "Castrado" e "ja castrou" seriam tres valores e o filtro por
-- caracteristica (RF-16) deixaria de funcionar.
CREATE TABLE caracteristicas (
  id       SMALLSERIAL PRIMARY KEY,
  chave    TEXT NOT NULL UNIQUE,
  rotulo   TEXT NOT NULL,
  grupo    TEXT NOT NULL,
  especie  TEXT,                                           -- RN-21: NULL=todas
  ordem    SMALLINT NOT NULL DEFAULT 0,
  ativa    BOOLEAN NOT NULL DEFAULT true,                  -- RN-22

  CONSTRAINT grupo_conhecido
    CHECK (grupo IN ('saude', 'temperamento', 'convivencia')),
  CONSTRAINT especie_conhecida
    CHECK (especie IN ('cachorro', 'gato', 'outro'))
);

-- ---------------------------------------------------------------------------
-- animal_caracteristicas
-- ---------------------------------------------------------------------------
-- RN-18, tri-estado: a AUSENCIA de linha significa "ninguem informou", que e
-- diferente de `valor = false` ("sabemos que nao"). A distincao importa em
-- anuncio de animal encontrado, onde quem publica nao conhece o animal.
--
-- Caracteristica selecionada vira linha AQUI, nunca coluna em `animais`.
CREATE TABLE animal_caracteristicas (
  animal_id         UUID NOT NULL REFERENCES animais(id) ON DELETE CASCADE,
  -- RESTRICT, nao CASCADE: caracteristica em uso nao se exclui, se desativa
  -- pela coluna `ativa` (RN-22). Excluir apagaria a informacao dos anuncios.
  caracteristica_id SMALLINT NOT NULL
                    REFERENCES caracteristicas(id) ON DELETE RESTRICT,
  valor             BOOLEAN NOT NULL,
  observacao        TEXT,

  PRIMARY KEY (animal_id, caracteristica_id)
);

-- ---------------------------------------------------------------------------
-- fotos — arquivo no R2, referencia aqui (RNF-10)
-- ---------------------------------------------------------------------------
-- `chave_r2` guardada separada da `url` porque excluir o objeto no R2 precisa
-- da chave, e deriva-la da URL seria fragil se o dominio publico mudar.
--
-- O limite de 6 fotos (RN-06) e cobrado no schema Zod da entrada da API, nao
-- aqui: contar linhas exigiria trigger, e a regra e de formulario.
CREATE TABLE fotos (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id  UUID NOT NULL REFERENCES animais(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  chave_r2   TEXT NOT NULL,
  ordem      SMALLINT NOT NULL DEFAULT 0,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- avistamentos — o animal se move (RN-12)
-- ---------------------------------------------------------------------------
-- Um unico local no anuncio perderia o rastro, que e justamente o que ajuda o
-- tutor a procurar na direcao certa. O primeiro avistamento e o local do
-- desaparecimento; os seguintes sao relatos de terceiros.
CREATE TABLE avistamentos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id       UUID NOT NULL REFERENCES animais(id) ON DELETE CASCADE,
  -- SET NULL, nao CASCADE (RN-26): excluir o perfil anonimiza o relato mas
  -- preserva onde o animal foi visto — util ao tutor independente de quem
  -- relatou. NULL tambem cobre o relato anonimo (RN-13).
  autor_id        UUID REFERENCES perfis(id) ON DELETE SET NULL,
  local           GEOGRAPHY(POINT, 4326) NOT NULL,         -- RN-11
  endereco_texto  TEXT,                                    -- derivado, RN-17
  visto_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
  observacao      TEXT,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- areas_monitoradas (RN-27)
-- ---------------------------------------------------------------------------
CREATE TABLE areas_monitoradas (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id    UUID NOT NULL REFERENCES perfis(id) ON DELETE CASCADE, -- RN-26
  apelido      TEXT NOT NULL,
  centro       GEOGRAPHY(POINT, 4326) NOT NULL,            -- RN-11
  raio_metros  INTEGER NOT NULL DEFAULT 5000,              -- RN-15
  tipos        TEXT[] NOT NULL DEFAULT '{}',               -- RN-28: vazio=todos
  ativa        BOOLEAN NOT NULL DEFAULT true,              -- RN-29
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT raio_na_faixa CHECK (raio_metros BETWEEN 500 AND 50000),
  CONSTRAINT tipos_conhecidos
    CHECK (tipos <@ ARRAY['perdido', 'encontrado', 'adocao']::TEXT[])
);

-- ---------------------------------------------------------------------------
-- notificacoes — gravadas, nao enviadas (RN-30)
-- ---------------------------------------------------------------------------
-- A caixa de notificacoes funciona sem e-mail e sem push. Decisao do grupo.
CREATE TABLE notificacoes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id  UUID NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
  animal_id  UUID REFERENCES animais(id) ON DELETE CASCADE,
  tipo       TEXT NOT NULL,                                -- RN-31
  titulo     TEXT NOT NULL,
  lida_em    TIMESTAMPTZ,                                  -- NULL = nao lida
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT tipo_conhecido CHECK (
    tipo IN ('novo_na_regiao', 'novo_avistamento', 'possivel_match')
  )
);

-- ---------------------------------------------------------------------------
-- Indices
-- ---------------------------------------------------------------------------

-- RF-09, RF-10 — listagem por tipo, mais recentes primeiro. Parcial: anuncio
-- resolvido ou arquivado nao aparece na listagem (RN-09), entao nao precisa
-- ocupar o indice.
CREATE INDEX idx_animais_tipo
  ON animais (tipo_anuncio, criado_em DESC)
  WHERE situacao = 'ativo';

CREATE INDEX idx_animais_autor ON animais (autor_id);

-- RF-11, RNF-04 — a razao de o banco ter PostGIS. Sem GIST, ST_DWithin faz
-- seq scan e a operacao central do produto degrada com o volume.
CREATE INDEX idx_avistamentos_local ON avistamentos USING GIST (local);

-- RN-14 — o avistamento mais recente de cada animal, via LEFT JOIN LATERAL.
CREATE INDEX idx_avistamentos_animal ON avistamentos (animal_id, visto_em DESC);

-- RNF-05 — foto de capa por LEFT JOIN LATERAL.
CREATE INDEX idx_fotos_animal ON fotos (animal_id, ordem);

-- RF-16 — filtro por caracteristica.
CREATE INDEX idx_animal_carac_busca
  ON animal_caracteristicas (caracteristica_id, valor);

-- RF-24 — area desativada nao notifica, entao fica fora do indice.
CREATE INDEX idx_areas_centro
  ON areas_monitoradas USING GIST (centro)
  WHERE ativa;

CREATE INDEX idx_areas_perfil ON areas_monitoradas (perfil_id);

-- RF-25 — a caixa mostra as nao lidas; as lidas nao pesam no indice.
CREATE INDEX idx_notificacoes_pendentes
  ON notificacoes (perfil_id, criado_em DESC)
  WHERE lida_em IS NULL;
