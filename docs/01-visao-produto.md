# 01 — Visão do produto

A aplicação chama-se **LocalizaPet**.

## Problema

Quando um animal se perde, a busca hoje se espalha por grupos de WhatsApp e
posts de rede social. O conteúdo some no fluxo, não tem estrutura e não é
pesquisável por região. Quem encontra um animal na rua enfrenta o problema
espelhado: não sabe onde publicar para que o tutor veja.

As duas pontas existem ao mesmo tempo, no mesmo bairro, e não se encontram.

## Objetivo

O **LocalizaPet** é um cadastro público de animais perdidos, encontrados e
disponíveis para adoção, organizado por **localização geográfica**, em que a
busca por proximidade é a operação central.

## Escopo

### Dentro do escopo

- Publicação de anúncio nos três fluxos: perdido, encontrado, adoção
- Marcação do local em mapa e busca por raio
- Registro de avistamentos posteriores, formando um rastro no mapa
- Fotos do animal
- Características do animal, selecionadas de um catálogo mantido pelo administrador
- Áreas monitoradas e notificações dentro do próprio sistema

### Fora do escopo

| Item | Motivo |
|---|---|
| E-mail e push | Decisão do grupo: notificação vive na tabela `notificacoes` e aparece numa caixa dentro do app |
| Pagamento e doação | Não faz parte do problema escolhido |
| Chat entre usuários | Contato acontece pelo telefone do perfil, quando público (ver [RN-04](03-regras-negocio.md)) |
| App nativo | O produto é web responsivo |
| Match automático por imagem | Fora do prazo da disciplina; o tipo `possivel_match` em `notificacoes` deixa a porta aberta |
| Google Maps | Exige cartão de crédito mesmo na cota gratuita, o que conflita com a restrição de custo zero. Usamos Leaflet + OpenStreetMap |

## Atores

| Ator | Descrição |
|---|---|
| **Visitante** | Navega e busca anúncios sem se cadastrar |
| **Tutor** | Perdeu o animal e publica anúncio do tipo `perdido` |
| **Localizador** | Encontrou um animal e publica anúncio do tipo `encontrado` |
| **Doador** | Disponibiliza animal para adoção, anúncio do tipo `adocao` |
| **Interessado** | Procura animal para adotar |
| **Administrador** | Mantém o catálogo de características |

**Observação de modelagem.** Os cinco primeiros papéis são **situacionais**,
não cargos: a mesma pessoa é Tutor num anúncio e Localizador em outro. Por
isso eles não existem como coluna — são inferidos do `tipo_anuncio`
([RN-01](03-regras-negocio.md)).

O **Administrador** é diferente: é atributo persistente do perfil
([RN-33](03-regras-negocio.md)). Ele cadastra as características que ficam
disponíveis, e quem publica anúncio apenas seleciona entre elas
([RN-20](03-regras-negocio.md)). Isso mantém o vocabulário controlado — sem
o catálogo, "castrado", "Castrado" e "ja castrou" virariam três valores
distintos e o filtro por característica deixaria de funcionar.

O schema prevê isso na coluna `perfis.papel` — ver
[04 — Modelo de dados](04-modelo-dados.md#perfispapel-como-coluna-com-check).

## Restrições do projeto

| Restrição | Origem |
|---|---|
| Custo zero de infraestrutura | Disciplina — todos os serviços em plano gratuito |
| Repositório público, licença MIT | Exigência da disciplina |
| Schema só por migration | Nenhuma alteração pelo painel do Supabase, para o schema seguir reproduzível |
| Deploy único na Vercel | Páginas e API no mesmo domínio, região `gru1` |

## Infraestrutura

Três serviços, todos em plano gratuito:

| Camada | Serviço |
|---|---|
| Aplicação (páginas + API) | **Vercel**, plano Hobby, região `gru1` |
| Banco de dados | **Supabase** Postgres com PostGIS |
| Imagens | **Cloudflare R2** |
| Versionamento e CI | **GitHub**, repositório público |

As justificativas de cada escolha, as alternativas descartadas e as
consequências estão em [05 — Arquitetura](05-arquitetura.md).

## Documentos relacionados

- [02 — Requisitos](02-requisitos.md)
- [03 — Regras de negócio](03-regras-negocio.md)
- [04 — Modelo de dados](04-modelo-dados.md)
- [05 — Arquitetura e infraestrutura](05-arquitetura.md)
