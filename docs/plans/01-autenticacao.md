# Plan 01: Login e cadastro

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans. Passos em checkbox (`- [ ]`).

**Objetivo:** cadastro com aceite, confirmação por e-mail, login, logout, recuperação de senha e rotas protegidas.

**Arquitetura:** Supabase Auth faz hash, sessão e e-mails; uma trigger cria `perfis` a partir de `raw_user_meta_data` e recusa o cadastro sem aceite. `AuthService` encapsula o `supabase.auth` e traduz erros em mensagens neutras.

**Stack:** a do plan 00.

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
- Nome só com espaços: inválido.

---

### Tarefa 1: tabela `perfis`, trigger de cadastro e configuração do Auth

**Arquivos:** criar `supabase/migrations/20261201000100_perfis.sql`, `supabase/tests/01_perfis.test.sql`; alterar as variáveis do GoTrue em `docker-compose.yml`

**Interfaces:**
- Produz: `public.perfis(id uuid pk references auth.users on delete cascade, nome text not null check (char_length(trim(nome)) between 2 and 40), aceite_politica_em timestamptz not null, versao_politica text not null, criado_em timestamptz default now())`; RLS select e update só `id = auth.uid()`; sem insert ou delete pelo cliente; update limitado à coluna `nome` (grant de coluna). Função `public.criar_perfil()` como trigger `after insert on auth.users`, que lê `nome` e `aceite_versao` dos metadados e, sem `aceite_versao`, faz `raise exception 'aceite obrigatório'`.

- [ ] **Passo 1:** testes pgTAP: o insert em `auth.users` com metadados cria o perfil com o nome e a versão; sem `aceite_versao`, o insert falha (`throws_ok`); como A, `select` em `perfis` retorna só a linha de A; como A, `update perfis set nome='X' where id=B` afeta 0 linhas; como A, `update ... set versao_politica` falha por privilégio; como anônimo, `select` retorna 0 linhas.
- [ ] **Passo 2:** `docker compose --profile test run --rm dbtest supabase/tests/01_perfis.test.sql`. Esperado: FAIL.
- [ ] **Passo 3:** escrever a migração (função `security definer`, `set search_path = ''`). No GoTrue: `GOTRUE_PASSWORD_MIN_LENGTH=8`, `GOTRUE_PASSWORD_REQUIRED_CHARACTERS` com dígitos e símbolos, `GOTRUE_RATE_LIMIT_*` nos valores padrão do Supabase Cloud (R-01.12), `GOTRUE_MAILER_TEMPLATES_*` em pt-BR. Rodar `docker compose up -d migrate auth`.
- [ ] **Passo 4:** rodar `dbtest` (todos). Esperado: PASS, incluindo `00_rls_obrigatoria`.
- [ ] **Passo 5:** commit `feat(R-01.10): cria perfis com aceite obrigatório e RLS de dono`.

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
- Consome: `SUPABASE`, `POLITICA_VERSAO`.
- Produz:
  - `AuthService { usuario: Signal<{ id: string; email: string } | null>; nome: Signal<string | null> /* lido de perfis ao entrar */; definirNome(n: string): void; pronto: Signal<boolean>; cadastrar(d: { nome; email; senha }): Promise<void>; entrar(email, senha): Promise<void>; sair(): Promise<void>; pedirRedefinicao(email): Promise<void>; definirNovaSenha(senha): Promise<void> }`. Erros lançados como `ErroAuth` com `mensagem` em pt-BR. O cadastro envia `options.data = { nome, aceite_versao: POLITICA_VERSAO }` e `emailRedirectTo: <origin>/entrar?confirmado=1`.
  - `authGuard: CanActivateFn`: sem sessão, faz `/entrar?returnUrl=<rota>`. `returnUrl` só é aceito se começar com `/` e não com `//`.
  - `convidadoGuard`: com sessão, `/entrar` e `/cadastro` redirecionam para `/inicio`.

- [ ] **Passo 1:** testes com o client mockado: credenciais erradas viram `ErroAuth('E-mail ou senha incorretos')`; o cadastro de um e-mail existente resolve sem erro (mensagem neutra, R-01.4); o e-mail é normalizado; o guard redireciona com `returnUrl`; `returnUrl='//evil.com'` vai para `/inicio`.
- [ ] **Passos 2 a 4:** FAIL → implementar (`onAuthStateChange` alimenta o `usuario`) → PASS.
- [ ] **Passo 5:** aplicar `authGuard` à rota do `ShellComponent`, ajustar `e2e/00-fundacao.spec.ts` para usar `entrarComo` antes de abrir `/inicio` e commit `feat(R-01.9): adiciona AuthService e guardas de rota`.

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
