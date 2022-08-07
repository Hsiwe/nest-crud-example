## Description

Simple REST CRUD that provides JWT-based authorization(registration, login, refresh tokens), input validation(class-validator) and OAS docs generation using DTOs and Swagger.

Stack: TypeScript, NestJS, PostgreSQL(PrismaORM)


# Installation

## Database
Install PostgreSQL from the official [site](https://www.postgresql.org/download/). 
## Dependencies
```bash
$ npm install
```
## Configuring and running migrations
Fill .env file based on .env.example and run migrations:
```bash
$ npx prisma migrate deploy
```
# Running the app

```bash
# generating schema for Prisma
$ npx prisma generate
```

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```


