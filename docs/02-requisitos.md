# 02 — Requisitos

Prioridade em MoSCoW: **M** obrigatório · **S** importante · **C** desejável
· **W** fora desta versão

Cada requisito aponta as regras de negócio que o governam. O acompanhamento
de execução fica nas issues do GitHub, não aqui.

---

## Requisitos funcionais

### Publicação de anúncio

| ID | Requisito | Prio | Regras |
|---|---|---|---|
| **RF-01** | Publicar anúncio de animal perdido, informando espécie e local no mapa | M | RN-02, RN-03 |
| **RF-02** | Publicar anúncio de animal encontrado, sem exigir nome | M | RN-04 |
| **RF-03** | Publicar anúncio de animal para adoção, sem exigir local | M | RN-03 |
| **RF-04** | Marcar o local clicando no mapa | M | RN-11 |
| **RF-05** | Anexar até 6 fotos ao anúncio | S | RN-06 |
| **RF-06** | Selecionar características do animal entre as opções ativas do catálogo, sem digitar texto livre | S | RN-18, RN-20, RN-23 |
| **RF-07** | Preencher o endereço automaticamente a partir da coordenada | C | RN-17 |
| **RF-08** | Marcar o próprio anúncio como resolvido | S | RN-10 |

### Busca e visualização

| ID | Requisito | Prio | Regras |
|---|---|---|---|
| **RF-09** | Listar anúncios ativos, mais recentes primeiro | M | RN-09, RN-16 |
| **RF-10** | Filtrar anúncios por tipo | M | RN-02 |
| **RF-11** | Buscar anúncios dentro de um raio a partir de um ponto | M | RN-14, RN-15 |
| **RF-12** | Ver os anúncios como pinos no mapa, com cor por tipo | M | RN-02 |
| **RF-13** | Usar a localização do navegador como centro da busca | S | — |
| **RF-14** | Ver a distância até cada anúncio no resultado da busca | S | RN-16 |
| **RF-15** | Abrir a página de detalhe de um anúncio | M | — |
| **RF-16** | Filtrar por espécie, porte e características | C | RN-18, RN-20 |

### Avistamentos

| ID | Requisito | Prio | Regras |
|---|---|---|---|
| **RF-17** | Registrar que um animal foi visto em outro local | S | RN-12, RN-13 |
| **RF-18** | Ver o rastro de avistamentos de um animal no mapa | C | RN-12 |

### Cadastro e contato

| ID | Requisito | Prio | Regras |
|---|---|---|---|
| **RF-19** | Criar conta e autenticar | M | RN-01 |
| **RF-20** | Escolher se o telefone aparece nos anúncios | S | RN-24 |
| **RF-21** | Ver o contato do autor de um anúncio, respeitada a autorização | M | RN-24 |
| **RF-22** | Navegar e buscar sem estar autenticado | M | — |

### Monitoramento e notificações

| ID | Requisito | Prio | Regras |
|---|---|---|---|
| **RF-23** | Cadastrar áreas de interesse com centro e raio | S | RN-27, RN-29 |
| **RF-24** | Receber notificação quando surgir anúncio na área monitorada | S | RN-27, RN-28 |
| **RF-25** | Ver a caixa de notificações dentro do app | S | RN-30 |
| **RF-26** | Marcar notificação como lida | C | — |

### Administração do catálogo

| ID | Requisito | Prio | Regras |
|---|---|---|---|
| **RF-27** | Cadastrar característica no catálogo, informando rótulo, grupo e espécie a que se aplica | M | RN-19, RN-21, RN-32 |
| **RF-28** | Editar rótulo, grupo e ordem de exibição de uma característica | S | RN-19, RN-32 |
| **RF-29** | Desativar característica sem excluí-la, preservando os anúncios que já a usam | M | RN-22, RN-23 |
| **RF-30** | Restringir a administração do catálogo ao administrador | M | RN-32, RN-33 |

> RF-27 a RF-30 dependem da coluna `perfis.papel` (RN-33). Sem ela não há
> como saber quem é administrador.

### Operação

| ID | Requisito | Prio | Regras |
|---|---|---|---|
| **RF-31** | Painel em `/` que testa Postgres, schema e R2 separadamente | M | — |
| **RF-32** | Aplicar migrations pendentes por linha de comando | M | RN-35 |
| **RF-33** | Popular o banco com dados de teste | C | — |

---

## Requisitos não funcionais

| ID | Requisito | Como é verificado |
|---|---|---|
| **RNF-01** | Custo zero de infraestrutura | Vercel Hobby, Supabase e R2 em plano gratuito |
| **RNF-02** | Nenhuma credencial no repositório | Repositório público; só `.env.example` versionado |
| **RNF-03** | Latência baixa no Brasil | Funções na região `gru1` (São Paulo), via `vercel.json` |
| **RNF-04** | Busca por raio não pode varrer a tabela | Índice GIST em `avistamentos.local`; `ST_DWithin` |
| **RNF-05** | Listagem sem N+1 | `LEFT JOIN LATERAL` para foto de capa e último avistamento |
| **RNF-06** | Suportar conexões limitadas do plano gratuito | Connection string do **pooler**; `max: 3` no pool |
| **RNF-07** | Nenhum estado em memória entre requisições | Ambiente serverless; estado vai para o banco |
| **RNF-08** | Toda entrada de API validada antes de chegar ao banco | Schemas `zod` nas Route Handlers |
| **RNF-09** | Schema reproduzível do zero | Migrations versionadas; alteração pelo painel do Supabase é proibida |
| **RNF-10** | Upload não passa pelo servidor | URL assinada; navegador envia direto ao R2 |
| **RNF-11** | Interface em português, responsiva | CSS puro, sem biblioteca de UI |
| **RNF-12** | Mapa sem exigir cartão de crédito | Leaflet + OpenStreetMap; Google Maps descartado |

---

## Distribuição por prioridade

| Prioridade | Quantidade |
|---|---|
| **M** obrigatório | 17 |
| **S** importante | 11 |
| **C** desejável | 5 |
| **Total** | **33** |

Dois requisitos concentram dependências e devem ser sequenciados primeiro:

- **RF-19 (autenticação)** destrava RF-20, RF-21 e, na prática, RF-30 — não
  há como identificar um administrador sem identificar um usuário.
- **RF-27 (cadastrar característica)** destrava RF-06 e RF-16: sem catálogo
  populado pela interface, o formulário de anúncio não tem o que oferecer.
