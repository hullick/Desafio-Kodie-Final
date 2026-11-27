# Plan 00: Fundação

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para executar tarefa por tarefa. Passos em checkbox (`- [ ]`).

**Objetivo:** ambiente local isolado (Postgres + Netlify CLI + Angular PWA + runners de teste) subindo com `docker compose up`, com a base de API, de UI, de testes e de usabilidade de que as specs 01 a 05 dependem.

**Arquitetura:** monorepo com `docker-compose.yml` e `netlify.toml` na raiz; `db/` (migrações SQL e testes pgTAP); `netlify/functions/` (a API, uma function por recurso) e `netlify/lib/` (conexão, sessão e helpers compartilhados); `web/` (Angular standalone + PWA, Tailwind, Vitest, Playwright). O front só fala com a API por repositórios que implementam as classes abstratas de `core/dados/`. As functions só tocam dados de domínio dentro de `comUsuario`, que liga a sessão ao RLS.

**Stack:** Docker Compose, Postgres 17, Netlify CLI (`netlify dev`), Netlify Functions (Node, TypeScript), `pg`, Mailpit, Angular (CLI atual) + `@angular/pwa`, Tailwind CSS, Vitest, Playwright, `@axe-core/playwright`, pgTAP. Better Auth entra no plan 01.

**Spec:** `docs/specs/00-fundacao.md` · **Decisão:** `docs/adr/0001-backend-netlify.md`

## Restrições globais

- Branch de trabalho: `feature/00-fundacao`, saindo de `develop`. Commits `tipo(ID): mensagem` em pt-BR.
- Dinheiro em centavos inteiros; exibição `R$ 1.234,56` via `Intl.NumberFormat('pt-BR', {style:'currency', currency:'BRL'})`.
- Mês calculado em `America/Sao_Paulo`.
- `DATABASE_URL`, `BETTER_AUTH_SECRET` e credenciais de SMTP nunca entram em `web/src` nem no bundle (R-00.6).
- Toda tabela em `public` tem RLS habilitado (R-00.1). As functions conectam como `nubanko_app` (sem `BYPASSRLS`, não é dono das tabelas); as migrações rodam como `nubanko_owner`.
- Toda function de domínio usa `comUsuario` (R-00.1). A API nunca aceita `user_id` no corpo.
- Respostas de erro da API: JSON `{ "erro": "<codigo>" }` com o status HTTP certo (`400`, `401`, `404`, `409`); nunca a mensagem crua do Postgres.
- Fontes Inter e Manrope **auto-hospedadas** (`@fontsource/*`), sem Google Fonts, para não ter terceiros (R-00.5).
- Viewports Playwright: 360×740 e 390×844.
- Cobertura mínima do front: 80% de linhas e branches.
- Texto sobre `#01CED1` é `#1A1A1A`.
- Ao terminar cada tarefa, adicionar uma linha em `docs/ai/registro-ia.md`.

## Foco de revisão

- Subir o compose duas vezes seguidas: migrações já aplicadas não podem reaplicar nem quebrar (o `migrate` é idempotente).
- Tabela criada sem RLS numa spec futura: o teste `00_rls_obrigatoria` tem de falhar sozinho, sem ninguém lembrar de escrevê-lo.
- Function nova sem `comUsuario`: o guarda estático tem de falhar sozinho.
- `app.user_id` vazando entre requisições: a function reaproveita a conexão entre invocações "quentes", então o `set_config` é sempre **local à transação** (`true` no terceiro argumento).
- `.env` ausente: o compose deve falhar com mensagem clara, não subir com segredo vazio.
- `/api/qualquer-coisa` inexistente devolve `404` em JSON, não o `index.html` do fallback de SPA.
- Valores de 0 centavos e negativos em `formatBRL` (`R$ 0,00`, `-R$ 12,34`).
- Virada de mês à meia-noite em São Paulo quando o UTC já é o dia seguinte (`mesAtual` às 22h de 30/11 em SP continua novembro).

## Estrutura de arquivos

```
docker-compose.yml            .env.example              netlify.toml
package.json                  (dependências das functions e netlify-cli)
docker/db/00_papeis.sql       (cria nubanko_owner e nubanko_app)
docker/migrate/migrate.sh     docker/pgtap/Dockerfile   docker/pgtap/run.sh
docker/app/Dockerfile         scripts/smoke.sh
db/migrations/                db/tests/_helpers.sql     db/tests/00_rls_obrigatoria.test.sql
netlify/lib/{db,com-usuario,http}.ts
netlify/functions/saude.mts   netlify/functions/_guarda.spec.ts
web/                          (app Angular; ver tarefas 4 a 8)
.claude/agents/{arquiteto,dev,testes,ui-ux}.md
docs/rastreabilidade.md
```

