# Plan 00: Fundação

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para executar tarefa por tarefa. Passos em checkbox (`- [ ]`).

**Objetivo:** ambiente local isolado (Supabase + Angular PWA + runners de teste) subindo com `docker compose up`, com a base de UI, de testes e de usabilidade de que as specs 01 a 05 dependem.

**Arquitetura:** monorepo com `docker-compose.yml` na raiz; `supabase/` (migrações e testes pgTAP); `web/` (Angular standalone + PWA, Tailwind, Vitest, Playwright). Componentes só falam com o Supabase por serviços que recebem o client via `InjectionToken`.

**Stack:** Docker Compose, Supabase self-hosted (postgres, gotrue, postgrest, kong, postgres-meta, studio), Mailpit, Angular (CLI atual) + `@angular/pwa`, Tailwind CSS, Vitest, Playwright, `@axe-core/playwright`, pgTAP.

**Spec:** `docs/specs/00-fundacao.md`

## Restrições globais

- Branch de trabalho: `feature/00-fundacao`, saindo de `develop`. Commits `tipo(ID): mensagem` em pt-BR.
- Dinheiro em centavos inteiros; exibição `R$ 1.234,56` via `Intl.NumberFormat('pt-BR', {style:'currency', currency:'BRL'})`.
- Mês calculado em `America/Sao_Paulo`.
- Front usa só a `anon key`; `service_role` nunca entra em `web/src` nem no bundle (R-00.6).
- Toda tabela em `public` tem RLS habilitado (R-00.1).
- Fontes Inter e Manrope **auto-hospedadas** (`@fontsource/*`), sem Google Fonts, para não ter terceiros (R-00.5).
- Viewports Playwright: 360×740 e 390×844.
- Cobertura mínima do front: 80% de linhas e branches.
- Texto sobre `#01CED1` é `#1A1A1A`.
- Ao terminar cada tarefa, adicionar uma linha em `docs/ai/registro-ia.md`.

## Foco de revisão

- Subir o compose duas vezes seguidas: migrações já aplicadas não podem reaplicar nem quebrar (o `migrate` é idempotente).
- Tabela criada sem RLS numa spec futura: o teste `00_rls_obrigatoria` tem de falhar sozinho, sem ninguém lembrar de escrevê-lo.
- `.env` ausente: o compose deve falhar com mensagem clara, não subir com segredo vazio.
- Valores de 0 centavos e negativos em `formatBRL` (`R$ 0,00`, `-R$ 12,34`).
- Virada de mês à meia-noite em São Paulo quando o UTC já é o dia seguinte (`mesAtual` às 22h de 30/11 em SP continua novembro).

## Estrutura de arquivos

```
docker-compose.yml            .env.example
docker/kong/kong.yml          docker/db/*.sql (init roles/jwt do Supabase)
docker/migrate/migrate.sh     docker/pgtap/Dockerfile   docker/pgtap/run.sh
docker/web/Dockerfile         scripts/smoke.sh
supabase/migrations/          supabase/tests/_helpers.sql   supabase/tests/00_rls_obrigatoria.test.sql
web/                          (app Angular; ver tarefas 3 a 7)
.claude/agents/{arquiteto,dev,testes,ui-ux}.md
docs/rastreabilidade.md
```

---

### Tarefa 1: Supabase local no Docker Compose

**Arquivos:** criar `docker-compose.yml`, `.env.example`, `docker/kong/kong.yml`, `docker/db/*.sql`, `docker/migrate/migrate.sh`, `scripts/smoke.sh`

