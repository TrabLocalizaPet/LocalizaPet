-- 002_perfil_do_cadastro.sql
--
-- Duas colunas que o fluxo de cadastro do Figma pede e o 001 nao tinha.
-- Ambas nascem NULL: os perfis que ja existem foram criados sem elas, e
-- exigir valor agora quebraria o cadastro de quem entrou antes.
--
-- Migration aplicada NUNCA e editada. Correcao vira 003_.

-- Perguntada em "Qual a sua data de nascimento?".
--
-- DATE, e nao TIMESTAMPTZ: data de nascimento nao tem hora nem fuso. Guardar
-- com fuso faria a data mudar conforme onde a pessoa abre o aplicativo.
ALTER TABLE perfis ADD COLUMN data_nascimento DATE;

-- Sem idade minima nem `NOT NULL` — o produto nao restringe idade, e a
-- checagem existe so para barrar o impossivel: data no futuro, ou anterior a
-- qualquer pessoa viva.
ALTER TABLE perfis ADD CONSTRAINT nascimento_plausivel CHECK (
  data_nascimento IS NULL OR
  (data_nascimento > DATE '1900-01-01' AND data_nascimento <= CURRENT_DATE)
);

-- Resposta de "O que te trouxe aqui?", perguntada uma vez ao fim do
-- cadastro.
--
-- E **preferencia de quem se cadastrou**, nao papel e nao tipo de anuncio.
-- A mesma pessoa que chegou dizendo "quero adotar" publica um perdido no mes
-- seguinte: os papeis de anuncio continuam situacionais (RN-01), e esta
-- coluna nao os limita. Serve para abrir o aplicativo no lugar certo.
--
-- `quero_adotar` nao tem correspondente em `animais.tipo_anuncio`, e e
-- proposital: adotar e navegar, nao publicar.
ALTER TABLE perfis ADD COLUMN intencao TEXT;

ALTER TABLE perfis ADD CONSTRAINT intencao_conhecida CHECK (
  intencao IS NULL OR
  intencao IN ('perdi_pet', 'achei_pet', 'quero_adotar', 'quero_doar')
);
