# Processo de QA — LocalizaPet

## 1. Objetivo

Este documento define o processo de **Quality Assurance (QA)** utilizado no projeto **LocalizaPet**.

O objetivo do processo é estabelecer uma forma organizada de analisar requisitos, elaborar casos de teste, executar os testes, registrar evidências, identificar defeitos, validar correções e realizar testes de regressão.

O processo busca garantir que as funcionalidades desenvolvidas atendam aos requisitos e regras de negócio definidos para o sistema.

---

## 2. Escopo

O processo de QA será aplicado às funcionalidades previstas para o sistema LocalizaPet, sendo elas:

* Cadastro e gerenciamento de anúncios;
* Animais perdidos, encontrados e para adoção;
* Upload de fotos;
* Características dos animais;
* Geolocalização;
* Mapa;
* Busca e filtros;
* Registro de avistamentos;
* Cadastro e autenticação;
* Privacidade do telefone;
* Áreas monitoradas;
* Notificações;
* Gerenciamento do catálogo de características;
* Integridade dos dados;
* Migrações do banco de dados;
* Responsividade e usabilidade.

---

## 3. Responsabilidade de QA

A atividade de QA será responsável por:

* Analisar os requisitos e regras de negócio;
* Identificar cenários que precisam ser testados;
* Elaborar casos de teste;
* Definir prioridades;
* Preparar dados necessários para os testes;
* Executar os testes;
* Registrar evidências;
* Identificar e documentar defeitos;
* Validar as correções realizadas;
* Executar testes de regressão;
* Acompanhar a qualidade das funcionalidades;
* Apoiar a decisão de aprovação das funcionalidades.

---

## 4. Fluxo do processo de QA

O processo de QA seguirá o seguinte fluxo:

```text
Levantamento inicial
        ↓
Análise de requisitos
        ↓
Identificação de cenários
        ↓
Elaboração dos casos de teste
        ↓
Definição de prioridade
        ↓
Preparação dos dados
        ↓
Execução dos testes
        ↓
Registro das evidências
        ↓
Resultado aprovado?
      /     \
    SIM      NÃO
    ↓         ↓
Concluir    Registrar bug
              ↓
        Correção do bug
              ↓
            Reteste
              ↓
       Teste passou?
          /       \
        SIM        NÃO
         ↓          ↓
     Regressão   Novo ciclo
         ↓
      Aprovação
```

---

## 5. Etapa 1 — Análise dos requisitos

Antes da execução dos testes, os requisitos e regras de negócio devem ser analisados.

Para cada requisito, devem ser identificados:

* O comportamento esperado;
* Dados obrigatórios;
* Dados opcionais;
* Regras de validação;
* Valores mínimos e máximos;
* Cenários positivos;
* Cenários negativos;
* Dependências com outras funcionalidades;
* Possíveis riscos.

Quando necessário, o requisito deverá ser relacionado a um ou mais casos de teste.

---

## 6. Etapa 2 — Identificação dos cenários de teste

Após a análise dos requisitos, serão identificados os cenários que representam diferentes situações de utilização do sistema.

Serão considerados:

### Cenários positivos

Validam o comportamento esperado quando o usuário fornece dados válidos.

Exemplo:

> Criar um anúncio preenchendo corretamente todos os campos obrigatórios.

### Cenários negativos

Validam o comportamento do sistema diante de dados inválidos ou situações inesperadas.

Exemplo:

> Tentar criar um anúncio sem preencher um campo obrigatório.

### Cenários de limite

Validam os valores mínimos e máximos definidos pelas regras de negócio.

Exemplo:

> Testar o raio de pesquisa utilizando o menor e o maior valor permitido.

### Cenários de exceção

Validam situações como:

* Falha de conexão;
* Localização indisponível;
* Permissão de localização negada;
* Dados inválidos;
* Falha durante uma operação;
* Recursos indisponíveis.

---

## 7. Etapa 3 — Elaboração dos casos de teste

Cada cenário relevante deverá ser transformado em um caso de teste.

Os casos de teste deverão conter, no mínimo:

* Identificador;
* Requisito ou regra relacionada;
* Descrição do teste;
* Prioridade;
* Resultado esperado;
* Status;
* Evidência;
* Observação ou referência ao bug, quando aplicável.

Os casos serão mantidos na **Matriz de Testes de QA**.

---

## 8. Etapa 4 — Priorização dos testes

Os testes serão classificados conforme o impacto e o risco da funcionalidade.

### Crítica

Funcionalidades cuja falha pode comprometer diretamente o objetivo principal do sistema.

Exemplos:

* Geolocalização;
* Busca por raio;
* Localização dos anúncios;
* Registro de avistamentos;
* Integridade dos dados;
* Notificações relacionadas às áreas monitoradas.

### Alta

Funcionalidades importantes para o funcionamento do sistema.

Exemplos:

* Cadastro de anúncios;
* Upload de fotos;
* Busca;
* Filtros;
* Autenticação;
* Visualização no mapa;
* Privacidade do telefone.

### Média

Funcionalidades importantes, mas com menor impacto em caso de falha.

### Baixa

Funcionalidades ou cenários de menor impacto, executados após a validação das funcionalidades prioritárias.

---

## 9. Etapa 5 — Preparação dos dados de teste

Antes da execução, devem ser definidos os dados necessários para cada caso de teste.

Os dados podem incluir:

* Usuários;
* Anúncios;
* Animais;
* Localizações;
* Coordenadas;
* Fotos;
* Características;
* Áreas monitoradas;
* Dados válidos;
* Dados inválidos;
* Valores limites.

Os dados utilizados devem ser registrados quando forem importantes para reproduzir o resultado obtido.

---

## 10. Etapa 6 — Execução dos testes

Os casos de teste serão executados de acordo com a prioridade definida na matriz.

Durante a execução, o QA deverá comparar:

**Resultado esperado × Resultado obtido**

O caso poderá receber os seguintes status:

* **Pendente** — ainda não executado;
* **Aprovado** — comportamento conforme esperado;
* **Reprovado** — comportamento diferente do esperado;
* **Bloqueado** — não foi possível executar devido a uma dependência ou impedimento;
* **Em reteste** — aguardando nova execução após uma correção.

---

## 11. Etapa 7 — Registro das evidências

Cada teste executado deverá possuir evidência quando necessário para comprovar o resultado.

Podem ser utilizadas:

* Capturas de tela;
* Vídeos;
* Logs;
* Mensagens de erro;
* Dados utilizados;
* Resultado apresentado pelo sistema.

As evidências devem ser relacionadas ao identificador do caso de teste para facilitar a rastreabilidade.

---

## 12. Etapa 8 — Registro de bugs

Quando o resultado obtido for diferente do resultado esperado, deverá ser avaliado se existe um defeito.

Os bugs deverão ser registrados contendo, sempre que possível:

* Identificador;
* Título;
* Descrição;
* Passos para reprodução;
* Resultado esperado;
* Resultado obtido;
* Severidade;
* Prioridade;
* Ambiente;
* Evidência;
* Caso de teste relacionado;
* Status;
* Responsável pela correção.

### Exemplo de estrutura

```text
BUG-001

Título:
Busca por raio não retorna anúncio no limite permitido.

Passos para reprodução:
1. Acessar a busca.
2. Informar o raio permitido.
3. Realizar a pesquisa.

Resultado esperado:
O anúncio dentro do raio deve ser apresentado.

Resultado obtido:
O anúncio não é apresentado.

Severidade:
Alta.

Evidência:
[referência para captura de tela]

Caso de teste:
CT-XX
```

---

## 13. Severidade dos bugs

Os defeitos poderão ser classificados de acordo com seu impacto.

### Crítica

Impede o funcionamento de uma funcionalidade essencial ou compromete significativamente o sistema.

### Alta

Afeta uma funcionalidade importante e pode impedir o uso adequado do sistema.

### Média

Afeta parcialmente uma funcionalidade, mas existe possibilidade de continuar utilizando o sistema.

### Baixa

Possui baixo impacto funcional, visual ou de usabilidade.

---

## 14. Etapa 9 — Correção e reteste

Após a correção de um defeito, o caso de teste relacionado deverá ser executado novamente.

O objetivo do reteste é verificar se o problema identificado foi realmente corrigido.

O resultado deverá ser registrado como:

* Correção aprovada;
* Correção não aprovada;
* Correção parcialmente validada.

Caso o problema continue ocorrendo, o defeito deverá permanecer aberto e retornar para correção.

---

## 15. Etapa 10 — Testes de regressão

Após correções, devem ser realizados testes de regressão quando houver possibilidade de impacto em outras funcionalidades.

O objetivo é verificar se uma alteração realizada para corrigir um defeito não provocou novos problemas em funcionalidades que anteriormente estavam funcionando.

A regressão deverá priorizar:

* Funcionalidades diretamente relacionadas à alteração;
* Funcionalidades críticas;
* Integrações afetadas;
* Fluxos principais do sistema.

---

## 16. Testes específicos para geolocalização

Por ser uma área de risco identificada no levantamento inicial, a geolocalização deverá possuir atenção especial.

Devem ser considerados cenários como:

* Localização válida;
* Permissão de localização concedida;
* Permissão de localização negada;
* Localização indisponível;
* Coordenadas inválidas;
* Busca próxima ao limite do raio;
* Busca dentro do raio;
* Busca fora do raio;
* Exibição correta da distância;
* Posicionamento correto dos marcadores no mapa;
* Registro correto da localização de um avistamento.

---

## 17. Testes de responsividade e usabilidade

Além dos testes funcionais, deverão ser observados aspectos de uso da aplicação.

Serão avaliados:

* Adaptação da interface a diferentes tamanhos de tela;
* Organização dos elementos;
* Legibilidade;
* Facilidade de navegação;
* Clareza das mensagens;
* Comportamento de formulários;
* Interação com mapa e filtros;
* Facilidade para concluir os principais fluxos.

Problemas encontrados deverão ser registrados como defeitos quando comprometerem a utilização ou o comportamento esperado do sistema.

---

## 18. Rastreabilidade

Os testes deverão manter relação com os requisitos e regras de negócio correspondentes.

A rastreabilidade deverá permitir identificar:

```text
Requisito
   ↓
Caso de teste
   ↓
Execução
   ↓
Evidência
   ↓
Bug (quando houver)
   ↓
Reteste
   ↓
Regressão
```

Essa relação facilita o acompanhamento da cobertura dos testes e permite identificar quais requisitos ainda não foram validados.

---

## 19. Critérios para aprovação

Uma funcionalidade poderá ser considerada aprovada quando:

* Os casos de teste prioritários forem executados;
* Os resultados estiverem de acordo com os requisitos;
* As regras de negócio forem respeitadas;
* Os cenários negativos forem tratados adequadamente;
* Os valores limites apresentarem o comportamento esperado;
* Os defeitos críticos que impeçam o funcionamento forem corrigidos;
* As correções tenham sido retestadas;
* A regressão necessária tenha sido executada;
* As evidências estejam registradas.

---

## 20. Critérios de bloqueio

Um teste poderá ser considerado **bloqueado** quando não puder ser executado devido a uma dependência externa ou impedimento técnico.

Exemplos:

* Funcionalidade ainda não implementada;
* Ambiente indisponível;
* Banco de dados indisponível;
* Dependência externa indisponível;
* Erro que impeça a execução do fluxo;
* Dados necessários indisponíveis.

O motivo do bloqueio deverá ser registrado na matriz de testes.

---

## 21. Controle dos resultados

A matriz de testes será utilizada para acompanhar o andamento da execução.

Deverão ser acompanhados, no mínimo:

* Total de casos de teste;
* Casos pendentes;
* Casos aprovados;
* Casos reprovados;
* Casos bloqueados;
* Casos em reteste;
* Quantidade de bugs;
* Bugs por prioridade/severidade;
* Percentual de testes executados.

Essas informações permitirão acompanhar a evolução da qualidade do projeto.

---

## 22. Encerramento do ciclo de QA

Um ciclo de QA será encerrado quando os testes planejados para a entrega tiverem sido executados e os resultados analisados.

Antes do encerramento, deverão ser verificados:

* Casos críticos executados;
* Bugs críticos avaliados;
* Correções retestadas;
* Regressão realizada quando necessária;
* Evidências registradas;
* Resultados atualizados na matriz;
* Pendências documentadas.

O resultado final deverá indicar se a versão está:

* **Aprovada**;
* **Aprovada com ressalvas**;
* **Não aprovada**.

---

## 23. Artefatos do processo de QA

Os principais artefatos utilizados durante o processo serão:

| Artefato                     | Finalidade                                                   |
| ---------------------------- | ------------------------------------------------------------ |
| `01-levantamento-inicial.md` | Registrar o entendimento inicial do projeto, escopo e riscos |
| `02-processo-de-qa.md`       | Documentar o processo utilizado para garantia da qualidade   |
| `03-matriz-de-testes.xlsx`   | Registrar os casos de teste e seus resultados                |
| `04-bugs.md`                 | Registrar e acompanhar os defeitos encontrados               |
| Evidências                   | Comprovar os resultados das execuções                        |

---


---

## 24. Considerações finais

O processo definido neste documento tem como finalidade organizar as atividades de QA do projeto LocalizaPet, proporcionando maior controle sobre a qualidade das funcionalidades desenvolvidas.

A utilização conjunta do levantamento inicial, da matriz de testes, do registro de bugs e das evidências permite acompanhar o sistema desde a análise dos requisitos até a validação das correções.

O processo poderá ser atualizado conforme novos requisitos, alterações no escopo ou novos riscos sejam identificados durante o desenvolvimento do projeto.