**Interfaces:**
- Produz: API em `http://localhost:8000` (`/auth/v1`, `/rest/v1`); Postgres em `localhost:54322` (usuário `postgres`); Studio em `localhost:3000`; Mailpit UI/API em `localhost:8025`; rede `nubanko`; variáveis `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `POSTGRES_PASSWORD`, `JWT_SECRET`.

- [ ] **Passo 1:** escrever `scripts/smoke.sh`. Ele falha (exit ≠ 0) se qualquer check falhar: `GET $SUPABASE_URL/auth/v1/health` → 200; `GET $SUPABASE_URL/rest/v1/` com header `apikey: $SUPABASE_ANON_KEY` → 200; `psql` em `localhost:54322` executa `select 1`; `GET localhost:8025/api/v1/messages` → 200.
- [ ] **Passo 2:** rodar `./scripts/smoke.sh`. Esperado: FAIL (nada no ar).
- [ ] **Passo 3:** montar o compose a partir de `docker/docker-compose.yml` do repositório oficial `supabase/supabase`, **numa tag fixa** (anotar a tag no topo do arquivo). Manter só `db`, `auth`, `rest`, `kong`, `meta`, `studio`; adicionar `mail` (`axllent/mailpit`) e `migrate`. Copiar os SQL de init (`roles.sql`, `jwt.sql` etc.) para `docker/db/`. Usar `${VAR:?defina VAR no .env}` em todo segredo. Configurar o GoTrue: `GOTRUE_SMTP_HOST=mail`, `GOTRUE_SMTP_PORT=1025`, `GOTRUE_MAILER_AUTOCONFIRM=false`, `GOTRUE_SITE_URL=http://localhost:4200`. O `.env.example` usa as chaves demo públicas do Supabase local, com o comentário `# SOMENTE DESENVOLVIMENTO`. O volume do Postgres é nomeado (`nubanko-db`).
- [ ] **Passo 4:** escrever `docker/migrate/migrate.sh`. Ele cria `public._migracoes(nome text primary key, aplicada_em timestamptz default now())`, aplica em ordem alfabética cada `supabase/migrations/*.sql` ausente da tabela (cada um em transação, com `psql -v ON_ERROR_STOP=1`) e registra o nome. O serviço `migrate` depende de `db` saudável e encerra no fim. **Exceção:** `_migracoes` é interna, sem acesso por `anon` e `authenticated` (`revoke all`); a tarefa 2 a trata como exceção explícita.
- [ ] **Passo 5:** `cp .env.example .env && docker compose up -d && ./scripts/smoke.sh`. Esperado: todos os checks OK. Rodar `docker compose up -d` de novo e o smoke de novo. Esperado: OK, `migrate` sem reaplicar nada.
- [ ] **Passo 6:** commit `chore(R-00.1): sobe Supabase local isolado via docker compose`.

### Tarefa 2: runner pgTAP e guarda de RLS

**Arquivos:** criar `docker/pgtap/Dockerfile`, `docker/pgtap/run.sh`, `supabase/tests/_helpers.sql`, `supabase/tests/00_rls_obrigatoria.test.sql`; serviço `dbtest` (profile `test`) no compose

**Interfaces:**
- Produz: o comando `docker compose --profile test run --rm dbtest [arquivos...]` (sem argumentos, roda `supabase/tests/*.test.sql`). Helpers no schema `tests`:
  - `tests.criar_usuario(email text) returns uuid`: insere em `auth.users` com `raw_user_meta_data = {"nome":"Teste","aceite_versao":"2026-11"}`
  - `tests.autenticar_como(uid uuid)`: `set local role authenticated` + `set local request.jwt.claims` com `sub` e `role`
  - `tests.anonimo()`: `set local role anon`
  - `tests.resetar()`: `reset role`

- [ ] **Passo 1:** escrever `00_rls_obrigatoria.test.sql`. Para cada tabela em `public`, exceto `_migracoes`, o teste exige `relrowsecurity = true`. Inclui um teste negativo que cria, dentro da transação, `public._teste_sem_rls(id int)` e verifica que a consulta do guarda a aponta (o teste então dá rollback).
- [ ] **Passo 2:** rodar `dbtest`. Esperado: FAIL (runner inexistente).
- [ ] **Passo 3:** `Dockerfile` baseado em `postgres:15-alpine` com `perl` e `pg_prove` (`cpanm TAP::Parser::SourceHandler::pgTAP`). O `run.sh` cria `extension pgtap`, aplica `_helpers.sql` e roda `pg_prove -h db -U postgres` nos arquivos.
- [ ] **Passo 4:** rodar `dbtest`. Esperado: PASS.
- [ ] **Passo 5:** commit `test(R-00.1): adiciona runner pgTAP e guarda de RLS obrigatória`.

