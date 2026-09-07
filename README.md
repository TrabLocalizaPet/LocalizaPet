# LocalizaPet

Cadastro público de animais perdidos, encontrados e disponíveis para adoção,
organizado por localização geográfica.

> **Fase atual: decisões.** O repositório contém apenas documentação. Não há
> código, schema aplicado nem serviço provisionado. A implementação começa
> quando estes documentos fecharem.
>
> Enquanto isso, **estes documentos são a fonte da verdade**, e o schema será
> derivado deles.

## Documentação

| Documento | Conteúdo |
|---|---|
| [01 — Visão do produto](docs/01-visao-produto.md) | Problema, objetivo, escopo, atores, restrições |
| [02 — Requisitos](docs/02-requisitos.md) | RF e RNF numerados, com prioridade e rastreabilidade |
| [03 — Regras de negócio](docs/03-regras-negocio.md) | RN numeradas, com o ponto onde cada uma será garantida |
| [04 — Modelo de dados](docs/04-modelo-dados.md) | DER, decisões de modelagem, dicionário de dados |
| [05 — Arquitetura](docs/05-arquitetura.md) | Vercel, Supabase e Cloudflare R2: decisões técnicas e consequências |
| [06 — Versionamento](docs/06-versionamento.md) | Branches, commits, pull request e registro de horas |

## Convenções

**Identificadores.** `RF-nn` requisito funcional · `RNF-nn` requisito não
funcional · `RN-nn` regra de negócio · `DT-nn` decisão técnica · `DP-nn`
decisão pendente.

**Decisão registrada não se rediscute** sem uma nova decisão que a substitua
explicitamente. `DP-nn` é o que o grupo ainda não escolheu — e só isso.

Identificador **nunca é reaproveitado**. Requisito removido é marcado como
cancelado, não apagado — senão a rastreabilidade quebra entre versões do
documento.

**Rastreabilidade.** Todo requisito aponta as regras que o governam, e toda
regra aponta onde será garantida — um `CHECK`, uma validação de entrada, uma
transação.

**Acompanhamento de execução não fica aqui.** Fica nas issues do GitHub, com
horas previstas e realizadas, que é o que alimenta o burndown e o EVM da
disciplina. Documento de requisito que também tenta ser quadro de tarefas
desatualiza nos dois papéis.

## Como contribuir

Branch por issue, commit em português no imperativo, pull request revisado
por outra pessoa do grupo. O procedimento completo está em
[06 — Versionamento](docs/06-versionamento.md).

Nenhuma credencial entra no repositório — ele é público.

## Decisões técnicas registradas

| ID | Decisão |
|---|---|
| [DT-01](docs/05-arquitetura.md#dt-01--vercel-para-aplicação-e-api) | Vercel para aplicação e API, região `gru1` |
| [DT-02](docs/05-arquitetura.md#dt-02--supabase-postgres-com-postgis) | Supabase Postgres com PostGIS, via pooler |
| [DT-03](docs/05-arquitetura.md#dt-03--cloudflare-r2-para-as-fotos) | Cloudflare R2 para as fotos, upload direto |
| [DT-04](docs/05-arquitetura.md#dt-04--leaflet--openstreetmap-não-google-maps) | Leaflet + OpenStreetMap, não Google Maps |
| [DT-05](docs/05-arquitetura.md#dt-05--notificação-gravada-no-banco-não-enviada) | Notificação gravada no banco, sem e-mail nem push |

## Decisões pendentes em aberto

| ID | Assunto | Bloqueia |
|---|---|---|
| [DP-01](docs/04-modelo-dados.md#decisões-pendentes) | `atualizado_em` sem trigger | — |