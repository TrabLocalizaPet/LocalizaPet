# Projeto Pets — contexto para o Claude Code

## O que é

Trabalho prático da disciplina GPMS (TCC00363) — Gerência de Projeto e
Manutenção de Software. Aplicação de adoção de pets.

**O processo vale tanto quanto o produto.** A nota considera planejamento,
estimativas, gerência de riscos, controle de versão e documentação — não só
o código funcionando. Quando houver escolha entre uma solução rápida e uma
que gera artefato ou histórico defensável, prefira a segunda e explique o
porquê.

O repositório é **público** no GitHub, sob licença MIT.

## Infraestrutura

Três serviços, um único deploy. Tudo em plano gratuito.

| Camada | Serviço | Observação |
|---|---|---|
| Aplicação (páginas + API) | Vercel, plano Hobby | região `gru1` (São Paulo) |
| Banco | Supabase Postgres | connection string do **pooler**, porta 6543 |
| Imagens | Cloudflare R2 | upload direto do navegador, via URL assinada |
| Versionamento e CI | GitHub | preview automático por pull request |

Não há servidor separado para a API. As Route Handlers em `src/app/api/`
viram funções serverless na Vercel, no mesmo domínio das páginas. Por isso o
front usa caminhos relativos (`fetch("/api/animais")`) e não há CORS entre
eles.

**Não sugira** Docker, Dockerfile, `docker-compose`, GitHub Actions para
deploy, Fly.io, Koyeb ou Render. A escolha da Vercel foi deliberada e está
registrada como decisão técnica.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Postgres **com PostGIS** acessado pelo driver `pg` — **sem ORM**, por
  decisão do grupo. A posição é `GEOGRAPHY(POINT, 4326)` e a busca por raio
  usa `ST_DWithin` sobre índice GIST
- `zod` para validação de entrada nas rotas
- `@aws-sdk/client-s3` apontando para o endpoint do R2
- CSS puro em `src/app/globals.css` — sem Tailwind, sem biblioteca de UI
- Leaflet + OpenStreetMap para o mapa, e Nominatim para endereco a partir
  da coordenada. **Nao sugira Google Maps**: exige cartao de credito mesmo
  na cota gratuita, o que conflita com a restricao de custo zero.
- Notificacoes ficam gravadas na tabela `notificacoes` e aparecem numa
  caixa dentro do app. Sem email nem push — decisao do grupo.

## Organização

| Caminho | Responsabilidade |
|---|---|
| `src/app/api/` | endpoints: validam entrada, chamam query, devolvem JSON |
| `src/queries/` | **todo** o SQL, com retorno tipado |
| `src/lib/db.ts` | pool do Postgres (singleton) |
| `src/lib/r2.ts` | cliente do R2 e geração de URL assinada |
| `src/types/` | tipos do domínio, compartilhados entre front e API |
| `migrations/` | schema versionado em SQL |
| `scripts/migrate.ts` | runner que aplica migrations pendentes |
| `scripts/seed.ts` | dados de teste, inclusive o catálogo de características |
| `docs/` | requisitos, regras, modelo de dados, arquitetura e features |

## Regras

- **SQL só em `src/queries/`.** Route handler não escreve query. Cada função
  declara o próprio tipo de retorno — é o que substitui o ORM na tipagem.
- **Nunca edite uma migration já commitada.** Crie a próxima na sequência
  (`002_`, `003_`…). Alterar uma antiga quebra o banco de quem já aplicou.
- **Nunca altere o schema direto no painel do Supabase.** Toda mudança passa
  por migration, senão o schema deixa de ser reproduzível.
- **Nenhuma credencial no código.** O repositório é público. Só o
  `.env.example` vai para o Git, com os valores vazios.
- Use sempre a connection string do **pooler**. A direta funciona em
  desenvolvimento e derruba conexões sob carga.
- Mensagens de commit em português, no imperativo ("adiciona filtro por
  espécie", não "adicionado").
- Código e comentários em português. Nomes de coluna e variável sem acento.

## Escopo e ordem

O MVP entrega os requisitos de prioridade `M` do `docs/02-requisitos.md`, em
oito branches: estrutura → schema → autenticação → mapa → publicação →
listagem → busca por raio → catálogo. Uma branch por vez, commits pequenos
na ordem `schema → query → rota → interface`.

**O provedor de autenticação ainda não foi escolhido pelo grupo.** Não
decida por conta própria — trava a branch de autenticação.

## Fluxo de trabalho

Branch por funcionalidade → pull request → preview automático da Vercel →
revisão de outra pessoa do grupo → merge na `main`.

Toda tarefa tem issue no GitHub, com horas previstas registradas. As horas
realizadas são preenchidas no fechamento. Esse registro alimenta o burndown
e o EVM exigidos pela disciplina, então não pode ser deixado para depois.

Mudanças de schema são coordenadas pelo Responsável por Configuração — duas
pessoas criando a migration `002_` ao mesmo tempo gera conflito chato.

## Cuidados do ambiente serverless

Cada função é isolada e efêmera. Não guarde estado em memória entre
requisições (variável global, cache local, contador) — vai funcionar em
desenvolvimento e falhar em produção de forma intermitente. Estado vai para
o banco.

Migrations não rodam sozinhas no deploy. São executadas manualmente com
`npm run migrate`.

## Verificação

A rota `/` é um painel que testa Postgres, schema e R2 em separado. Antes de
investigar qualquer bug de aplicação, abra essa tela — ela diz qual peça
está fora.

O README tem a tabela de sintoma → causa provável.