### Tarefa 3: app Angular PWA com tokens do design system

**Arquivos:** criar `web/` (via `npx @angular/cli@latest new web --standalone --routing --style=css --ssr=false`), `web/src/styles.css`, `web/src/environments/*`, `docker/web/Dockerfile`; serviço `web` no compose

**Interfaces:**
- Produz: `environment.supabaseUrl`, `environment.supabaseAnonKey`, `environment.versao` (lida de `package.json` no build); tokens Tailwind (`brand` `#01CED1`, `brand-dark` `#00A3A6`, `brand-light` `#E6FAFA`, `ink` `#1A1A1A`, `muted` `#6B7280`, `canvas` `#F7F8FA`, `gold` `#FFE08F`, `pos` `#16A34A`, `neg` `#E5484D`, `line` `#EEF0F4`; raios `lg` 16px, `xl` 24px; fontes `font-display` Manrope, `font-sans` Inter); classe utilitária `.tabular` (`font-variant-numeric: tabular-nums`).

- [ ] **Passo 1:** teste `app.spec.ts` que valida o manifest `public/manifest.webmanifest`, com `name: "NuBanko"`, `lang: "pt-BR"`, `theme_color: "#01CED1"`, `display: "standalone"`.
- [ ] **Passo 2:** `cd web && npx ng test --watch=false`. Esperado: FAIL.
- [ ] **Passo 3:** `ng add @angular/pwa`, Tailwind, `@fontsource/inter` e `@fontsource/manrope`, Vitest com cobertura (thresholds 80 em `lines` e `branches`); `<html lang="pt-BR">`. O serviço `web` usa Node LTS, monta `./web` e roda `ng serve --host 0.0.0.0` na porta 4200.
- [ ] **Passo 4:** `npx ng test --watch=false` e `npx ng build`. Esperado: PASS e build sem erros. `docker compose up -d web` abre `localhost:4200`.
- [ ] **Passo 5:** commit `chore: cria app Angular PWA com tokens do design system`.

### Tarefa 4: núcleo (Supabase client, dinheiro, mês)

**Arquivos:** criar `web/src/app/core/supabase.ts`, `core/money.ts`, `core/mes.ts` e os `.spec.ts` ao lado

**Interfaces:**
- Produz:
  - `SUPABASE: InjectionToken<SupabaseClient>`; `provideSupabase(): Provider` (usa `environment`)
  - `formatBRL(centavos: number): string`. Usa NBSP entre `R$` e o número, como o `Intl`.
  - `type Mes = { ano: number; mes: number }` (mes 1–12)
  - `mesAtual(agora?: Date): Mes`; `hojeISO(agora?: Date): string` (`YYYY-MM-DD` em SP)
  - `rotuloMes(m: Mes): string` → `"Novembro 2026"`; `rotuloMesCurto(m: Mes): string` → `"nov/2026"`
  - `somarMeses(m: Mes, n: number): Mes`; `compararMes(a: Mes, b: Mes): -1|0|1`; `mesesInclusivos(de: Mes, ate: Mes): number` (0 se `ate < de`)

- [ ] **Passo 1:** testes:
```ts
expect(formatBRL(123456)).toBe('R$ 1.234,56');
expect(formatBRL(0)).toBe('R$ 0,00');
expect(formatBRL(-1234)).toBe('-R$ 12,34');
expect(mesAtual(new Date('2026-12-01T01:00:00Z'))).toEqual({ ano: 2026, mes: 11 }); // 22h em SP
expect(hojeISO(new Date('2026-12-01T01:00:00Z'))).toBe('2026-11-30');
expect(rotuloMes({ ano: 2026, mes: 11 })).toBe('Novembro 2026');
expect(somarMeses({ ano: 2026, mes: 12 }, 1)).toEqual({ ano: 2027, mes: 1 });
expect(mesesInclusivos({ ano: 2026, mes: 11 }, { ano: 2027, mes: 3 })).toBe(5);
expect(mesesInclusivos({ ano: 2026, mes: 11 }, { ano: 2026, mes: 10 })).toBe(0);
```
- [ ] **Passo 2:** rodar. Esperado: FAIL.
- [ ] **Passo 3:** implementar com `Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' })`; `rotuloMes` com a primeira letra maiúscula.
- [ ] **Passo 4:** rodar. Esperado: PASS.
- [ ] **Passo 5:** commit `feat(R-00.1): adiciona núcleo de dinheiro, mês e client Supabase`.

