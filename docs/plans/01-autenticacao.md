# Plan 01: Login e cadastro

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans. Passos em checkbox (`- [ ]`).

**Objetivo:** cadastro com aceite, confirmação por e-mail, login, logout, recuperação de senha e rotas protegidas.

**Arquitetura:** o Better Auth roda na function `netlify/functions/auth.mts` (`/api/auth/*`) e faz hash, sessão (cookie `HttpOnly`), e-mails e rate limit, com as tabelas no schema `auth` do Postgres. Ele conecta com um papel próprio, `nubanko_auth`, o único com acesso a `auth`. Uma trigger em `auth."user"` cria `perfis` a partir do campo adicional `aceiteVersao` e recusa o cadastro sem aceite. `netlify/lib/sessao.ts` implementa o `ObterSessao` do plan 00 com o Better Auth. No front, `AuthService` encapsula o client do Better Auth (`better-auth/client`) e traduz erros em mensagens neutras.

**Stack:** a do plan 00, mais `better-auth` e `nodemailer` (SMTP: Mailpit localmente, provedor real em produção).

**Spec:** `docs/specs/01-autenticacao.md` (e a 00)

## Restrições globais

- Todas as do plan 00. Branch `feature/01-autenticacao`.
- Senha: 8+ caracteres, 1 número, 1 símbolo. Nome: 2 a 40 caracteres, após `trim`.
- Versão da política atual: `POLITICA_VERSAO = '2026-11'`.
- Mensagens exatas: "E-mail ou senha incorretos" · "Se esse e-mail puder ser usado, você receberá um link" · texto de segurança "Senha protegida e conexão segura (HTTPS)".

## Foco de revisão

- E-mail com maiúsculas ou espaços nas pontas ("Lari@X.com ") deve logar a mesma conta (normalizar com `trim().toLowerCase()`).
- Link de confirmação aberto duas vezes ou expirado: tela com "Link inválido ou expirado" e a opção de reenviar, não um erro técnico.
- Sessão expirada no meio do uso: a próxima chamada leva ao login com `returnUrl`, sem tela branca.
- `returnUrl` externo (`//evil.com`): ignorar e cair em `/inicio`.
- Rate limit em memória "funciona" localmente e não em produção (cada instância tem a sua): conferir que o armazenamento é o banco.
- Cadastro de e-mail existente: a **resposta HTTP** da API (status e corpo) é idêntica à de um e-mail novo, não só a mensagem da tela.
- Links dos e-mails apontam para `BETTER_AUTH_URL` do ambiente certo (deploy preview não pode mandar link de produção).
- Nome só com espaços: inválido.

---

### Tarefa 1: Better Auth, tabela `perfis` e trigger de cadastro

