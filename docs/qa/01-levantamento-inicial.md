# Levantamento Inicial de QA — LocalizaPet

## 1. Objetivo

Este documento apresenta o levantamento inicial de Qualidade e Testes do projeto **LocalizaPet**.

O objetivo é identificar as principais funcionalidades do sistema, os requisitos que precisam ser validados, os riscos associados ao produto e os pontos que devem receber maior atenção durante a execução dos testes.

O levantamento servirá como base para a elaboração da matriz de testes, execução dos casos de teste, registro de evidências, identificação de defeitos e posterior validação das correções.

---

## 2. Escopo do levantamento

O levantamento inicial considera as funcionalidades relacionadas ao objetivo principal do LocalizaPet, especialmente:

* Cadastro e gerenciamento de anúncios de animais;
* Cadastro de animais perdidos, encontrados e para adoção;
* Inclusão de fotos nos anúncios;
* Seleção de características do animal;
* Localização geográfica dos anúncios;
* Visualização dos anúncios em mapa;
* Busca e filtros;
* Consulta de distância entre usuário e anúncio;
* Registro de avistamentos;
* Cadastro e autenticação de usuários;
* Configuração de privacidade do telefone;
* Áreas monitoradas;
* Notificações;
* Gerenciamento do catálogo de características;
* Integridade dos dados e migrações.

---

## 3. Objetivos da análise de qualidade

Durante o levantamento inicial, a análise de QA tem como objetivos:

1. Verificar se as funcionalidades previstas possuem critérios que possam ser testados;
2. Identificar regras de negócio que precisam de validação;
3. Identificar cenários positivos e negativos;
4. Identificar valores limites e entradas inválidas;
5. Avaliar os riscos das funcionalidades mais críticas;
6. Priorizar os testes de acordo com o impacto para o sistema;
7. Estabelecer uma base para a matriz de casos de teste;
8. Garantir que os defeitos encontrados possam ser reproduzidos e rastreados.

---

## 4. Principais funcionalidades identificadas

### 4.1 Anúncios

O sistema deve permitir a criação de anúncios relacionados a animais perdidos, encontrados e disponíveis para adoção.

Durante os testes devem ser verificadas:

* Criação de anúncios;
* Preenchimento dos campos obrigatórios;
* Campos opcionais;
* Validação dos dados informados;
* Inclusão de fotos;
* Limite de quantidade de fotos;
* Seleção das características do animal;
* Localização do anúncio;
* Alteração do status do anúncio;
* Encerramento de anúncios pelo responsável.

### 4.2 Localização e mapa

A localização é uma das áreas de maior atenção no projeto.

Devem ser considerados cenários envolvendo:

* Seleção da localização pelo mapa;
* Obtenção da localização do navegador;
* Conversão de coordenadas para endereço;
* Exibição dos anúncios no mapa;
* Cálculo da distância;
* Busca por raio;
* Limites do raio de pesquisa;
* Permissão ou negação de acesso à localização;
* Indisponibilidade da localização;
* Coordenadas inválidas ou inesperadas.

### 4.3 Busca e filtros

A funcionalidade de busca deve ser validada considerando diferentes combinações de filtros.

Devem ser testados:

* Busca de anúncios ativos;
* Ordenação dos resultados;
* Filtro por tipo de anúncio;
* Filtro por espécie;
* Filtro por tamanho;
* Filtro por características;
* Busca por raio;
* Combinação de filtros;
* Ausência de resultados;
* Exibição da distância até o anúncio.

### 4.4 Avistamentos

O sistema deve permitir o registro de avistamentos relacionados aos anúncios.

Os testes devem verificar:

* Registro de um avistamento;
* Inclusão da localização;
* Inclusão de informações relacionadas ao avistamento;
* Possibilidade de registro anônimo;
* Associação correta do avistamento ao anúncio;
* Atualização das informações do anúncio;
* Integridade da criação do anúncio, primeiro avistamento e fotos.

### 4.5 Usuários e autenticação

Devem ser validados:

* Cadastro de usuário;
* Autenticação;
* Validação de e-mail;
* Unicidade do e-mail;
* Acesso às funcionalidades que exigem autenticação;
* Acesso de visitantes às funcionalidades públicas;
* Configuração de privacidade do telefone.

### 4.6 Áreas monitoradas e notificações

A funcionalidade de monitoramento deve ser validada considerando:

* Criação de área monitorada;
* Desativação da área;
* Definição dos tipos de anúncio monitorados;
* Comportamento quando nenhum tipo específico é selecionado;
* Recebimento de notificações;
* Diferentes motivos de notificação;
* Visualização e estado de leitura das notificações.

### 4.7 Catálogo de características

Para as funcionalidades administrativas devem ser considerados:

* Cadastro de características;
* Alteração de características;
* Desativação de características;
* Disponibilidade das características para novos anúncios;
* Preservação das características utilizadas em registros históricos.

### 4.8 Banco de dados e migrações

Também devem ser avaliados aspectos relacionados à integridade dos dados.

Os testes devem verificar:

* Criação correta dos registros;
* Relacionamento entre entidades;
* Integridade das operações;
* Comportamento em caso de falha;
* Execução segura das migrações;
* Possibilidade de execução repetida das migrações sem corromper os dados.

---

## 5. Requisitos e regras de negócio prioritários

A análise inicial identificou requisitos e regras de negócio que devem receber atenção especial durante os testes.

Entre eles estão:

* Publicação de anúncios de animais perdidos, encontrados e para adoção;
* Seleção da localização pelo mapa;
* Inclusão de até 6 fotos;
* Seleção das características do animal;
* Preenchimento do endereço a partir das coordenadas;
* Listagem de anúncios ativos;
* Ordenação dos anúncios mais recentes;
* Busca por raio;
* Exibição dos anúncios no mapa;
* Utilização da localização do navegador;
* Exibição da distância até o anúncio;
* Registro de avistamentos;
* Cadastro e autenticação;
* Privacidade do telefone;
* Acesso de visitantes;
* Criação de áreas monitoradas;
* Envio e gerenciamento de notificações;
* Gerenciamento das características pelo administrador.

As regras de limite também devem receber atenção especial, principalmente:

* Idade do animal;
* Quantidade máxima de fotos;
* Raio mínimo e máximo de pesquisa;
* Campos obrigatórios e opcionais;
* Unicidade do e-mail;
* Permissão de localização;
* Disponibilidade de características desativadas.

---

## 6. Principais riscos identificados

### 6.1 Geolocalização

A geolocalização é considerada um dos principais riscos do sistema porque diversas funcionalidades dependem de coordenadas corretas.

Um problema nessa área pode afetar:

* Localização dos anúncios;
* Busca por proximidade;
* Distância apresentada ao usuário;
* Marcadores no mapa;
* Áreas monitoradas;
* Notificações;
* Registro de avistamentos.

Por isso, os testes devem considerar diferentes condições de localização, incluindo permissões negadas, localização indisponível e situações de dados inconsistentes.

### 6.2 Integridade dos anúncios

Um anúncio pode possuir informações relacionadas, como fotos, características, localização e avistamentos.

É importante verificar se essas informações permanecem corretamente associadas e se uma falha durante o cadastro não deixa registros incompletos.

### 6.3 Regras de limite

Valores próximos aos limites definidos pelas regras de negócio podem apresentar comportamentos diferentes dos valores comuns.

Devem ser priorizados testes com:

* Valor mínimo;
* Valor máximo;
* Valor imediatamente abaixo do mínimo;
* Valor imediatamente acima do máximo;
* Campos vazios;
* Valores inválidos.

### 6.4 Privacidade

A configuração de privacidade do telefone deve ser validada para garantir que informações privadas não sejam disponibilizadas indevidamente.

### 6.5 Notificações

Falhas nas regras de monitoramento podem resultar em:

* Notificações que deveriam ser enviadas e não são;
* Notificações enviadas para usuários incorretos;
* Notificações fora da área configurada;
* Notificações duplicadas;
* Motivos de notificação incorretos.

---

## 7. Priorização inicial dos testes

A prioridade dos testes será definida considerando o impacto da funcionalidade e o risco associado.

### Prioridade crítica

Funcionalidades cuja falha pode comprometer diretamente o objetivo principal do sistema.

* Geolocalização;
* Busca por raio;
* Localização dos anúncios;
* Registro de avistamentos;
* Integridade dos anúncios;
* Notificações relacionadas às áreas monitoradas.

### Prioridade alta

Funcionalidades importantes para o funcionamento geral do sistema.

* Cadastro de anúncios;
* Upload de fotos;
* Busca e filtros;
* Cadastro e autenticação;
* Privacidade do telefone;
* Visualização no mapa.

### Prioridade média

Funcionalidades importantes, mas cujo impacto é menor em caso de falha.

* Ordenação;
* Filtros secundários;
* Gerenciamento de características;
* Estado de leitura das notificações.

### Prioridade baixa

Funcionalidades ou cenários de menor impacto, que podem ser executados após a validação das funcionalidades críticas.

---

## 8. Estratégia inicial de testes

A estratégia inicial será baseada principalmente em testes funcionais, testes de regras de negócio e testes de integração.

Serão considerados:

* Cenários positivos;
* Cenários negativos;
* Testes de fronteira;
* Testes de validação de campos;
* Testes de integração;
* Testes relacionados à geolocalização;
* Testes de responsividade;
* Testes de usabilidade;
* Testes de regressão após correções.

Para funcionalidades críticas, deverão ser priorizados cenários que possam causar perda de dados, informações incorretas de localização, exposição indevida de dados ou falhas no fluxo principal.

---

## 9. Critérios iniciais para aprovação

Uma funcionalidade será considerada validada quando:

* O comportamento observado estiver de acordo com o requisito correspondente;
* As regras de negócio forem respeitadas;
* Os cenários positivos funcionarem corretamente;
* Os cenários negativos forem tratados adequadamente;
* Os valores limites apresentarem o comportamento esperado;
* Não houver defeitos críticos ou altos bloqueando a funcionalidade;
* As correções realizadas tiverem sido retestadas;
* Os testes de regressão relacionados forem executados quando necessário.

---

## 10. Evidências

Durante a execução dos testes deverão ser registradas evidências suficientes para demonstrar o resultado obtido.

As evidências podem incluir:

* Capturas de tela;
* Vídeos;
* Mensagens de erro;
* Dados utilizados no teste;
* Resultado obtido;
* Resultado esperado;
* Logs, quando necessários;
* Referência ao caso de teste correspondente.

Cada defeito identificado deverá estar relacionado ao respectivo caso de teste sempre que possível.

---

## 11. Resultado esperado do levantamento

O levantamento inicial fornece a base para a próxima etapa do processo de QA: a elaboração e execução da matriz de testes.

A partir deste levantamento serão definidos:

1. Casos de teste;
2. Prioridades;
3. Dados de teste;
4. Resultados esperados;
5. Evidências necessárias;
6. Registro de bugs;
7. Retestes;
8. Testes de regressão;
9. Critérios de aprovação.

A matriz de testes deverá ser mantida atualizada durante o desenvolvimento e utilizada como referência para acompanhar a qualidade das funcionalidades implementadas.

---

## 12. Observação

Este documento representa o **levantamento inicial de QA** e poderá ser atualizado conforme novos requisitos, alterações de escopo ou novos riscos sejam identificados durante o desenvolvimento do projeto.