### Tarefa 5: componentes base de UI

**Arquivos:** criar `web/src/app/shared/ui/{button,field,card,logo,toast,bottom-sheet}/*.ts` + specs

**Interfaces:**
- Produz:
  - `<nb-button variant="primary|secondary|ghost|danger" [disabled] [full]>`: altura mínima 48px
  - `<nb-field label erro? dica?>` com `<input>` projetado; liga `aria-describedby` ao erro e à dica e `aria-invalid` quando há erro
  - `<nb-card>`: raio 24px, sombra nível 1
  - `<nb-logo>`: "NuBanko" + `<span class="text-brand">.</span>`
  - `ToastService.mostrar(msg: string): void` + `<nb-toast-host>`: `role="status"`, some após 3 s
  - `<nb-bottom-sheet [aberto] (fechar)>`: `role="dialog"`, `aria-modal`, prende o foco, fecha com Esc, clique no fundo e voltar do navegador (`history.pushState` ao abrir, `popstate` fecha)

- [ ] **Passo 1:** testes de componente: o `nb-field` com erro expõe `aria-invalid="true"` e o texto do erro ligado por `aria-describedby`; o `ToastService.mostrar('Gasto registrado')` renderiza em `role=status` e some após 3000 ms (fake timers); o `nb-bottom-sheet` emite `fechar` com Esc e com `popstate`, e o foco inicial fica dentro do dialog; o `nb-logo` tem o ponto com a classe `text-brand`.
- [ ] **Passo 2:** rodar. Esperado: FAIL.
- [ ] **Passo 3:** implementar seguindo o `DESIGN.md` (sombras, raios e estados com `scale(0.98)` no toque).
- [ ] **Passo 4:** rodar. Esperado: PASS.
- [ ] **Passo 5:** commit `feat(U-00.7): adiciona componentes base de UI`.

### Tarefa 6: casca do app e navegação inferior

**Arquivos:** criar `web/src/app/shell/shell.component.ts`, `shared/ui/bottom-nav/*`, `core/novo-lancamento.ts`; rotas em `app.routes.ts`

**Interfaces:**
- Produz:
  - rotas `/inicio`, `/caixinhas`, `/perfil` (placeholders), filhas de `ShellComponent`; `''` redireciona para `/inicio`
  - `NovoLancamentoService { aberto: Signal<boolean>; emEdicao: Signal<string|null>; abrir(id?: string): void; fechar(): void }`. A spec 02 pluga o sheet aqui.
  - `<nb-bottom-nav>`: Início, Caixinhas, botão central "+" (`aria-label="Novo lançamento"`), Perfil, com `aria-current="page"` no ativo

- [ ] **Passo 1:** testes: a navegação marca `aria-current` na rota ativa; clicar em "+" chama `NovoLancamentoService.abrir()`; o "+" tem nome acessível "Novo lançamento".
- [ ] **Passo 2:** rodar. Esperado: FAIL.
- [ ] **Passo 3:** implementar (nav fixa no rodapé com `pb-safe`, "+" elevado com sombra nível 3).
- [ ] **Passo 4:** rodar. Esperado: PASS.
- [ ] **Passo 5:** commit `feat(U-00.4): adiciona casca com navegação inferior`.

### Tarefa 7: Playwright, helpers de usabilidade e checagem do bundle