**Arquivos:** criar `db/migrations/20261201000100_auth.sql` (gerada pela CLI do Better Auth e revisada), `db/migrations/20261201000110_perfis.sql`, `db/tests/01_perfis.test.sql`, `netlify/lib/auth.ts`, `netlify/lib/sessao.ts`, `netlify/lib/email.ts`, `netlify/functions/auth.mts`, `netlify/functions/auth.spec.ts`; papel `nubanko_auth` em `docker/db/00_papeis.sql`; variáveis `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DATABASE_URL_AUTH`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_REMETENTE` no `.env.example`

**Interfaces:**
- Produz:
  - schema `auth` com as tabelas do Better Auth (`user`, `session`, `account`, `verification`, `rateLimit`), dono `nubanko_owner`, acesso só de `nubanko_auth`. O `user` ganha a coluna `aceiteVersao text`.
  - `public.perfis(id text pk references auth."user"(id) on delete cascade, nome text not null check (char_length(trim(nome)) between 2 and 40), aceite_politica_em timestamptz not null, versao_politica text not null, criado_em timestamptz default now())`; RLS (com `force`) select e update só `id = app.usuario_id()`; sem insert ou delete por `nubanko_app`; update limitado à coluna `nome` (grant de coluna).
  - função `public.criar_perfil()` (`security definer`, `set search_path = ''`) como trigger `after insert on auth."user"`: copia `name` para `nome` e `aceiteVersao` para `versao_politica`, com `aceite_politica_em = now()`; sem `aceiteVersao`, faz `raise exception 'aceite_obrigatorio'`.
  - `auth.ts`: `betterAuth({ basePath: '/api/auth', database: Pool(DATABASE_URL_AUTH com search_path=auth), emailAndPassword: { enabled, requireEmailVerification: true, minPasswordLength: 8, maxPasswordLength: 128, sendResetPassword }, emailVerification: { sendVerificationEmail, sendOnSignUp: true }, user: { additionalFields: { aceiteVersao: { type: 'string', required: true, input: true } }, deleteUser: { enabled: true } }, rateLimit: { enabled: true, storage: 'database', customRules: { '/sign-in/email': { window: 60, max: 5 }, '/sign-up/email': { window: 60, max: 3 }, '/request-password-reset': { window: 60, max: 3 } } }, trustedOrigins: [BETTER_AUTH_URL], hooks })`. O `hooks.before` aplica `checarSenha` (a mesma de `web/src/app/core/calculos/senha.ts`, importada pelas functions porque é TS puro, sem Angular) em cadastro, redefinição e troca de senha e recusa com `{ erro: 'senha_fraca' }`. O `hooks.after` do cadastro troca o erro de e-mail existente pela resposta de sucesso (R-01.4).
  - `email.ts`: `enviarEmail({ para, assunto, html })` via `nodemailer`; modelos em pt-BR para confirmação e redefinição.
  - `sessao.ts`: `obterSessao(req)` com `auth.api.getSession({ headers: req.headers })` → `{ usuarioId }` ou `null`; vira o padrão de `comUsuario`.
  - `auth.mts`: `export default (req) => auth.handler(req)`, `config = { path: '/api/auth/*' }`.

- [ ] **Passo 1:** testes pgTAP: o insert em `auth."user"` com `aceiteVersao` cria o perfil com o nome e a versão; sem `aceiteVersao`, o insert falha (`throws_ok 'aceite_obrigatorio'`); como A, `select` em `perfis` retorna só a linha de A; como A, `update perfis set nome='X' where id=B` afeta 0 linhas; como A, `update ... set versao_politica` falha por privilégio; sem `app.user_id`, `select` retorna 0 linhas; `nubanko_app` não consegue `select` em `auth."user"`; apagar o usuário apaga o perfil.
- [ ] **Passo 2:** testes de integração (`auth.spec.ts`, chamando o handler): cadastro com senha `abcdefgh` (sem número) dá `400 senha_fraca`; cadastro sem `aceiteVersao` falha; cadastrar duas vezes o mesmo e-mail dá respostas iguais (status e corpo); o cadastro envia um e-mail ao Mailpit com o link de confirmação; login antes de confirmar falha; a 6ª tentativa de login em 60 s dá `429`; `R-00.7`: o cookie de sessão é `HttpOnly` e `SameSite=Lax`, e um `POST` de escrita com `Origin` de outro site é recusado.
- [ ] **Passo 3:** rodar `dbtest` e `npx vitest run netlify`. Esperado: FAIL.
- [ ] **Passo 4:** gerar a migração com `npx @better-auth/cli generate`, revisar (schema `auth`, grants, `aceiteVersao`), escrever a de `perfis` e a config. Rodar `docker compose up -d migrate app`.
- [ ] **Passo 5:** rodar tudo de novo, incluindo `00_rls_obrigatoria` e o guarda das functions. Esperado: PASS.
- [ ] **Passo 6:** commit `feat(R-01.10): adiciona Better Auth e perfis com aceite obrigatório`.

### Tarefa 2: validadores

**Arquivos:** criar `web/src/app/features/auth/validadores.ts` + spec

**Interfaces:**
- Produz: `checarSenha(s: string): { oitoMais: boolean; numero: boolean; simbolo: boolean; valida: boolean }`; `senhaValidator: ValidatorFn` (erro `{ senhaFraca: true }`); `nomeValidator` (`{ nomeInvalido: true }`); `senhasIguaisValidator(campoA, campoB)` (`{ senhasDiferentes: true }`, no grupo).

- [ ] **Passo 1:** testes: `checarSenha('abcdefg1!')` é válida; `'abcdefgh!'` sem número; `'abcdefg1'` sem símbolo; `'a1!'` sem `oitoMais`; `nomeValidator` rejeita `'   '` e `'L'` e aceita `'Lari'`; com 41 caracteres, rejeita.
- [ ] **Passos 2 a 4:** FAIL → implementar → PASS.
- [ ] **Passo 5:** commit `feat(R-01.2): adiciona validadores de senha e nome`.

### Tarefa 3: `AuthService` e guarda de rota

**Arquivos:** criar `features/auth/auth.service.ts`, `features/auth/auth.guard.ts` + specs

**Interfaces:**
- Consome: `createAuthClient({ baseURL: '/api/auth' })` de `better-auth/client` (fornecido por um `InjectionToken` `AUTH_CLIENT`, para mockar nos testes), `POLITICA_VERSAO`.
- Produz:
  - `AuthService { usuario: Signal<{ id: string; email: string } | null>; nome: Signal<string | null> /* lido de perfis ao entrar */; definirNome(n: string): void; pronto: Signal<boolean>; cadastrar(d: { nome; email; senha }): Promise<void>; entrar(email, senha): Promise<void>; sair(): Promise<void>; pedirRedefinicao(email): Promise<void>; definirNovaSenha(senha): Promise<void> }`. Erros lançados como `ErroAuth` com `mensagem` em pt-BR. O cadastro chama `signUp.email({ name: nome, email, password: senha, aceiteVersao: POLITICA_VERSAO, callbackURL: '/entrar?confirmado=1' })`; a redefinição, `requestPasswordReset({ email, redirectTo: '/nova-senha' })`. O `nome` vem de `GET /api/perfil` (endpoint do plan 05, adiantado aqui só com o `GET`).
  - `authGuard: CanActivateFn`: sem sessão, faz `/entrar?returnUrl=<rota>`. `returnUrl` só é aceito se começar com `/` e não com `//`.
  - `convidadoGuard`: com sessão, `/entrar` e `/cadastro` redirecionam para `/inicio`.

