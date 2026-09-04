# Estudo de NestJS

Este repositório é um projeto de estudo para retomar a prática de desenvolvimento backend com Node.js e NestJS.

Estou usando este projeto para desenferrujar meus conhecimentos e reconstruir familiaridade com uma aplicação backend mais completa. Faz cerca de cinco anos que não trabalho em algo mais complexo, então a ideia aqui é avançar de forma incremental, revisitando conceitos, ferramentas e decisões comuns no desenvolvimento de APIs.

O projeto ainda está em construção. O código, as escolhas técnicas e a documentação devem evoluir junto com o aprendizado.

## Objetivos de estudo

- Revisar a organização modular do NestJS, incluindo a evolução para um "monolito modular" (módulos de domínio isolados sob `src/modules`, infra compartilhada isolada em `src/database` e `src/shared`, fronteiras entre módulos via barrel `index.ts`).
- Praticar controllers, services, DTOs e injeção de dependências.
- Implementar autenticação com JWT e autenticação de dois fatores (2FA/TOTP).
- Trabalhar com validação de dados recebidos pela API.
- Integrar uma aplicação NestJS com PostgreSQL.
- Usar Prisma ORM (schema, migrations e Prisma Client) para acesso a dados.
- Estudar idempotência em operações financeiras (módulo `budget`, com `Ledger`/`Balance` versionado e lock de idempotência via Redis) e experimentar `LISTEN`/`NOTIFY` do Postgres com SSE — em andamento.
- Recuperar familiaridade com testes, configuração e execução de aplicações backend.

## Tecnologias

- Node.js
- TypeScript
- NestJS
- PostgreSQL
- Redis (suporte ao estudo de idempotência)
- Docker e Docker Compose
- Prisma ORM (`@prisma/client`, driver adapter `@prisma/adapter-pg`)
- JSON Web Token (JWT) e Passport
- Autenticação de dois fatores (TOTP) com `otplib` e QR Code (`qrcode`)
- Swagger para documentação da API
- Jest e Supertest

## Estrutura atual

```text
src/
├── modules/
│   ├── auth/
│   │   ├── dto/
│   │   ├── guards/
│   │   ├── strategies/
│   │   ├── tests/
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── user.schema.ts
│   │   └── index.ts
│   ├── banks/
│   │   ├── dto/
│   │   ├── tests/
│   │   ├── banks.controller.ts
│   │   ├── banks.module.ts
│   │   ├── banks.service.ts
│   │   └── index.ts
│   ├── clock/
│   │   ├── dto/
│   │   ├── tests/
│   │   ├── clock.controller.ts
│   │   ├── clock.module.ts
│   │   ├── clock.service.ts
│   │   └── index.ts
│   └── budget/
│       ├── dto/
│       ├── types/
│       ├── budget.controller.ts
│       ├── budget.interceptor.ts   # interceptor de idempotência (Redis)
│       ├── budget.module.ts
│       └── budget.service.ts
├── database/
│   ├── database.module.ts
│   ├── prisma.service.ts
│   └── index.ts
├── shared/
│   ├── decorators/
│   │   ├── is-tax-id.decorator.ts
│   │   ├── user.decorator.ts
│   │   └── index.ts
│   └── redis/
│       ├── redis.module.ts
│       └── redis.service.ts
├── register-paths.ts
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts

prisma/
├── schema/
│   ├── schema.prisma   # generator + datasource
│   ├── user.prisma
│   ├── bank.prisma
│   ├── ledger.prisma
│   └── balance.prisma
└── migrations/
```

Cada módulo de domínio expõe só o que os outros precisam através do `index.ts` (barrel). Imports entre módulos usam aliases (`@auth`, `@banks`, `@clock`, `@database`, `@shared/decorators`, `@prisma`) configurados em `tsconfig.json`, no `moduleNameMapper` do Jest e em `src/register-paths.ts` (resolução em runtime pro build compilado).

## Pré-requisitos

- Node.js instalado.
- Yarn instalado.
- Docker e Docker Compose instalados, caso queira executar PostgreSQL e Redis em container.

## Configuração

Instale as dependências:

```bash
yarn install
```

Crie o arquivo `.env` na raiz do projeto. O arquivo `.env.example` pode ser usado como referência:

```env
APP_NAME=EstudoNest
DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/postgres
JWT_SECRET=uma-chave-secreta-para-desenvolvimento
```

O arquivo `.env` não deve ser versionado. Para ambientes reais, use uma chave JWT forte e mantenha os segredos fora do código-fonte.

## Banco de dados

Suba PostgreSQL e Redis com Docker Compose:

```bash
docker compose up -d
```

| Serviço | Porta | Configuração |
| --- | --- | --- |
| PostgreSQL | `5432` | usuário `myuser`, senha `mypassword`, banco `postgres` |
| Redis | `6379` | sem autenticação (uso local de estudo) |

Para interromper os containers:

```bash
docker compose down
```

## Executando o projeto

Modo de desenvolvimento com recarregamento automático:

```bash
yarn start:dev
```

Outros comandos disponíveis:

```bash
# execução normal
yarn start

# compilação
yarn build

# execução da versão compilada
yarn start:prod
```

A aplicação é iniciada, por padrão, na porta `3000`. Essa porta pode ser alterada pela variável `PORT`.

## Rotas atuais

As rotas de autenticação usam o prefixo `/api/v1/auth`. O fluxo de login é feito em duas etapas: `signin` retorna um token temporário (`twoFactorAuthToken`), que deve ser enviado como Bearer token nas rotas de 2FA.

| Método | Rota | Autenticação | Finalidade |
| --- | --- | --- | --- |
| `POST` | `/auth/signin` | — | Login com e-mail e senha. Retorna `twoFactorAuthToken` e o próximo passo (`MFA_SYNC` ou `MFA_VALIDATE`) |
| `POST` | `/auth/sync-app-authenticator` | Bearer `twoFactorAuthToken` | Gera segredo e QR Code para o usuário sincronizar o app authenticator (primeiro acesso) |
| `POST` | `/auth/verify-two-factor-authentication` | Bearer `twoFactorAuthToken` | Valida o código TOTP e retorna o `accessToken` final |

As rotas de instituições financeiras usam o prefixo `/api/v1/banks` e exigem `accessToken` (Bearer) obtido no fluxo de 2FA.

| Método | Rota | Autenticação | Finalidade |
| --- | --- | --- | --- |
| `GET` | `/banks` | Bearer `accessToken` | Lista instituições financeiras |
| `GET` | `/banks/:id` | Bearer `accessToken` | Busca instituição financeira por id |
| `POST` | `/banks` | Bearer `accessToken` | Cria instituição financeira |
| `PUT` | `/banks/:id` | Bearer `accessToken` | Atualiza instituição financeira |
| `DELETE` | `/banks/:id` | Bearer `accessToken` | Remove instituição financeira |

A rota de relógio usa o prefixo `/api/v1/clock` e exige `accessToken` (Bearer). É um endpoint SSE (Server-Sent Events) que emite a cada segundo.

| Método | Rota | Autenticação | Finalidade |
| --- | --- | --- | --- |
| `GET` | `/clock/stream` | Bearer `accessToken` | Stream SSE com timezone e timestamp atuais, emitido a cada segundo |

O módulo `budget` (prefixo `/api/v1/budget`) é o experimento de idempotência em operações financeiras — `Balance` é versionado (chave composta `userId` + `version`, sem coluna `id` própria) e `Ledger` registra cada lançamento (`RESERVED`/`REFUNDED`/`WITHDRAW`/`CREDITED`). As rotas de escrita (`reserve`, `cancel`, `confirm`) passam por `IdempotencyInterceptor`, que usa Redis como lock (`transactionId` do body vira chave, com TTL) pra impedir que a mesma requisição seja processada duas vezes.

| Método | Rota | Autenticação | Finalidade |
| --- | --- | --- | --- |
| `GET` | `/budget/balance` | Bearer `accessToken` | Busca o saldo (versão mais recente) do usuário autenticado |
| `GET` | `/budget/ledger` | Bearer `accessToken` | Lista o histórico de lançamentos do usuário autenticado |
| `POST` | `/budget/reserve` | Bearer `accessToken` | Reserva um valor do saldo disponível (bloqueia), idempotente por `transactionId` |
| `POST` | `/budget/cancel` | Bearer `accessToken` | Cancela uma reserva, devolve o valor ao saldo disponível |
| `POST` | `/budget/confirm` | Bearer `accessToken` | Confirma (efetiva) uma reserva como saque |
| `GET` | `/budget/balance/stream` | Bearer `accessToken` | SSE que emite quando a tabela `balance` muda, via trigger Postgres (`pg_notify`) + `LISTEN` numa conexão dedicada. **Endpoint de teste, não é um padrão válido pra sistema financeiro real** — serve só pra validar SSE + `NOTIFY`/`LISTEN` na prática; um fluxo real de saldo com idempotência não deveria expor o dado por push não confiável (sem garantia de entrega/replay), só pelas rotas acima. |

