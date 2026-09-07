# 07 — Interface

O desenho das telas vive no Figma:
<https://www.figma.com/design/5t4x7xx4jnSD8VylzqSIvm/LocalizaPet>
(`fileKey` `5t4x7xx4jnSD8VylzqSIvm`, página `0:1`).

**O Figma é a fonte da verdade da interface**, como o `04 — Modelo de dados`
é do schema. Divergência entre tela e desenho é defeito da tela, não do
desenho — a menos que registrada aqui como exceção.

---

## Regra fundamental: mobile primeiro

**O Figma tem apenas o layout mobile**, 390×844. Não existe desenho de
desktop.

Disso decorre a regra que vale para toda tela nova:

> Escreva o layout para 390 px de largura. O desktop é adaptação posterior,
> feita com `min-width`, e **nunca** o contrário.

Escrever para desktop e "espremer" depois inverte o problema: o resultado é
uma tela que funciona onde ninguém desenhou e falha onde o desenho existe. O
usuário do produto está no celular, na rua, tentando reconhecer um animal.

Onde o desktop não tem desenho, a decisão é do grupo e fica registrada aqui.
Até agora:

| Elemento | Mobile (do Figma) | Desktop (decidido aqui) |
|---|---|---|
| Navegação | barra de abas inferior | cabeçalho fixo no topo |
| Listagem | uma coluna | grade a partir de `48rem` |
| Largura do conteúdo | 100% | limitada, centralizada |

---

## Fichas técnicas (design tokens)

Extraídos das variáveis do próprio arquivo, não estimados da imagem.

### Cor

| Ficha | Valor | Onde aparece |
|---|---|---|
| `primary` | `#f68b1e` | botões, abas ativas, pino de encontrado |
| `secondary` | `#f95c7e` | botão de curtir, destaques afetivos |
| `creme` | `#fff3e0` | fundo do botão de recusar, áreas suaves |
| `escura` | `#332430` | texto de marca |
| `foreground` | `#020618` | texto |
| `background` | `#ffffff` | fundo |
| `border` | `#e2e8f0` | bordas |
| `destructive` | `#e7000b` | erro, pino de perdido |

Cores dos pinos e etiquetas por tipo de anúncio (RF-12): perdido
`destructive`, encontrado `primary`, adoção `#2e7d32`. **Cor nunca aparece
sozinha** — sempre acompanhada de rótulo ou inicial, porque perdido e adoção
são os dois extremos do produto e vermelho/verde é a confusão de cor mais
comum.

### Tipografia

Duas famílias: **Inter** no corpo, **Mitr** nos títulos.

| Ficha | Tamanho | Entrelinha |
|---|---|---|
| `xs` | 12 | 16 |
| `sm` | 14 | 20 |
| `base` | 16 | 24 |
| `xl` | 20 | 28 |
| `2xl` | 24 | 32 |

Pesos: 400 normal, 500 média, 600 semibold, 700 bold.

### Espaçamento e forma

Escala de espaçamento em múltiplos de 4 (`2, 8, 12, 24, 32, 40`).
Raio padrão **8 px**. Sombra `xs`: `0 1px 2px #0000000D`.

---

## Assets

Exportados do Figma para `public/`, não recriados à mão.

| Caminho | Origem no Figma |
|---|---|
| `public/marca/logo.svg` | logotipo da Splash Screen |
| `public/marca/logo.png` | mesma marca, para onde SVG não serve |

As ilustrações do desenho (`cat-and-dog/rafiki`, `dog-high-five/amico`) são
da biblioteca **Storyset**, que exige atribuição. Entram quando as telas que
as usam forem construídas.

> **Ao implementar.** Ícone, ilustração e logotipo saem do Figma pela
> exportação. Substituir por emoji ou por um SVG desenhado na mão descarta o
> trabalho de design e produz uma tela que não é a que foi aprovada.

---

## Componentização

**Tela não escreve estilo.** Toda tela é composição de componentes de
`src/components/`. Um utilitário de Tailwind repetido em três telas é um
componente que falta.

O Figma já nomeia os seus: `Button`, `Input Group`. Os demais saem da
repetição observada nas telas.

| Componente | Papel |
|---|---|
| `Botao` | ação primária, secundária e circular |
| `Campo` | rótulo, entrada e mensagem de erro |
| `Etiqueta` | tipo de anúncio e características |
| `CartaoDeAnuncio` | item da listagem |
| `Navegacao` | abas no celular, cabeçalho no desktop |
| `Escolha` | opção de lista com título e apoio |

---

## Telas desenhadas

| Tela | Estado |
|---|---|
| Splash | não implementada |
| Login | `/entrar` |
| Cadastro de usuário, passo a passo | `/cadastro`, hoje em formulário único |
| "O que te trouxe aqui?" | dentro de `/publicar` |
| Cadastro do pet, passo a passo | `/publicar`, hoje em formulário único |
| Permissão de localização | não implementada |
| Home com abas e busca | `/` |
| Detalhe do pet | `/animais/[id]` |
| Perfil | `/perfil` |

### Divergências conhecidas

Registradas para não parecerem esquecimento:

| O Figma pede | Situação |
|---|---|
| Fotos dos animais | F-09, incremento 2 |
| Etiquetas de características | F-10, incremento 2 |
| Rastro de avistamentos | F-13, incremento 3 |
| Barra de mensagens na navegação | fora do escopo (DT-05) |
| Campo de **raça** | sem coluna no schema; decisão do grupo |
| **Data de nascimento** no cadastro | sem coluna no schema; decisão do grupo |
| Espécie **Ave** | fora, por decisão do grupo |
| Cadastro em vários passos | hoje formulário único |
| Mapa do Google no detalhe | Leaflet + OSM, por DT-04 |

---

## Documentos relacionados

- [02 — Requisitos](02-requisitos.md) — RNF-11
- [05 — Arquitetura](05-arquitetura.md) — DT-04 (mapa), DT-08 (Tailwind)
