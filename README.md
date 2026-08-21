# Estudo de NestJS

Este repositório é um projeto de estudo para retomar a prática de desenvolvimento backend com Node.js e NestJS.

Estou usando este projeto para desenferrujar meus conhecimentos e reconstruir familiaridade com uma aplicação backend mais completa. Faz cerca de cinco anos que não trabalho em algo mais complexo, então a ideia aqui é avançar de forma incremental, revisitando conceitos, ferramentas e decisões comuns no desenvolvimento de APIs.

O projeto ainda está em construção. O código, as escolhas técnicas e a documentação devem evoluir junto com o aprendizado.

## Objetivos de estudo

- Revisar a organização modular do NestJS.
- Praticar controllers, services, DTOs e injeção de dependências.
- Implementar autenticação com JWT.
- Trabalhar com validação de dados recebidos pela API.
- Integrar uma aplicação NestJS com PostgreSQL.
- Usar Drizzle ORM e Drizzle Kit para acesso a dados e migrações.
- Recuperar familiaridade com testes, configuração e execução de aplicações backend.

## Tecnologias

- Node.js
- TypeScript
- NestJS
- PostgreSQL
- Docker e Docker Compose
- Drizzle ORM e Drizzle Kit
- JSON Web Token (JWT)
- Jest e Supertest

## Estrutura atual

```text
src/
├── auth/
│   ├── dto/
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   └── auth.service.ts
├── database/
│   ├── schemas/
│   ├── database.module.ts
│   └── database.provider.ts
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts
```

## Pré-requisitos

- Node.js instalado.
- Yarn instalado.
- Docker e Docker Compose instalados, caso queira executar o PostgreSQL em container.

## Configuração

Instale as dependências:

```bash
yarn install
```

Crie o arquivo `.env` na raiz do projeto. O arquivo `.env.example` pode ser usado como referência:

```env
DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/mydatabase
JWT_SECRET=uma-chave-secreta-para-desenvolvimento
```

O arquivo `.env` não deve ser versionado. Para ambientes reais, use uma chave JWT forte e mantenha os segredos fora do código-fonte.

## Banco de dados

Suba o PostgreSQL com Docker Compose:

```bash
docker compose up -d
```

O container disponibiliza o banco na porta `5432`, com os seguintes dados locais:

| Configuração | Valor |
| --- | --- |
| Usuário | `myuser` |
| Senha | `mypassword` |
| Banco | `mydatabase` |
| Host | `localhost` |
| Porta | `5432` |

Para interromper o container:

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

As rotas de autenticação usam o prefixo `/auth`:

| Método | Rota | Finalidade |
| --- | --- | --- |
| `POST` | `/auth/signin` | Login com e-mail e senha |
| `POST` | `/auth/request-password-rescue-code` | Solicitação de código de recuperação |
| `POST` | `/auth/set-new-password` | Definição de uma nova senha |
| `POST` | `/auth/mfa-verify` | Verificação de código MFA |

Esses fluxos ainda fazem parte do exercício e serão refinados conforme o projeto avançar.

## Migrações

Os comandos do Drizzle Kit estão definidos no `package.json`:

```bash
# gerar uma migração a partir do schema
yarn migration:generate

# executar as migrações
yarn migration:run
```

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

## Próximos passos

- Completar o fluxo de cadastro e autenticação.
- Persistir usuários e códigos de recuperação no PostgreSQL.
- Revisar o tratamento de senhas e tokens.
- Adicionar testes unitários e end-to-end para os fluxos de autenticação.
- Evoluir o uso de migrações e validações de ambiente.
- Estudar observabilidade, tratamento global de erros e documentação com Swagger.

## Observação

Este não pretende ser um template pronto para produção. É um laboratório pessoal para recuperar ritmo, testar abordagens e registrar a evolução do meu estudo de backend com NestJS. Já que estou há uns 5 anos sem pegar algo denso para mexer 😜.