A documentação interativa (Swagger) fica disponível em `/docs` com a aplicação em execução.

Esses fluxos ainda fazem parte do exercício e serão refinados conforme o projeto avançar.

## Prisma

O schema fica dividido por domínio em `prisma/schema/` (`user.prisma`, `bank.prisma`, `ledger.prisma`, `balance.prisma`), mais `schema.prisma` com o bloco `generator`/`datasource` — o Prisma CLI funde todos os arquivos da pasta automaticamente. Configuração de conexão e caminho do schema fica em `prisma7.config.ts`.

```bash
# gerar o Prisma Client a partir do schema
npx prisma generate

# sincronizar o schema direto no banco de dev (sem gerar arquivo de migration)
npx prisma db push

# criar e aplicar uma migration versionada
npx prisma migrate dev --name <nome>

# aplicar migrations pendentes (ambientes não interativos)
npx prisma migrate deploy

# conferir estado das migrations
npx prisma migrate status
```

O histórico de migrations neste projeto está incompleto por escolha — parte da evolução do schema (tabela `banks`, campos de 2FA, `ledger`/`balance`) foi aplicada via `db push` durante os estudos, sem gerar migration correspondente. Isso é aceitável para um ambiente de estudo; não reflete uma prática recomendada para produção.

Uma migration (`balance_notification_trigger`) foge do padrão do Prisma Client: cria uma função `plpgsql` e uma trigger (`AFTER INSERT OR UPDATE ON balance`) que dispara `pg_notify('balance_updates', ...)` a cada mudança na tabela — é o que alimenta o endpoint de teste `/budget/balance/stream`. Trigger e função não têm representação no `schema.prisma` (o Prisma não modela isso declarativamente); o SQL foi escrito à mão dentro da pasta da migration.

## Testes

```bash
# testes unitários
yarn test

# testes em modo watch
yarn test:watch

# cobertura de testes
yarn test:cov

# testes end-to-end
yarn test:e2e
```

Testes unitários cobrem controllers, services, guards e strategies dos módulos `auth`, `banks` e `clock`, além do decorator `is-tax-id`. O módulo `budget` ainda não tem testes (está em construção). Os specs de `auth.service` e `banks.service` também estão desatualizados desde a migração de Drizzle para Prisma e precisam ser reescritos. Testes end-to-end ainda não foram implementados.

## Próximos passos

- Decidir o destino do endpoint de teste `/budget/balance/stream` (removê-lo do módulo `budget` ou isolá-lo claramente como exemplo, já que não é um padrão adequado pra esse domínio).
- Corrigir `doneTransaction` em `budget.service.ts`: dentro do `$transaction(async (tx) => ...)`, o `update` do saldo usa `this.db.balance.update(...)` em vez de `tx.balance.update(...)` — quebra a atomicidade da transação.
- Escrever testes pro módulo `budget` (service, controller, interceptor de idempotência) e pro `RedisService` — hoje não têm cobertura nenhuma.
- Reescrever os testes de `auth.service` e `banks.service` para o formato Prisma Client (ainda no formato antigo do Drizzle).
- Persistir usuários e códigos de recuperação no PostgreSQL.
- Revisar o tratamento de senhas e tokens.
- Adicionar testes end-to-end para os fluxos de autenticação.
- Decidir se o histórico de migrations do Prisma será reconciliado (baseline + `migrate dev` daí em diante) ou se o projeto segue com `db push`.
- Estudar observabilidade e tratamento global de erros.

## Observação

Este não pretende ser um template pronto para produção. É um laboratório pessoal para recuperar ritmo, testar abordagens e registrar a evolução do meu estudo de backend com NestJS. Já que estou há uns 5 anos sem pegar algo denso para mexer 😜.
