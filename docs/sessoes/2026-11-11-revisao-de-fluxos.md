# Sessão de 11/11/2026 — Revisão dos fluxos do usuário

Registro de uma sessão de trabalho com o Claude Code, para a retrospectiva da
rodada. Diz o que foi pedido, o que foi feito, o que travou e o que ficou
pendente. As horas não foram cronometradas — quem participou preenche.

| Campo | Valor |
|---|---|
| Participantes | Ricardo França, com o Claude Code (assistente de IA) |
| Branch | `fix/fluxos-do-usuario` |
| Issues tocadas | #16, #17, #31 (e levantamento para #28 a #32) |
| Horas realizadas | _preencher_ |

---

## 1. Linha do tempo

### 1.1 Levantamento das issues abertas

Pedido: resolver as issues abertas respeitando o padrão do projeto.

- As issues #28 a #32 são épicos que citam só códigos `PP-10`, `PP-15`…
  `PP-24`. **Esses códigos não existem no repositório** — vivem em outra
  ferramenta do grupo. Sem a descrição, o escopo ficaria inventado e as horas
  previstas do burndown/EVM perderiam sentido. Ficou pendente pedir a lista.
- #16 e #17 já estavam prontas em branches locais nunca enviadas, empilhadas
  sobre `fix/correcoes-da-revisao-geral` (15 commits de correção).
- A matriz de testes tinha 27 casos pendentes e três observações de bug
  (CT-10, CT-70/71, CT-72).
- Os três últimos commits da `main` estão no passado ("adicionada matriz de
  testes") e foram feitos direto nela — contra o `06-versionamento.md`.

### 1.2 Tentativa de push

- `git push` recusado com 403: o Git da máquina autentica como
  `ricardomeneses-js`, sem escrita na organização. A conta das issues é
  `RicardoMFranca`. **Nada foi enviado.**
- O `gh` não está instalado; PRs teriam de ser abertos pelo site.
- Definida a ordem de merge: `fix/correcoes-da-revisao-geral` → `feat/alerta-de-fuga`
  → `feat/geolocalizacao-do-alerta`, com PRs empilhados (cada um com base na
  branch anterior) e sem squash.
- Escritos os textos dos três PRs, primeiro detalhados e depois enxutos, a
  pedido.

### 1.3 Teste dos fluxos

Pedido: juntar as três branches numa nova e simular quem perdeu, quem achou,
quem quer adotar e outros casos.

- Como as branches já estavam empilhadas, `fix/fluxos-do-usuario` saiu da
  última, sem merge.
- O banco de desenvolvimento estava fora: o projeto do Supabase tinha sido
  **pausado por inatividade** (plano gratuito). O `/diagnostico` mostrou na
  hora qual peça estava fora. Ricardo restaurou o projeto pelo painel.
- O Chrome não aceitou redimensionar a janela; o layout de 390 px foi testado
  com o app dentro de um `iframe` de 390 × 844 na própria origem.
- Cinco cenários executados; nove bugs registrados em
  [`docs/qa/04-bugs.md`](../qa/04-bugs.md), mais três requisitos ausentes.

### 1.4 Correção e reteste

Uma correção por commit, cada uma validada logo em seguida:

| Commit | Bug | O que mudou |
|---|---|---|
| `cfc0764` | — | Registro de bugs da rodada |
| `68cd5dc` | BUG-002 | `pool.on("error")` no `src/lib/db.ts` |
| `c81092d` | BUG-004 | Login com `?de=` para voltar à tela de origem (`src/lib/destino.ts`) |
| `1908fa6` | BUG-003 | Resposta do cadastro leva ao alerta/publicação/adoção; `/publicar?tipo=` |
| `164eb73` | BUG-001 | `AvisoDeContato`: liga o telefone na hora de publicar |
| `1368afe` | BUG-005 | Textos da publicação de encontrado |
| `288c019` | BUG-006 | Tira "(RN-09)" e "API" dos textos da tela |
| `e3e077e` | BUG-007 | `Aviso` com tom neutro para o estado vazio |
| `7ba1772` | BUG-008 | `overflow-x-clip` no `/entrar` |
| `01449dd` | — | Resultado do reteste no registro de bugs |

Regressão completa ao fim, mais `tsc`, `eslint` e `next build` sem erros.

---

## 2. Decisões tomadas

| Decisão | Por quê |
|---|---|
| Não reescrever os commits da `main` fora do padrão | Reescrever histórico publicado quebra o clone de todo o grupo |
| Não inventar o escopo dos `PP-xx` | Escopo inventado gera hora prevista inventada no EVM |
| Manter o telefone oculto por padrão e perguntar na publicação | RN-24 é regra do grupo; o defeito era o fluxo nunca perguntar |
| `?de=` só aceita caminho interno | Evita que o login vire redirecionamento aberto para outro site |
| Busca por raio, avistamento e área monitorada ficaram fora | São requisitos novos, não defeitos; cada um pede issue com horas |
| BUG-009 ficou aberto | Depende do endereço por coordenada (Nominatim), que é outra entrega |

---

## 3. Para a retrospectiva

### O que funcionou

- O painel `/diagnostico` apontou o banco pausado em segundos
- Commits pequenos, um por bug, com o número do bug no corpo: cada correção
  pode ser revertida sozinha e rastreada até o registro
- O registro em `04-bugs.md` seguiu o formato que o processo de QA já previa

### O que atrapalhou

- **Trabalho só local:** três branches prontas ficaram sem push. Se a
  máquina falhasse, perdia-se a #16 e a #17 inteiras
- **Credencial errada no Git** impediu o push e não foi resolvida na sessão
- **Supabase pausado** derrubou o ambiente de desenvolvimento de todos
- **Tarefas descritas fora do repositório** (`PP-xx`) — a issue não basta
  para saber o que fazer
- **Commits direto na `main`**, no passado, contra o processo combinado
- Branch `fix/fluxos-do-usuario` acumula oito correções; pelo
  `06-versionamento.md` seria uma branch por issue

### Ações sugeridas

1. Corrigir a credencial do Git e enviar as quatro branches
2. Abrir uma issue para cada BUG desta rodada (ou uma issue "Rodada 1 de QA"
   ligada à #31), com horas previstas e realizadas
3. Copiar a descrição dos `PP-xx` para o corpo das issues #28 a #32
4. Abrir issues para RF-11 (busca por raio, prioridade M), RF-17 e RF-23
5. Combinar quem abre o painel do Supabase uma vez por semana, ou registrar
   o risco de pausa no registro de riscos
6. Lembrar o grupo do padrão de commit e do "ninguém commita na `main`"
7. Limpar os dados de teste do banco de desenvolvimento (ver `04-bugs.md`)