---

### Tarefa 1: Postgres local no Docker Compose

**Arquivos:** criar `docker-compose.yml`, `.env.example`, `docker/db/00_papeis.sql`, `docker/migrate/migrate.sh`, `scripts/smoke.sh`

**Interfaces:**
- Produz: Postgres em `localhost:54322` (superusuário `postgres`, só para administração local); papéis `nubanko_owner` (dono do schema, usado pelas migrações) e `nubanko_app` (`login`, `nobypassrls`, só `usage` nos schemas e os grants que cada migração der); schema `app` com a função `app.usuario_id() returns text` (`nullif(current_setting('app.user_id', true), '')`, `stable`); Mailpit UI/API em `localhost:8025`; rede `nubanko`; variáveis `POSTGRES_PASSWORD`, `DATABASE_URL` (como `nubanko_app`), `DATABASE_URL_MIGRACOES` (como `nubanko_owner`).

- [ ] **Passo 1:** escrever `scripts/smoke.sh`. Ele falha (exit ≠ 0) se qualquer check falhar: `psql "$DATABASE_URL" -c 'select 1'`; `psql "$DATABASE_URL" -c 'select app.usuario_id()'` retorna nulo; `GET localhost:8025/api/v1/messages` → 200.
- [ ] **Passo 2:** rodar `./scripts/smoke.sh`. Esperado: FAIL (nada no ar).
- [ ] **Passo 3:** compose com `db` (`postgres:17`, healthcheck `pg_isready`, volume nomeado `nubanko-db`, `docker/db/` montado em `/docker-entrypoint-initdb.d`), `mail` (`axllent/mailpit`) e `migrate`. Usar `${VAR:?defina VAR no .env}` em todo segredo. O `.env.example` traz senhas de desenvolvimento com o comentário `# SOMENTE DESENVOLVIMENTO`.
- [ ] **Passo 4:** escrever `docker/migrate/migrate.sh`. Ele recebe a URL por `DATABASE_URL_MIGRACOES` (o mesmo script roda no GitHub Actions contra o Netlify DB), cria `public._migracoes(nome text primary key, aplicada_em timestamptz default now())`, aplica em ordem alfabética cada `db/migrations/*.sql` ausente da tabela (cada um em transação, com `psql -v ON_ERROR_STOP=1`) e registra o nome. O serviço `migrate` depende de `db` saudável e encerra no fim. **Exceção:** `_migracoes` é interna, sem acesso por `nubanko_app` (`revoke all`); a tarefa 2 a trata como exceção explícita.
- [ ] **Passo 5:** `cp .env.example .env && docker compose up -d db mail migrate && ./scripts/smoke.sh`. Esperado: todos os checks OK. Rodar `docker compose up -d` de novo e o smoke de novo. Esperado: OK, `migrate` sem reaplicar nada.
- [ ] **Passo 6:** commit `chore(R-00.1): sobe Postgres local isolado via docker compose`.

### Tarefa 2: runner pgTAP e guarda de RLS

**Arquivos:** criar `docker/pgtap/Dockerfile`, `docker/pgtap/run.sh`, `db/tests/_helpers.sql`, `db/tests/00_rls_obrigatoria.test.sql`; serviço `dbtest` (profile `test`) no compose

**Interfaces:**
- Produz: o comando `docker compose --profile test run --rm dbtest [arquivos...]` (sem argumentos, roda `db/tests/*.test.sql`). Helpers no schema `tests`:
  - `tests.criar_usuario(email text, nome text default 'Teste', aceite_versao text default '2026-11') returns text`: insere em `auth."user"` (tabela criada no plan 01; até lá, o helper existe mas só é usado a partir dele)
  - `tests.autenticar_como(uid text)`: `set local role nubanko_app` + `select set_config('app.user_id', uid, true)`
  - `tests.anonimo()`: `set local role nubanko_app` + `select set_config('app.user_id', '', true)`
  - `tests.resetar()`: `reset role`