- [ ] **Passo 1:** testes com o client mockado: credenciais erradas viram `ErroAuth('E-mail ou senha incorretos')`; o cadastro de um e-mail existente resolve sem erro (mensagem neutra, R-01.4); o e-mail é normalizado; o guard redireciona com `returnUrl`; `returnUrl='//evil.com'` vai para `/inicio`.
- [ ] **Passos 2 a 4:** FAIL → implementar (`useSession`/`getSession` do client alimenta o `usuario` ao iniciar o app) → PASS.
- [ ] **Passo 5:** aplicar `authGuard` à rota da casca, trocar `proverDadosEmMemoria()` pela sessão real no `app.config.ts` (os repositórios de domínio continuam em memória até os plans 02 a 05), ajustar `e2e/00-fundacao.spec.ts` para usar `entrarComo` antes de abrir `/inicio` e commit `feat(R-01.9): adiciona AuthService e guardas de rota`.

### Tarefa 4: telas de entrada

**Arquivos:** criar `features/auth/{entrar,cadastro,esqueci-senha,nova-senha}/*.component.ts` + specs; rotas `/entrar`, `/cadastro`, `/esqueci-senha`, `/nova-senha`

**Interfaces:**
- Consome: `AuthService`, validadores, `nb-field`, `nb-button`, `nb-logo`, `ToastService`.

- [ ] **Passo 1:** testes de componente:
  - **cadastro:** o botão fica desabilitado sem aceite (R-01.3); os três checks mudam a cada digitação (U-01.2); o erro só aparece após `blur` (U-01.4); senhas diferentes mostram "As senhas não coincidem"; após enviar, mostra "Enviamos um link de confirmação para {email}".
  - **entrar:** com `?confirmado=1`, mostra "E-mail confirmado. Agora é só entrar."; o erro de login mostra a mensagem neutra; os inputs têm `autocomplete` `email` e `current-password` (ou `new-password` no cadastro) e botão de mostrar senha com `aria-pressed` (U-01.3).
  - **esqueci-senha:** a resposta é sempre neutra.
  - **nova-senha:** aplica a regra R-01.2.
- [ ] **Passos 2 a 4:** FAIL → implementar seguindo os mockups e as divergências do README → PASS.
- [ ] **Passo 5:** commit `feat(R-01.1): adiciona telas de login, cadastro e recuperação`.

### Tarefa 5: e2e e usabilidade

**Arquivos:** criar `web/e2e/01-autenticacao.spec.ts`

- [ ] **Passo 1:** testes Playwright:
  - `R-01.1/R-01.5 cadastro com confirmação`: preenche, aceita, abre o link de `ultimoEmail`, loga e vê "Olá, {nome}" no `/inicio`.
  - `R-01.5 login antes de confirmar` falha com mensagem.
  - `R-01.7 senha errada` mostra a mensagem neutra.
  - `R-01.8 recuperação`: link do Mailpit, nova senha, login com a nova.
  - `R-01.9 rota protegida` volta para `/caixinhas` depois do login.
  - `R-01.6 sessão persiste após reload`; `sair` volta para `/entrar`.
  - `U-01.1` o cadastro cabe numa rota só, sem etapas.
  - `U-00.1/2/3` em `/entrar` e `/cadastro`.
  - `U-01.5` o saldo fica visível em ≤ 2000 ms após o clique em Entrar.
- [ ] **Passos 2 a 4:** rodar → corrigir → PASS nos dois viewports.
- [ ] **Passo 5:** atualizar `docs/rastreabilidade.md` e `registro-ia.md`; commit `test(R-01.1): cobre autenticação ponta a ponta`.