**Arquivos:** criar `web/playwright.config.ts`, `web/e2e/support/{usabilidade,usuarios,mailpit}.ts`, `web/e2e/00-fundacao.spec.ts`; serviço `e2e` (profile `test`, imagem `mcr.microsoft.com/playwright` na mesma versão do pacote)

**Interfaces:**
- Produz (para todas as specs):
  - projetos `celular-360` (360×740) e `celular-390` (390×844), `locale: 'pt-BR'`, `timezoneId: 'America/Sao_Paulo'`
  - `expectAlvosDeToque(page, minPx = 44)`: todo `button, a, [role=button], input, [role=tab]` visível tem caixa ≥ 44×44
  - `expectSemRolagemHorizontal(page)`: `scrollWidth <= clientWidth`
  - `expectNaZonaDoPolegar(page, locator)`: topo do elemento ≥ 60% da altura da viewport
  - `expectSemViolacoesAxe(page)`: axe com tags `wcag2a, wcag2aa, wcag21aa, wcag22aa` e zero violações
  - `contadorDeToques(page): { clicar(l: Locator): Promise<void>; total(): number }`
  - `criarUsuario(dados?): Promise<{ id, email, senha, nome }>`: usa a admin API com `SUPABASE_SERVICE_ROLE_KEY` **do ambiente do runner**, já confirmado e com `user_metadata: { nome, aceite_versao: '2026-11' }`
  - `entrarComo(page, usuario)`; `ultimoEmail(para: string): Promise<{ assunto, html, links: string[] }>` (API do Mailpit)

- [ ] **Passo 1:** `00-fundacao.spec.ts`: o teste `U-00.1/U-00.2/U-00.3 casca acessível` abre `/inicio` (ainda sem guarda) e aplica os quatro `expect*`. O teste `U-00.4 "+" na zona do polegar` usa `expectNaZonaDoPolegar` no botão "Novo lançamento". O teste `R-00.6 bundle sem service_role` faz o build e garante que nenhum arquivo de `dist/` contém o valor de `SUPABASE_SERVICE_ROLE_KEY` nem a string `service_role`.
- [ ] **Passo 2:** `docker compose --profile test run --rm e2e npx playwright test e2e/00-fundacao.spec.ts`. Esperado: FAIL (helpers ausentes).
- [ ] **Passo 3:** implementar a config e os helpers; o `webServer` aponta para o serviço `web`.
- [ ] **Passo 4:** rodar de novo. Esperado: PASS nos dois projetos. Se o axe acusar contraste, corrigir o token, não o teste.
- [ ] **Passo 5:** commit `test(U-00.1): adiciona Playwright com helpers de usabilidade`.

### Tarefa 8: agentes e matriz de rastreabilidade

**Arquivos:** criar `.claude/agents/{arquiteto,dev,testes,ui-ux}.md`, `docs/rastreabilidade.md`; atualizar `docs/ai/registro-ia.md`

- [ ] **Passo 1:** cada agente com frontmatter (`name`, `description` dizendo quando acioná-lo, `tools`) e corpo com o papel, o que **não** faz (tabela da spec 00), as specs que deve ler, a regra de registrar no `registro-ia.md` (entrada curta, sem prompt bruto) e o fluxo arquiteto → testes → dev → ui-ux → testes. `arquiteto` e `ui-ux` sem `Edit` no código de `web/src/app/features`; `testes` sem permissão de editar código fora de `*.spec.ts`, `e2e/` e `supabase/tests/`.
- [ ] **Passo 2:** `docs/rastreabilidade.md` como tabela `ID | Requisito (curto) | Teste(s) | Status`, preenchida com todos os IDs das specs 00 a 05 (status `pendente`) e os testes desta fundação já ligados.
- [ ] **Passo 3:** verificar com `grep -c '^| [RU]-' docs/rastreabilidade.md`: o resultado deve ser igual ao número de IDs nas specs (`grep -ho '[RU]-0[0-5]\.[0-9]\+' docs/specs/*.md | sort -u | wc -l`).
- [ ] **Passo 4:** commit `docs: adiciona agentes e matriz de rastreabilidade`.