- [ ] **Passo 1:** escrever `00_rls_obrigatoria.test.sql`. Para cada tabela em `public`, exceto `_migracoes`, o teste exige `relrowsecurity = true` **e** `relforcerowsecurity = true` (o RLS vale até para o dono). Inclui um teste negativo que cria, dentro da transação, `public._teste_sem_rls(id int)` e verifica que a consulta do guarda a aponta (o teste então dá rollback). Inclui também: `nubanko_app` não tem `rolbypassrls` nem é dono de nenhuma tabela de `public`.
- [ ] **Passo 2:** rodar `dbtest`. Esperado: FAIL (runner inexistente).
- [ ] **Passo 3:** `Dockerfile` baseado em `postgres:17` com `postgresql-17-pgtap`, `perl` e `pg_prove`. O `run.sh` cria `extension pgtap`, aplica `_helpers.sql` e roda `pg_prove -h db -U postgres` nos arquivos.
- [ ] **Passo 4:** rodar `dbtest`. Esperado: PASS.
- [ ] **Passo 5:** commit `test(R-00.1): adiciona runner pgTAP e guarda de RLS obrigatória`.

### Tarefa 3: Netlify local, `comUsuario` e guarda das functions

**Arquivos:** criar `netlify.toml`, `package.json` (raiz), `docker/app/Dockerfile`, `netlify/lib/db.ts`, `netlify/lib/com-usuario.ts`, `netlify/lib/http.ts`, `netlify/functions/saude.mts`, `netlify/functions/_guarda.spec.ts` + specs ao lado; serviço `app` no compose

**Interfaces:**
- Produz:
  - `netlify.toml`: `[build] command = "npm ci --prefix web && npm run build --prefix web"`, `publish = "web/dist/web/browser"`, `functions = "netlify/functions"`; `[dev] command = "npm start --prefix web"`, `targetPort = 4200`, `port = 8888`; fallback de SPA `/* → /index.html 200`; headers `Strict-Transport-Security` e `Content-Security-Policy` (`default-src 'self'`) para todas as rotas.
  - serviço `app`: Node LTS, monta o repositório, roda `npx netlify dev --port 8888 --no-open` (sem login: `netlify dev` funciona offline), depende de `db` e `mail`, expõe `localhost:8888`.
  - `db.ts`: `pool` do `pg` criado uma vez por instância (fora do handler), com `DATABASE_URL`; em produção usa a URL **pooled** do Neon com `ssl: { rejectUnauthorized: true }`.
  - `type ObterSessao = (req: Request) => Promise<{ usuarioId: string } | null>`; o plan 01 fornece a implementação com o Better Auth.
  - `comUsuario<T>(req: Request, fn: (db: PoolClient, usuarioId: string) => Promise<T>, obterSessao?: ObterSessao): Promise<T>`: sem sessão, lança `ErroHttp(401, 'nao_autenticado')`; com sessão, `begin`, `select set_config('app.user_id', $1, true)`, `fn`, `commit` (ou `rollback` e relança) e sempre devolve a conexão ao pool.
  - `http.ts`: `json(dados, status = 200)`, `ErroHttp(status, codigo)`, `tratar(handler)` (converte `ErroHttp` e erros do Postgres com `raise exception '<codigo>'` em `{ erro: codigo }`; outros erros viram `500` sem detalhes) e `lerCorpo(req, campos)` (rejeita `user_id` e campos desconhecidos com `400`).
  - `saude.mts`: `GET /api/saude` → `{ ok: true }` (sem `comUsuario`; verifica `select 1`).

- [ ] **Passo 1:** testes (Vitest na raiz, rodando contra o `db` do compose):
  - `comUsuario` sem sessão lança `401` e não abre transação;
  - com sessão, `select app.usuario_id()` dentro de `fn` devolve o id; **depois** do `commit`, a mesma conexão devolve nulo (o `set_config` é local);
  - erro dentro de `fn` faz `rollback` e a conexão volta ao pool;
  - `tratar` converte `raise exception 'saldo_insuficiente'` em `409 { erro: 'saldo_insuficiente' }` e um erro qualquer em `500 { erro: 'interno' }`;
  - `lerCorpo` com `user_id` no corpo dá `400`;
  - `_guarda.spec.ts`: todo arquivo de `netlify/functions/*.mts`, exceto `auth.mts` e `saude.mts`, importa e chama `comUsuario`; um arquivo de exemplo sem `comUsuario` criado no teste é apontado.
- [ ] **Passo 2:** `docker compose run --rm app npx vitest run netlify`. Esperado: FAIL.
- [ ] **Passo 3:** implementar.
- [ ] **Passo 4:** rodar de novo. Esperado: PASS. Depois, `docker compose up -d app` e: `curl localhost:8888/api/saude` → `{"ok":true}`; `curl -i localhost:8888/api/nao-existe` → `404` com JSON, não HTML. Incluir os dois checks no `scripts/smoke.sh`.
- [ ] **Passo 5:** commit `feat(R-00.1): adiciona base das functions com sessão ligada ao RLS`.

### Tarefa 4: app Angular PWA com tokens do design system

