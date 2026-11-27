-- Plan 01: tabelas do Better Auth no schema auth (geradas com getMigrations do better-auth 1.7
-- e revisadas). Só o papel nubanko_auth (a function /api/auth/*) acessa este schema.
-- nubanko_app (functions de domínio) não tem nenhum acesso: lê e-mail e data de cadastro
-- só pela função public.meu_email_e_cadastro() (migração de perfis).
--
-- O que fica em claro aqui, e por quê:
--   user.email      é a chave do login (busca por igualdade); o Better Auth precisa dele.
--   user.name       fica sempre vazio: o nome real vive cifrado em public.perfis (trigger abaixo).
--   account.password é hash scrypt do Better Auth, nunca a senha.
--   session.ipAddress/userAgent: segurança das sessões ativas (spec 05, R-05.4).

create schema auth;

create table auth."user" (
  "id" text not null primary key,
  "name" text not null,
  "email" text not null unique,
  "emailVerified" boolean not null,
  "image" text,
  "createdAt" timestamptz default current_timestamp not null,
  "updatedAt" timestamptz default current_timestamp not null,
  "aceiteVersao" text not null
);

create table auth."session" (
  "id" text not null primary key,
  "expiresAt" timestamptz not null,
  "token" text not null unique,
  "createdAt" timestamptz default current_timestamp not null,
  "updatedAt" timestamptz not null,
  "ipAddress" text,
  "userAgent" text,
  "userId" text not null references auth."user" ("id") on delete cascade
);

create table auth."account" (
  "id" text not null primary key,
  "accountId" text not null,
  "providerId" text not null,
  "userId" text not null references auth."user" ("id") on delete cascade,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  "scope" text,
  "password" text,
  "createdAt" timestamptz default current_timestamp not null,
  "updatedAt" timestamptz not null
);

create table auth."verification" (
  "id" text not null primary key,
  "identifier" text not null,
  "value" text not null,
  "expiresAt" timestamptz not null,
  "createdAt" timestamptz default current_timestamp not null,
  "updatedAt" timestamptz default current_timestamp not null
);

-- Rate limit no banco: em serverless a memória não é compartilhada entre instâncias (R-01.12).
create table auth."rateLimit" (
  "id" text not null primary key,
  "key" text not null unique,
  "count" integer not null,
  "lastRequest" bigint not null
);

create index "session_userId_idx" on auth."session" ("userId");
create index "account_userId_idx" on auth."account" ("userId");
create index "verification_identifier_idx" on auth."verification" ("identifier");

grant usage on schema auth to nubanko_auth;
grant select, insert, update, delete on all tables in schema auth to nubanko_auth;
