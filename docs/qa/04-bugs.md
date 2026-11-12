# Registro de Bugs — LocalizaPet

Defeitos encontrados durante a execução dos testes, no formato definido em
[02 — Processo de QA](02-processo-de-qa.md#12-etapa-8--registro-de-bugs).

---

## Rodada 1 — Teste exploratório dos fluxos do usuário

| Campo | Valor |
|---|---|
| Data | 11/11/2026 |
| Branch | `fix/fluxos-do-usuario` (contém `fix/correcoes-da-revisao-geral`, `feat/alerta-de-fuga` e `feat/geolocalizacao-do-alerta`) |
| Ambiente | `npm run dev` em `localhost:3000`, banco `localizapet-dev` (Supabase), bucket R2 de desenvolvimento |
| Navegador | Chrome, área de 390 × 844 px (layout mobile do Figma) |
| Diagnóstico | `/diagnostico` com Postgres, Schema e R2 em ✓ antes de começar |

### Cenários executados

| # | Persona | Caminho percorrido | Resultado |
|---|---|---|---|
| 1 | Perdeu o pet | cadastro → "Perdi meu pet" → Publicar → "Meu pet acabou de fugir" → alerta publicado | Publica, mas cai na lista em vez do alerta (BUG-003) e o anúncio sai sem contato (BUG-001) |
| 2 | Achou um pet | Publicar → "Achei um pet perdido" → passos → foto → local → publicado | Publica com foto no R2; textos falam com o dono, não com quem achou (BUG-005) |
| 3 | Quer adotar | Início → atalho "Adoção" → detalhe → telefone | Funciona |
| 4 | Visitante | "Entrar sem cadastro" → mapa → pino → detalhe → Publicar → login | Login devolve para a lista, não para o Publicar (BUG-004) |
| 5 | Conta | sair → senha errada → senha certa; ajustes; notificações | Funciona; problemas de texto (BUG-006, BUG-007) |

### Confirmado funcionando

- Idade acima de 33 anos e 3 meses é avisada no próprio passo (CT-70)
- Senha errada mostra "E-mail ou senha incorretos." em português (CT-42)
- Filtro por adoção, pino do mapa levando ao detalhe, sair da conta
- Upload de foto direto ao R2 (CT-08)
- Sem erro no console do navegador durante toda a rodada

---

## Bugs

### BUG-001 — Anúncio publicado sem nenhuma forma de contato

| Campo | Valor |
|---|---|
| Severidade | Crítica |
| Prioridade | Alta |
| Requisito | RF-20, RF-21, RN-24 |
| Caso de teste | CT-43, CT-46 |
| Status | Corrigido — correção aprovada no reteste |
| Correção | `164eb73` |

**Passos para reprodução**
1. Criar conta informando telefone
2. Publicar um alerta de fuga
3. Abrir o anúncio

**Resultado esperado:** quem publica sabe se o telefone vai aparecer e
consegue liberá-lo na hora, antes de publicar.

**Resultado obtido:** o anúncio mostra "Esta pessoa preferiu nao exibir o
telefone". O telefone nasce oculto (RN-24, correto), mas nenhum passo do
cadastro ou da publicação pergunta isso — a opção existe só nos ajustes do
perfil, atrás da engrenagem. Quem acha o pet não tem como avisar o dono.

---

### BUG-002 — Servidor cai quando o banco encerra uma conexão ociosa

| Campo | Valor |
|---|---|
| Severidade | Alta |
| Prioridade | Alta |
| Requisito | RNF-06 |
| Status | Corrigido — correção aprovada no reteste |
| Correção | `68cd5dc` |

**Passos para reprodução**
1. Deixar o `npm run dev` rodando com conexões abertas no pool
2. Reiniciar o banco (pausar e restaurar o projeto no Supabase)

**Resultado esperado:** a conexão perdida é descartada e a próxima consulta
abre outra.

**Resultado obtido:** `uncaughtException: terminating connection due to
administrator command`, quatro vezes no log. O `Pool` do `pg` emite `error`
para cliente ocioso, e sem `pool.on("error")` o Node trata como exceção não
capturada — na Vercel isso derruba a função.

---

### BUG-003 — Resposta de "O que te trouxe aqui?" é ignorada

| Campo | Valor |
|---|---|
| Severidade | Média |
| Prioridade | Alta |
| Status | Corrigido — correção aprovada no reteste |
| Correção | `1908fa6` |

**Passos para reprodução**
1. Criar conta
2. Em "O que te trouxe aqui?", escolher "Perdi meu pet"

**Resultado esperado:** quem perdeu o pet vai direto ao alerta de fuga; quem
achou ou quer doar vai à publicação.

**Resultado obtido:** vai para a lista geral de anúncios. Só "Quero adotar"
tem destino próprio.

---

### BUG-004 — Login não devolve para onde a pessoa estava

| Campo | Valor |
|---|---|
| Severidade | Média |
| Prioridade | Alta |
| Requisito | RF-19 |
| Status | Corrigido — correção aprovada no reteste |
| Correção | `c81092d` |

**Passos para reprodução**
1. Sem sessão, tocar em Publicar
2. Na tela de login, entrar com credenciais válidas

**Resultado esperado:** voltar ao `/publicar`.

**Resultado obtido:** vai para `/animais`; a pessoa precisa achar o Publicar
de novo.

---

### BUG-005 — Publicação de "encontrado" com textos de quem é dono

| Campo | Valor |
|---|---|
| Severidade | Baixa |
| Prioridade | Média |
| Requisito | RF-02, RN-04 |
| Caso de teste | CT-03 |
| Status | Corrigido — correção aprovada no reteste |
| Correção | `1368afe` |

**Resultado obtido:** com "Achei um pet perdido" escolhido, o passo do nome
pergunta "Qual o nome do pet?" sem dizer que é opcional, o do local pergunta
"Onde o pet foi visto pela ultima vez?", e o fim diz "Agora voce e seu amigo
tem acesso a todas as funcoes do aplicativo".

**Resultado esperado:** textos de quem encontrou — nome opcional, "onde voce
encontrou", e um fim que diga que o anúncio já está no ar.

---

### BUG-006 — Termos internos aparecendo na interface

| Campo | Valor |
|---|---|
| Severidade | Baixa |
| Prioridade | Média |
| Status | Corrigido — correção aprovada no reteste |
| Correção | `288c019` |

**Resultado obtido:** nos ajustes do perfil, "nem na resposta da API. Nasce
desligado (RN-24)."; no detalhe do próprio anúncio, "(RN-09)".

**Resultado esperado:** texto para o usuário, sem código de regra nem termo
técnico.

---

### BUG-007 — Caixa de notificações vazia com cara de erro

| Campo | Valor |
|---|---|
| Severidade | Baixa |
| Prioridade | Baixa |
| Requisito | RF-25 |
| Caso de teste | CT-54 |
| Status | Corrigido — correção aprovada no reteste |
| Correção | `e3e077e` |

**Resultado obtido:** a caixa vazia usa o mesmo aviso com borda vermelha das
mensagens de erro.

**Resultado esperado:** estado vazio neutro.

> O texto também manda a pessoa monitorar uma área, mas o cadastro de área
> (RF-23) ainda não existe. Isso é funcionalidade pendente, não defeito —
> ver "Fora desta rodada".

---

### BUG-008 — Tela de login com rolagem horizontal

| Campo | Valor |
|---|---|
| Severidade | Baixa |
| Prioridade | Baixa |
| Requisito | RNF-11 |
| Status | Corrigido — correção aprovada no reteste |
| Correção | `7ba1772` |

**Passos para reprodução:** abrir `/entrar` com 390 px de largura.

**Resultado obtido:** a página tem 399 px de largura rolável; a ilustração
sangra com `-mx-6` sem o pai cortar o excesso.

**Resultado esperado:** nenhuma rolagem horizontal.

---

### BUG-009 — Alerta mostra coordenada crua e não mostra a hora do sumiço

| Campo | Valor |
|---|---|
| Severidade | Baixa |
| Prioridade | Baixa |
| Requisito | RF-07, RN-12 |
| Status | Aberto — fica para outra issue |

**Resultado obtido:** no `/alerta`, "Local marcado em -22.90437, -43.12151";
no detalhe, "Ultima vez visto em · hoje", sem endereço e sem a hora.

---

## Reteste — 11/11/2026

Cada correção foi validada logo depois do commit, no mesmo ambiente da
rodada, e ao fim todos os cenários foram executados de novo como
regressão.

| Bug | Como foi validado | Resultado |
|---|---|---|
| BUG-001 | Alerta publicado com o interruptor ligado no próprio formulário; o detalhe passou a ter o link `tel:` do autor | Aprovado |
| BUG-002 | Evento `error` forçado no pool: sem a correção o processo cai com stack trace; com ela, registra e a consulta seguinte responde | Aprovado |
| BUG-003 | Conta nova escolhendo "Perdi meu pet" abre o `/alerta`; `/publicar?tipo=encontrado` e `?tipo=adocao` começam no nome; valor inválido é ignorado | Aprovado |
| BUG-004 | Visitante em `/publicar` → `/entrar?de=%2Fpublicar` → login → `/publicar`. `?de=//exemplo.com` cai em `/animais` | Aprovado |
| BUG-005 | Fluxo de encontrado até publicar: "Sabe o nome do pet?", "Onde voce encontrou o pet?" e fim específico do tipo | Aprovado |
| BUG-006 | Detalhe e ajustes sem "RN-" nem "API" no texto | Aprovado |
| BUG-007 | Caixa vazia sem barra colorida; aviso de erro do login continua vermelho | Aprovado |
| BUG-008 | `/entrar` com 390 px de largura rolável em 390 px de tela (antes 399) | Aprovado |

**Regressão:** Home (13 anúncios), filtro de adoção, mapa (13 pinos), detalhe
com telefone, login com volta, notificações e perfil — tudo como antes.
`tsc --noEmit`, `eslint` e `next build` sem erros.

**Pendente de conferência visual:** o aviso de contato (BUG-001) foi validado
por comportamento; a captura de tela do navegador falhou durante o reteste.

### Dados de teste deixados no banco de desenvolvimento

Três contas `teste.fluxoN@localizapet.test` e os anúncios "Teste Fuga",
"Teste Contato" e dois gatos "Sem nome" (encontrado).

## Fora desta rodada

Funcionalidades que os testes mostraram ausentes. Não são defeito do que
existe — são requisitos ainda não entregues, e cada um merece issue própria.

| Requisito | Prioridade | Situação |
|---|---|---|
| RF-11 — Busca por raio | M | A aba "Buscar" abre o mapa; não há raio |
| RF-17 — Registrar avistamento | S | Sem botão "vi este pet" no detalhe |
| RF-23 — Cadastrar área monitorada | S | Sem tela; a caixa de notificações depende dela |
| Acentuação da interface | — | Toda a interface está sem acento ("Adocao", "voce"). Decisão do grupo |