**Arquivos:** criar `web/` (via `npx @angular/cli@latest new web --standalone --routing --style=css --ssr=false`), `web/src/styles.css`, `web/src/environments/*`

**Interfaces:**
- Produz: `environment.apiUrl` (`/api`), `environment.versao` (lida de `package.json` no build); tokens Tailwind (`brand` `#01CED1`, `brand-dark` `#00A3A6`, `brand-light` `#E6FAFA`, `ink` `#1A1A1A`, `muted` `#6B7280`, `canvas` `#F7F8FA`, `gold` `#FFE08F`, `pos` `#16A34A`, `neg` `#E5484D`, `line` `#EEF0F4`; raios `lg` 16px, `xl` 24px; fontes `font-display` Manrope, `font-sans` Inter); classe utilitária `.tabular` (`font-variant-numeric: tabular-nums`).

- [ ] **Passo 1:** teste `app.spec.ts` que valida o manifest `public/manifest.webmanifest`, com `name: "NuBanko"`, `lang: "pt-BR"`, `theme_color: "#01CED1"`, `display: "standalone"`.
- [ ] **Passo 2:** `cd web && npx ng test --watch=false`. Esperado: FAIL.
- [ ] **Passo 3:** `ng add @angular/pwa`, Tailwind, `@fontsource/inter` e `@fontsource/manrope`, Vitest com cobertura (thresholds 80 em `lines` e `branches`); `<html lang="pt-BR">`. O `ng serve` é iniciado pelo `netlify dev` do serviço `app` (tarefa 3); fora do Docker, `npx netlify dev` na raiz faz o mesmo.
- [ ] **Passo 4:** `npx ng test --watch=false` e `npx ng build`. Esperado: PASS e build sem erros. `docker compose up -d app` abre o app em `localhost:8888`.
- [ ] **Passo 5:** commit `chore: cria app Angular PWA com tokens do design system`.

### Tarefa 5: núcleo (cliente da API, dinheiro, mês)

**Arquivos:** criar `web/src/app/core/api.ts`, `core/money.ts`, `core/mes.ts` e os `.spec.ts` ao lado

**Interfaces:**
- Produz:
  - `API_URL: InjectionToken<string>` (de `environment.apiUrl`); `ErroApi { status: number; codigo: string }`, convertido de `{ erro }` por um interceptor do `HttpClient`; `401` em qualquer chamada leva a `/entrar?returnUrl=<rota atual>`
  - `formatBRL(centavos: number): string`. Usa NBSP entre `R$` e o número, como o `Intl`.
  - `type Mes = { ano: number; mes: number }` (mes 1–12)
  - `mesAtual(agora?: Date): Mes`; `hojeISO(agora?: Date): string` (`YYYY-MM-DD` em SP)
  - `rotuloMes(m: Mes): string` → `"Novembro 2026"`; `rotuloMesCurto(m: Mes): string` → `"nov/2026"`
  - `somarMeses(m: Mes, n: number): Mes`; `compararMes(a: Mes, b: Mes): -1|0|1`; `mesesInclusivos(de: Mes, ate: Mes): number` (0 se `ate < de`)

- [ ] **Passo 1:** testes:
```ts
expect(formatBRL(123456)).toBe('R$ 1.234,56');
expect(formatBRL(0)).toBe('R$ 0,00');
expect(formatBRL(-1234)).toBe('-R$ 12,34');
expect(mesAtual(new Date('2026-12-01T01:00:00Z'))).toEqual({ ano: 2026, mes: 11 }); // 22h em SP
expect(hojeISO(new Date('2026-12-01T01:00:00Z'))).toBe('2026-11-30');
expect(rotuloMes({ ano: 2026, mes: 11 })).toBe('Novembro 2026');
expect(somarMeses({ ano: 2026, mes: 12 }, 1)).toEqual({ ano: 2027, mes: 1 });
expect(mesesInclusivos({ ano: 2026, mes: 11 }, { ano: 2027, mes: 3 })).toBe(5);
expect(mesesInclusivos({ ano: 2026, mes: 11 }, { ano: 2026, mes: 10 })).toBe(0);
```
  E, com `HttpTestingController`: uma resposta `409 { erro: 'saldo_insuficiente' }` vira `ErroApi(409, 'saldo_insuficiente')`; um `401` navega para `/entrar` com o `returnUrl`.
- [ ] **Passo 2:** rodar. Esperado: FAIL.
- [ ] **Passo 3:** implementar com `Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' })`; `rotuloMes` com a primeira letra maiúscula.
- [ ] **Passo 4:** rodar. Esperado: PASS.
- [ ] **Passo 5:** commit `feat(R-00.1): adiciona núcleo de dinheiro, mês e cliente da API`.

### Tarefa 6: componentes base de UI

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

### Tarefa 7: casca do app e navegação inferior

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

### Tarefa 8: Playwright, helpers de usabilidade e checagem do bundle

**Arquivos:** criar `web/playwright.config.ts`, `web/e2e/support/{usabilidade,usuarios,mailpit}.ts`, `web/e2e/00-fundacao.spec.ts`; serviço `e2e` (profile `test`, imagem `mcr.microsoft.com/playwright` na mesma versão do pacote)

**Interfaces:**
- Produz (para todas as specs):
  - projetos `celular-360` (360×740) e `celular-390` (390×844), `locale: 'pt-BR'`, `timezoneId: 'America/Sao_Paulo'`, `baseURL` = serviço `app` (porta 8888)
  - `expectAlvosDeToque(page, minPx = 44)`: todo `button, a, [role=button], input, [role=tab]` visível tem caixa ≥ 44×44
  - `expectSemRolagemHorizontal(page)`: `scrollWidth <= clientWidth`
  - `expectNaZonaDoPolegar(page, locator)`: topo do elemento ≥ 60% da altura da viewport
  - `expectSemViolacoesAxe(page)`: axe com tags `wcag2a, wcag2aa, wcag21aa, wcag22aa` e zero violações
  - `contadorDeToques(page): { clicar(l: Locator): Promise<void>; total(): number }`
  - `criarUsuario(dados?): Promise<{ id, email, senha, nome }>`: cadastra pela API (`/api/auth/sign-up/email`) e confirma o e-mail abrindo o link de `ultimoEmail`. Disponível a partir do plan 01
  - `entrarComo(page, usuario)`; `ultimoEmail(para: string): Promise<{ assunto, html, links: string[] }>` (API do Mailpit)

- [ ] **Passo 1:** `00-fundacao.spec.ts`: o teste `U-00.1/U-00.2/U-00.3 casca acessível` abre `/inicio` (ainda sem guarda) e aplica os quatro `expect*`. O teste `U-00.4 "+" na zona do polegar` usa `expectNaZonaDoPolegar` no botão "Novo lançamento". O teste `R-00.6 bundle sem segredos` faz o build e garante que nenhum arquivo de `dist/` contém os valores de `DATABASE_URL`, `BETTER_AUTH_SECRET` e `SMTP_PASS` do ambiente, nem as strings `postgres://` e `postgresql://`. O teste `R-00.3 headers de segurança` confere `Strict-Transport-Security` e `Content-Security-Policy` na resposta de `/`.
- [ ] **Passo 2:** `docker compose --profile test run --rm e2e npx playwright test e2e/00-fundacao.spec.ts`. Esperado: FAIL (helpers ausentes).
- [ ] **Passo 3:** implementar a config e os helpers; o `webServer` aponta para o serviço `app`.
- [ ] **Passo 4:** rodar de novo. Esperado: PASS nos dois projetos. Se o axe acusar contraste, corrigir o token, não o teste.
- [ ] **Passo 5:** commit `test(U-00.1): adiciona Playwright com helpers de usabilidade`.

### Tarefa 9: agentes e matriz de rastreabilidade

**Arquivos:** criar `.claude/agents/{arquiteto,dev,testes,ui-ux}.md`, `docs/rastreabilidade.md`; atualizar `docs/ai/registro-ia.md`

- [ ] **Passo 1:** cada agente com frontmatter (`name`, `description` dizendo quando acioná-lo, `tools`) e corpo com o papel, o que **não** faz (tabela da spec 00), as specs que deve ler, a regra de registrar no `registro-ia.md` (entrada curta, sem prompt bruto) e o fluxo arquiteto → testes → dev → ui-ux → testes. `arquiteto` e `ui-ux` sem `Edit` no código de `web/src/app/features`; `testes` sem permissão de editar código fora de `*.spec.ts`, `e2e/` e `db/tests/`.
- [ ] **Passo 2:** `docs/rastreabilidade.md` como tabela `ID | Requisito (curto) | Teste(s) | Status`, preenchida com todos os IDs das specs 00 a 05 (status `pendente`) e os testes desta fundação já ligados.
- [ ] **Passo 3:** verificar com `grep -c '^| [RU]-' docs/rastreabilidade.md`: o resultado deve ser igual ao número de IDs nas specs (`grep -ho '[RU]-0[0-5]\.[0-9]\+' docs/specs/*.md | sort -u | wc -l`).
- [ ] **Passo 4:** commit `docs: adiciona agentes e matriz de rastreabilidade`.
