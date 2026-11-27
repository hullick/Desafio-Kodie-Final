# NuBanko: guia de desenvolvimento

Tudo o que você precisa para rodar, entender e mudar o app. Leia de cima para baixo na primeira vez; depois use o índice.

- [1. Começo rápido](#1-começo-rápido)
- [2. Comandos](#2-comandos)
- [3. O que já existe e o que falta](#3-o-que-já-existe-e-o-que-falta)
- [4. Arquitetura](#4-arquitetura)
- [5. Como os dados chegam na tela](#5-como-os-dados-chegam-na-tela)
- [6. Receitas: como fazer as tarefas comuns](#6-receitas-como-fazer-as-tarefas-comuns)
- [7. Testes](#7-testes)
- [8. Convenções de código](#8-convenções-de-código)
- [9. Regras de negócio que todo mundo precisa saber](#9-regras-de-negócio-que-todo-mundo-precisa-saber)
- [10. Git, commits e registro de IA](#10-git-commits-e-registro-de-ia)
- [11. Decisões já tomadas](#11-decisões-já-tomadas)
- [12. Problemas comuns](#12-problemas-comuns)
- [13. Ambiente com Docker Compose](#13-ambiente-com-docker-compose)
- [14. Deploy na Netlify](#14-deploy-na-netlify)

**O que é o NuBanko:** um app (PWA) de controle financeiro para jovens de 18 a 24 anos no primeiro salário ou estágio. Três funções: registrar gastos e entradas em poucos toques, juntar dinheiro em **caixinhas** (metas) e ver o **painel do mês**.

**Onde está cada coisa fora do código:**

| Pasta | O que tem |
|-------|-----------|
| `docs/specs/` | O **quê** e o **porquê** de cada funcionalidade, com requisitos `R-xx.n` e critérios de usabilidade `U-xx.n`. Comece pelo `README.md` dela. |
| `docs/plans/` | O **como**: tarefas de implementação de cada spec. |
| `docs/ai/registro-ia.md` | Registro do que foi pedido a ferramentas de IA. |
| `design/` | Mockups (`screen.png`) e o design system (`nubanko_neo_fintech/DESIGN.md`). |
| `web/` | O app Angular. |

> **Regra de ouro:** quando o mockup e a spec discordam, vale a spec. A lista de divergências está em `docs/specs/README.md`.

---

## 1. Começo rápido

**Pré-requisitos:** Node 26 e npm 11 (é o que o projeto usa hoje: `node -v`, `npm -v`).

**App completo, com a API real:** suba o Docker Compose ([seção 13](#13-ambiente-com-docker-compose)) e abra **http://localhost:8888**. Crie uma conta em "Criar conta"; cada conta só vê os próprios dados.

**Só as telas, sem backend (dados de demonstração):**

```bash
cd web
npm install
npm run start:demo
```

Abra **http://localhost:4200**. O app recarrega sozinho quando você salva um arquivo. (`npm start` sozinho usa a API real e precisa do compose.)

**Ver no celular:** rode `npx ng serve --host 0.0.0.0` e abra `http://<ip-do-seu-computador>:4200` no celular, na mesma rede Wi-Fi.

**Ver como celular no computador:** abra as DevTools (F12) e ligue a visualização de dispositivo com largura **360 px** e altura **740 px**. Esse é o aparelho de referência das specs.

**Login na demonstração:** o `start:demo` abre **já logado** como a Lari, a persona, com dados de exemplo iguais aos dos mockups (saldo de R$ 642,30). Se sair, entre com `lari@exemplo.com` e **qualquer** senha. Os dados ficam em memória: recarregar a página volta tudo ao início.

---

## 2. Comandos

Rode dentro de `web/`.

| Comando | Para quê |
|---------|----------|
| `npm start` | Servidor de desenvolvimento em `localhost:4200` |
| `npx ng serve --host 0.0.0.0` | Mesmo servidor, acessível pelo celular na rede |
| `npm test` | Testes unitários e de componente (Vitest) em modo observação |
| `npx ng test --watch=false` | Roda os testes uma vez e sai (use antes de commitar) |
| `npx ng test --watch=false --coverage` | Testes com cobertura; **falha abaixo de 80%** (relatório HTML em `web/coverage/`) |
| `npx ng test --watch=false --include='src/app/ui/organisms/**/*.spec.ts'` | Roda só uma parte dos testes |
| `npm run build` | Build de produção em `web/dist/web` (já com service worker de PWA) |

---

## 3. O que já existe e o que falta

**Pronto:**
- Front: Início (painel do mês), Lançamentos ("Ver todos"), Caixinhas, Nova/Editar caixinha, Detalhe da caixinha, Perfil, Seus dados, Privacidade, Entrar e Cadastro; sheets de lançamento e de guardar/retirar.
- API em `/api/*` (contrato em `docs/api/openapi.yaml`): Better Auth em `/api/auth/*` (cadastro sem confirmação de e-mail, login, sessão, saída, redefinição e troca de senha, exclusão de conta, rate limit) e as functions de lançamentos, resumo, caixinhas e perfil, todas com `comUsuario` + RLS.
- Textos das pessoas cifrados no banco (seção 13.8).
- Repositórios HTTP no front (`core/dados/http/`), com guarda de rota que consulta a sessão e interceptor que leva ao login quando ela expira.
- Telas de esqueci a senha, nova senha, alterar senha e excluir conta.
- Testes: pgTAP do banco, integração das functions, unidade/componente do front e E2E com Playwright (com axe) nos dois tamanhos de tela (seção 7.1).

**Ainda não existe:**

| Falta | Onde está planejado |
|-------|---------------------|
| CI no GitHub Actions (testes e migrações automáticas antes do deploy) | Spec 00, "Hospedagem e deploy". Hoje o deploy é da Netlify (seção 14) e as migrações rodam com `scripts/preparar-banco-netlify.sh` |
| Fechar o sheet com o botão voltar do Android (U-02.6). Hoje fecha com Esc e com toque no fundo. | Plan 02 |
| Os 4 agentes e a matriz de rastreabilidade | Plan 00, tarefa 9 |

---

## 4. Arquitetura

### 4.1 A ideia em uma frase

As telas são montadas com **Atomic Design** (peças pequenas que se combinam em peças maiores), e cada página tem um **facade**: o serviço que busca os dados e entrega tudo pronto para exibir. Os componentes visuais **não sabem** de onde vêm os dados.

```
                        ┌─────────────────────────────────────────┐
  Rota (/caixinhas) ──▶ │ Página  (pages/caixinhas/*.page.ts)     │  só compõe a tela
                        │   └─ Facade (*.facade.ts)               │  busca, calcula, age
                        └──────────────┬──────────────────────────┘
                                       │ usa
              ┌────────────────────────┼────────────────────────────┐
              ▼                        ▼                            ▼
   UI (ui/)                      Núcleo (core/)                Mapeadores
   templates                     repositórios (contratos)      (pages/compartilhado)
     └ organismos                cálculos puros                domínio ──▶ view model
         └ moléculas             estado global (signals)
             └ átomos            formatação, datas
```

### 4.2 Pastas

```
web/src/
├── app/
│   ├── core/                  Núcleo: nada visual. Não importa nada de ui/ nem de pages/.
│   │   ├── dominio/           Tipos (Lancamento, Caixinha…), categorias, ícones
│   │   ├── calculos/          Regras puras: saldo, meta, senha, teclado numérico
│   │   ├── formatacao/        Dinheiro (R$ 1.234,56), percentual, nomes
│   │   ├── tempo/             Mês, datas, fuso de São Paulo
│   │   ├── dados/             Contratos dos repositórios + implementação em memória
│   │   ├── estado/            Estado global com signals (toast, sheets, preferências…)
│   │   └── sessao/            Guarda de rotas
│   ├── ui/                    Design system: só apresentação, sem serviços de dados
│   │   ├── atoms/             Menores peças: botão, ícone, valor, campo, barra…
│   │   ├── molecules/         Combinações pequenas: teclado, chip de categoria, item de lançamento…
│   │   ├── organisms/         Seções inteiras: card do saldo, formulário de caixinha, navegação…
│   │   ├── templates/         Esqueletos de página com slots: casca, login, tela interna
│   │   └── modelos.ts         View models: o formato dos dados que a UI recebe
│   ├── pages/                 Uma pasta por tela: <nome>.page.ts + <nome>.facade.ts
│   │   ├── compartilhado/     Mapeadores domínio → view model, seletor de mês
│   │   └── shell/             Casca das abas logadas (topo, navegação, sheets, toast)
│   ├── app.routes.ts          Rotas (todas carregadas sob demanda)
│   └── app.config.ts          Providers globais (aqui se escolhe memória ou API)
├── testing/                   Helpers de teste
└── styles.css                 Tokens do design system (cores, fontes, sombras)
```

### 4.3 As camadas e suas regras

| Camada | Pode usar | Não pode | Exemplo |
|--------|-----------|----------|---------|
| **Átomo** | Outros átomos, `core/formatacao`, `core/dominio` | Serviços, repositórios, router | `nb-valor` mostra `R$ 38,50` |
| **Molécula** | Átomos | Serviços de dados | `nb-keypad`, `nb-transaction-item` |
| **Organismo** | Moléculas, átomos, funções puras do `core` | Repositórios, facades, estado global | `nb-lancamento-form` emite `(salvar)` e quem grava é o facade |
| **Template** | Slots (`ng-content`) | Dados | `nb-shell-template` com `[topo]`, `[navegacao]` |
| **Página** | Organismos, templates e o **seu** facade | Chamar repositório direto | `InicioPage` |
| **Facade** | Repositórios, estado global, mapeadores, router | Saber de HTML ou CSS | `InicioFacade` |

**Como saber em que camada um componente vai:**
1. Ele precisa buscar ou gravar dados? É um **facade** (ou parte de um), não um componente.
2. É uma seção com título própria da tela (ex.: "Gastos por categoria")? É um **organismo**.
3. Junta 2 ou 3 peças para um único propósito (ex.: ícone + texto + valor)? É uma **molécula**.
4. Não dá para dividir mais? É um **átomo**.

Cada camada tem um `index.ts` que exporta tudo dela.

### 4.4 Componentes (padrão de todos)

- Standalone, com **signals**: `input()`, `input.required()`, `output()`, `model()`, `computed()`.
- Seletor com prefixo `nb-` (`nb-caixinha-card`). Quando o componente **é** um botão ou link, o seletor é de atributo, para manter a semântica e o teclado nativos: `<button nb-button>`, `<a nb-settings-item>`.
- Template e estilos no próprio `.ts`, estilizados com classes do Tailwind e os tokens de `styles.css` (`bg-brand`, `text-muted`, `rounded-card`, `shadow-n1`…).
- Um spec ao lado de cada arquivo (`caixinha-card.ts` + `caixinha-card.spec.ts`).

---

## 5. Como os dados chegam na tela

### 5.1 O caminho de uma leitura

Exemplo: o painel do mês.

1. A rota `/inicio` carrega `InicioPage`, que declara `providers: [InicioFacade]`. O facade nasce e morre junto com a página.
2. O facade busca os dados com `carregavel(...)` nos repositórios (`ResumoRepositorio`, `LancamentosRepositorio`…).
3. Os **mapeadores** (`pages/compartilhado/mapeadores.ts`) transformam o domínio em **view models** (`ui/modelos.ts`), por exemplo um `Lancamento` em um `TransacaoItemVM` com título, ícone e cor.
4. A página só liga os dados nos organismos: `<nb-balance-card [saldo]="vm.saldo" …>`.

### 5.2 O caminho de uma escrita

Exemplo: registrar um gasto.

1. O "+" da navegação chama `LancamentoSheet.abrir()` (estado global).
2. A casca (`ShellPage`) mostra o sheet com `nb-lancamento-form`.
3. O formulário emite `(salvar)` com os dados. Ele **não** grava nada.
4. `LancamentoSheetFacade.salvar()` grava no repositório, chama `DadosAlterados.notificar()`, mostra o toast e fecha o sheet.
5. Todo facade que lê dados observa `DadosAlterados.versao()`, então o painel se atualiza sozinho, sem recarregar a página (R-03.8).

### 5.3 Peças de estado global (`core/estado/`)

| Peça | Para quê |
|------|----------|
| `carregavel(parametros, carregar)` | Carrega de novo quando os parâmetros mudam. Mantém o valor anterior durante a recarga (a tela não pisca) e descarta respostas atrasadas. Expõe `valor`, `carregando` e `falhou`. |
| `DadosAlterados` | Um contador que sobe a cada escrita. Ler `versao()` dentro dos parâmetros de um `carregavel` faz a tela recarregar. |
| `LancamentoSheet` / `MovimentoSheet` | Abrem e fecham os sheets a partir de qualquer tela. |
| `ToastService` | `mostrar('Gasto registrado')`; o toast some em 3 s. |
| `Preferencias` | "Esconder valores" (o olho), salvo só no aparelho. |

### 5.4 Repositórios: API real ou memória

`core/dados/repositorios.ts` define **classes abstratas** (`LancamentosRepositorio`, `CaixinhasRepositorio`, `ResumoRepositorio`, `PerfilRepositorio`, `SessaoRepositorio`). Facades e guarda dependem só delas.

Há duas implementações, escolhidas em `app.config.ts` por `environment.dados`:

| | Onde | Quando |
|---|---|---|
| HTTP (`proverDadosHttp()`) | `core/dados/http/` | Padrão (`npm start`, build de produção). Chama `/api/*` com o `HttpClient`; o cookie de sessão vai sozinho. |
| Memória (`proverDadosEmMemoria()`) | `core/dados/memoria/` | `npm run start:demo` e os testes de facade. Dados de `semente.ts`. |

Erros da API chegam como `ErroApi { status, codigo, detalhes }` (`core/dados/http/erro-api.ts`). Os que a tela trata têm tipo próprio: `ErroCaixinha('saldo_insuficiente' | 'caixinha_com_saldo' | 'nao_encontrada')` e `ErroSessao('credenciais_invalidas' | 'email_em_uso' | 'senha_fraca' | ...)`. Um `401` numa rota de domínio (sessão expirou) passa pelo `sessaoExpiradaInterceptor`, que leva ao login com `?voltar=`.

### 5.5 O backend

A decisão está em `docs/adr/0001-backend-netlify.md` e o desenho, na spec 00.

```
Navegador ──HTTPS──▶ Netlify ─┬─ /            → web/dist/web/browser (Angular)
                              ├─ /api/auth/*  → netlify/functions/auth.mts (Better Auth)
                              └─ /api/*       → netlify/functions/<recurso>.mts
                                                   └─ comUsuario(req, fn)
                                                        ├─ valida a sessão (senão 401)
                                                        ├─ begin; set_config('app.user_id', id, true)
                                                        └─ queries como nubanko_app ──▶ Postgres (RLS)
```

- **Toda function de domínio usa `comUsuario`.** Um teste falha se alguma não usar.
- **O RLS continua ligado** como segunda camada: mesmo que uma query esqueça o `where user_id`, o banco só devolve as linhas do usuário da transação.
- **A API nunca aceita `user_id` no corpo**: o banco preenche com `app.usuario_id()`.
- **Textos das pessoas são cifrados** antes do banco (seção 13.8), e o banco recusa texto em claro nessas colunas.
- **Contrato:** `docs/api/openapi.yaml`, com todos os erros de cada rota. Um teste falha se uma rota ficar fora dele.
- Localmente, `docker compose up` sobe `db` (Postgres 17), `migrate`, `mail` (Mailpit) e `app` (`netlify dev` em `localhost:8888`, que já inicia o Angular).

---

## 6. Receitas: como fazer as tarefas comuns

### Criar uma tela nova

1. Leia a spec e os IDs `R-`/`U-` que ela cobre.
2. Crie `pages/<nome>/<nome>.facade.ts`: `@Injectable()` (sem `providedIn`), com os dados expostos como signals e as ações como métodos.
3. Escreva o teste do facade (`<nome>.facade.spec.ts`). Se o facade lê parâmetros da rota, use `abrirRota` (veja a seção 7).
4. Crie `pages/<nome>/<nome>.page.ts` com `providers: [NomeFacade]` e um template que só compõe organismos e templates.
5. Registre a rota em `app.routes.ts` com `loadComponent` e um `title`. Rotas logadas vão dentro de `children` da casca.

### Criar ou mudar um componente visual

1. Escolha a camada (seção 4.3).
2. Comece pelo spec, que deve testar o que a pessoa **vê e faz**: texto, `aria-*`, clique emitindo o output.
3. Use os átomos existentes antes de escrever HTML novo. Precisa de um ícone novo? Adicione o nome em `core/dominio/icones.ts` e o mapeamento Lucide em `ui/atoms/icon/icon.ts`.
4. Exporte no `index.ts` da camada.

### Adicionar uma regra de negócio

Coloque-a como **função pura** em `core/calculos/` (sem Angular), com testes que usam os números da spec. Facades e organismos chamam a função; não repita a conta em outro lugar.

### Mudar os dados de exemplo

Edite `core/dados/memoria/semente.ts`. As datas são relativas a hoje. Alguns testes contam com os números do mockup (R$ 642,30, 41,6%…): rode tudo depois.

---

## 7. Testes

**Política do time:** tudo tem teste. O nome do teste cita o ID que ele cobre, por exemplo `describe('NbBalanceCard (R-03.2, R-03.3)')`.

| Tipo | Ferramenta | Onde |
|------|------------|------|
| Unidade (regras, formatação, datas) | Vitest | `core/**/*.spec.ts` |
| Componente (átomos a templates) | Vitest + TestBed (jsdom) | ao lado de cada componente |
| Facade | Vitest + TestBed + repositórios em memória | `pages/**/*.facade.spec.ts` |
| Banco (regras, RLS com duas pessoas) | pgTAP | `db/tests/` (seção 13) |
| API (functions contra o banco do compose) | Vitest | `netlify/testes/` (seção 13.4) |
| E2E, usabilidade e acessibilidade (axe) | Playwright, contra o app real do compose | `web/e2e/*.e2e.ts` |

### 7.1 E2E com Playwright

Roda no navegador contra o app real em `localhost:8888` (Angular + API + Postgres + Mailpit), em 360×740 e 390×844.

```bash
NUBANKO_RATE_LIMIT=desligado docker compose up -d   # a suíte cria várias contas do mesmo IP
cd web
npx playwright install chromium                      # só na primeira vez
npm run e2e                                          # relatório em web/playwright-report/
docker compose up -d app                             # depois: religa o rate limit
```

- Cada teste cria a própria conta (`cadastrarPelaApi` de `e2e/apoio.ts`, e-mails `@e2e.nubanko.dev`), então os testes não dependem uns dos outros.
- O e-mail de redefinição de senha é lido pela API do Mailpit (`ultimoEmail`).
- `05-acessibilidade.e2e.ts` passa o axe (WCAG 2.1 A/AA) nas telas e falha com qualquer violação séria ou crítica.
- Para apagar as contas de teste do banco local: `docker compose exec db psql -U postgres -d nubanko -c "delete from auth.\"user\" where email like '%@e2e.nubanko.dev'"`.

### Helpers (`web/src/testing/`)

| Helper | Uso |
|--------|-----|
| `renderizar(Componente, inputs, providers)` | Renderiza e devolve `q()`, `qs()`, `texto()`, `definir({...})` (muda inputs e espera) e `instancia`. |
| `texto()` / `textoVisivel(el)` | O texto como um leitor de tela leria, com espaço entre elementos. |
| `limpo(s)` | Troca o espaço especial (NBSP) do `R$ 1,00` por espaço comum, para comparar valores. |
| `estabilizar()` | Roda os efeitos e espera as promises (use depois de mudar dados num teste de facade). |
| `abrirRota(url, rotas, Facade, providers)` | Navega por um `router-outlet` real e devolve o facade da página. **Use sempre que o facade ler `:id` ou query params.** |

Exemplo de teste de facade:

```ts
const { servico: f, router } = await abrirRota(
  '/caixinhas/c3',
  [{ path: 'caixinhas/:id', component: Pagina }],
  CaixinhaDetalheFacade,
  [proverDadosEmMemoria()],
);
expect(f.vm()!.caixinha.nome).toBe('Celular novo');
```

---

## 8. Convenções de código

- **Idioma:** nomes, comentários, mensagens e commits em **português**. Termos do Angular ficam em inglês (`input`, `computed`…).
- **Dinheiro:** sempre em **centavos inteiros** (`number`). Formate só na exibição, com `formatBRL` ou o átomo `nb-valor`. Nunca use `float` para dinheiro.
- **Datas:** strings ISO `YYYY-MM-DD`. "Hoje" é sempre calculado no fuso de **São Paulo** (`hojeISO()`), nunca com `new Date().toISOString()` direto. Mês é `{ ano, mes }` (1 a 12).
- **Acessibilidade (obrigatória):**
  - alvo de toque de pelo menos **44 px** (`min-h-11` ou mais);
  - todo botão só com ícone tem `rotulo` (vira `aria-label`);
  - estado selecionado com `aria-pressed`;
  - erros com `aria-live` e ao lado do campo;
  - mensagens de erro dizem **como corrigir**;
  - erro de campo aparece ao **sair** do campo, não a cada tecla.
- **Contraste:** texto sobre o turquesa claro (`bg-brand`) é escuro (`text-ink`). Texto branco só sobre `brand-dark` ou mais escuro.
- **Textos de segurança:** só o que é verdade. Use "Senha protegida e conexão segura (HTTPS)"; nada de "criptografia ponta a ponta".
- **Coleta mínima:** não peça nem guarde CPF, telefone, endereço ou analytics.

---

## 9. Regras de negócio que todo mundo precisa saber

| Regra | Onde está no código |
|-------|---------------------|
| **Saldo do mês** = entradas − gastos − (guardado − retirado), tudo no mês | `core/calculos/resumo.ts` |
| Percentuais das categorias com 1 casa decimal e somando exatamente 100,0% | `percentuais()` em `resumo.ts` |
| **Valor digitado** preenche da direita para a esquerda em centavos ("1", "2", "5" vira R$ 1,25); a tecla "00" fica no lugar da vírgula | `core/calculos/teclado.ts` |
| **Prazo da caixinha** é uma data (dia, mês e ano), de hoje até 10 anos | `caixinha-form.ts` |
| **Meses restantes** contam do mês de hoje até o mês do prazo, incluindo os dois; prazo antes de hoje é "prazo encerrado" | `core/calculos/meta.ts` |
| **Sugerido por mês** = (meta − guardado) ÷ meses restantes, arredondado **para cima** em centavos | `core/calculos/meta.ts` |
| **Retirar** não pode passar do saldo da caixinha | repositório (`ErroCaixinha('saldo_insuficiente')`) |
| **Excluir caixinha** só com saldo zero | repositório (`ErroCaixinha('caixinha_com_saldo')`) |
| **Senha:** 8+ caracteres, 1 número e 1 símbolo | `core/calculos/senha.ts` |
| **Erro de login** é sempre "E-mail ou senha incorretos.", sem dizer qual errou | `pages/entrar/entrar.facade.ts` |

---

## 10. Git, commits e registro de IA

**Branches (git flow):**
- `master`: produção. Só recebe merge de `test`.
- `test`: homologação. Recebe merge de `develop`.
- `develop`: integração. **Toda branch de trabalho sai dela e volta para ela.**
- Branches de trabalho: `feature/<spec>-<assunto>` (ex.: `feature/02-teclado-numerico`) ou `fix/<spec>-<assunto>`.

> **Regra do time: uma branch por feature.** Cada funcionalidade ou correção tem a **sua** branch, criada a partir de `develop`. Não junte assuntos diferentes numa branch só, e **nunca** commite direto em `master`, `test` ou `develop`.

**Passo a passo de uma feature:**

```bash
git checkout develop && git pull                  # 1. parta do develop atualizado
git checkout -b feature/04-fechar-meta            # 2. uma branch só para este assunto
# ... código + testes, commits pequenos ...
npx ng test --watch=false --coverage && npm run build   # 3. tudo verde (dentro de web/)
git push -u origin feature/04-fechar-meta         # 4. abra o PR para develop
```

5. O PR vai para `develop` e entra com merge `--no-ff`, para a feature aparecer como um bloco no histórico.
6. Quando o time quiser homologar, `develop` vai para `test`. Depois de validado, `test` vai para `master`.

Apareceu outro assunto no meio do caminho? Abra **outra** branch a partir de `develop`.

**Commits:** em português, no imperativo, com o tipo e o ID do requisito quando houver:

```
feat(R-02.3): adiciona teclado numérico por centavos
fix(U-02.3): mantém "Salvar" visível no sheet em 360×740
test(R-04.5): cobre retirada acima do saldo
docs: atualiza spec 04 com prazo em data
```

**Antes de abrir um PR:** `npx ng test --watch=false --coverage` e `npm run build` precisam passar.

**Registro de IA:** se você usou uma IA para gerar algo relevante, adicione uma linha em `docs/ai/registro-ia.md` com data, ferramenta, pedido **resumido** em 1 ou 2 linhas, o que foi gerado, os arquivos e o status. Não cole prompts brutos.

---

## 11. Decisões já tomadas

As divergências entre mockup e spec (sem CPF, sem biometria, sem notificações, sem rendimento ou CDI, sem gamificação…) estão em `docs/specs/README.md`. Além delas:

| Decisão | Motivo |
|---------|--------|
| Backend na **Netlify** (Functions + Netlify DB + Better Auth), sem Supabase | Decisão do time; detalhes e alternativas em `docs/adr/0001-backend-netlify.md`. |
| Tecla **"00"** no lugar da vírgula do teclado | Na digitação por centavos, a vírgula não faria nada. |
| Nenhuma categoria vem pré-selecionada | Pré-seleção gera dado errado sem a pessoa perceber (R-02.4). |
| Prazo da caixinha com **dia, mês e ano** (antes era mês/ano) | Pedido do time; spec e plan 04 foram atualizados. |
| Ícones da nova caixinha numa grade 4×2 | Mostra todas as opções sem rolagem lateral em 360 px. |
| No sheet, "Salvar" fica fixo no rodapé e o teclado é compacto (teclas de 48 px) | "Salvar" sempre visível em 360×740 (U-02.3) sem esconder o "apagar". |
| Excluir pede uma segunda confirmação ("Excluir de vez") | Evita perda por toque acidental (H3/H5). |
| `/privacidade` é pública | O link do cadastro precisa funcionar antes do login. |
| Login de demonstração (`start:demo`) aceita qualquer senha para e-mails conhecidos | Só na demonstração em memória; nunca guarda a senha. |
| **Sem confirmação de e-mail**: o cadastro já entra na conta | Decisão do time. Por isso o e-mail já cadastrado é informado (`422`), com rate limit no cadastro (R-01.4). |
| Textos livres cifrados; valores em claro | Decisão do time: o banco continua somando e barrando retirada acima do saldo (R-00.8). |
| O token da sessão nunca aparece no corpo das respostas | Fica só no cookie `HttpOnly`, fora do alcance de JavaScript. |

---

## 12. Problemas comuns

| Sintoma | Causa e solução |
|---------|-----------------|
| Teste compara `R$ 1,00` e falha mesmo parecendo igual | O formatador usa espaço especial (NBSP). Use `limpo(...)`. |
| `texto()` junta palavras ("EntradasR$") | Use `r.texto()` do helper, não `textContent`. |
| Facade com `:id` vem vazio no teste | `TestBed.createComponent` não passa pelo router. Use `abrirRota`. |
| Dados do facade não aparecem no teste | Faltou `await estabilizar()` depois de mudar algo. |
| Data aparece como `05/25/2027` no navegador | O campo de data nativo segue o idioma do navegador. Em pt-BR aparece `25/05/2027`. |
| A página fica em branco por um instante | As rotas carregam sob demanda; é o carregamento do chunk. |
| Mudei dados e eles sumiram ao recarregar | Você está no `start:demo` (dados em memória). Use o compose para dados reais. |
| `npm start` abre o login e nada funciona | Sem o compose não há API. Use `npm run start:demo` ou suba o compose. |

---

## 13. Ambiente com Docker Compose

Sobe o ambiente inteiro (banco, migrações, e-mail, API e app) isolado numa rede própria, igual para todo o time. É o caminho para tudo que envolve backend. Para mexer só nas telas, o `npm start` da seção 1 basta.

### 13.1 Primeira vez

**Pré-requisito:** Docker com Compose v2 (`docker compose version`).

```bash
cp .env.example .env        # senhas de desenvolvimento; o .env não vai para o git
# Se `id -u` / `id -g` não derem 1000, ajuste APP_UID / APP_GID no .env
docker compose up -d        # a primeira vez demora: build das imagens e npm ci
./scripts/smoke.sh          # confere se está tudo de pé
```

Abra **http://localhost:8888**. É o `netlify dev`: o Angular, as Functions em `/api/*` e os redirects do `netlify.toml` no mesmo endereço, como em produção. O Angular recarrega sozinho quando você salva um arquivo.

### 13.2 Serviços

| Serviço | O que faz | Onde acessar |
|---------|-----------|--------------|
| `db` | Postgres 17 (mesma versão principal do Netlify DB), com pgTAP | `localhost:54322`, banco `nubanko` |
| `migrate` | Aplica as migrações novas de `db/migrations/` e encerra | `docker compose logs migrate` |
| `mail` | Mailpit: caixa de e-mail falsa (confirmação de cadastro, senha) | http://localhost:8025 |
| `app` | `netlify dev`: Angular + Functions + redirects | http://localhost:8888 |
| `dbtest` (profile `test`) | Recria o banco `nubanko_teste` e roda os testes pgTAP | só sob demanda |

As portas ficam presas a `127.0.0.1` (não aparecem na rede) e podem ser trocadas no `.env` (`DB_PORTA`, `APP_PORTA`, `MAIL_PORTA`).

### 13.3 Papéis do banco

| Papel | Uso | Pode |
|-------|-----|------|
| `postgres` | Administração local e runner de testes | Tudo. **Só existe localmente** |
| `nubanko_owner` | Migrações | É dono dos schemas e das tabelas |
| `nubanko_app` | As Functions de domínio (`DATABASE_URL`) | Só o que cada migração conceder. **Sem `BYPASSRLS`**, nunca dono de tabela. Não lê o schema `auth` |
| `nubanko_auth` | O Better Auth (`DATABASE_URL_AUTH`) | Só o schema `auth` (usuários, sessões, contas, tokens, rate limit) |

Toda query das functions roda como `nubanko_app`, dentro de uma transação com `app.user_id` definido (ver seção 5.5). É isso que faz o RLS valer.

### 13.4 Comandos do dia a dia

Rode na raiz do repositório.

| Comando | Para quê |
|---------|----------|
| `docker compose up -d` | Sobe tudo (e aplica migrações novas) |
| `docker compose ps` | Mostra o estado dos serviços |
| `docker compose logs -f app` | Acompanha o `netlify dev` (erros de build e das functions aparecem aqui) |
| `docker compose restart app` | Reinicia o app (necessário depois de mudar o `netlify.toml`) |
| `docker compose up -d migrate` | Aplica uma migração que você acabou de criar |
| `docker compose --profile test run --rm dbtest` | Roda todos os testes de banco num banco de teste novo |
| `docker compose --profile test run --rm dbtest db/tests/00_rls_obrigatoria.test.sql` | Roda só um arquivo |
| `docker compose exec db psql -U postgres -d nubanko` | Abre o `psql` como administrador |
| `docker compose exec db psql "postgresql://nubanko_app:app-dev@localhost/nubanko"` | Abre o `psql` **como as functions** (útil para testar RLS) |
| `docker compose exec app npm test` | Testes das functions (integração contra o banco e o Mailpit do compose) |
| `npm run typecheck` | Checagem de tipos das functions (na raiz) |
| `./scripts/smoke.sh` | Confere banco, e-mail, API e app |
| `docker compose down` | Para tudo e **mantém** os dados |
| `docker compose down -v` | Para tudo e **apaga** banco e `node_modules` dos containers (recomeça do zero) |

### 13.5 Criar uma migração

1. Crie `db/migrations/AAAAMMDDHHMMSS_descricao.sql` (ex.: `20261201000200_lancamentos.sql`). O nome define a ordem, e o `migrate` recusa nomes fora desse padrão.
2. Escreva o teste antes, em `db/tests/NN_assunto.test.sql`, dentro de `begin; select plan(n); ... select * from finish(); rollback;`.
3. Toda tabela nova em `public` precisa de:
   ```sql
   alter table public.minha_tabela enable row level security;
   alter table public.minha_tabela force row level security;
   create policy dono on public.minha_tabela
     using (user_id = app.usuario_id()) with check (user_id = app.usuario_id());
   grant select, insert, update, delete on public.minha_tabela to nubanko_app;
   ```
   Se faltar o RLS, o teste `00_rls_obrigatoria` falha sozinho.
4. Rode `docker compose --profile test run --rm dbtest` e depois `docker compose up -d migrate` para aplicar no banco de desenvolvimento.
5. **Nunca edite uma migração já mergeada em `develop`**: ela já rodou em outros bancos. Crie outra que corrija.

**Helpers dos testes** (`db/tests/_helpers.sql`):

| Helper | Faz |
|--------|-----|
| `tests.autenticar_como(uid)` | Vira `nubanko_app` com `app.user_id = uid`, como uma requisição logada |
| `tests.anonimo()` | Vira `nubanko_app` sem usuário, como uma requisição sem sessão |
| `tests.resetar()` | Volta a ser `postgres` |
| `tests.criar_usuario(email, nome?, aceite_versao?)` | Cria um usuário em `auth."user"` (a partir do plan 01) e devolve o id |

### 13.6 Criar uma function

Cada arquivo de `netlify/functions/*.mts` vira um endpoint, com a rota em `export const config = { path: '/api/...' }`. O `app` recarrega as functions sozinho. Rotas `/api/*` sem function respondem `404` em JSON (`nao-encontrado.mts`), nunca o `index.html`.

Modelo: `netlify/functions/lancamentos.mts`. O esqueleto de toda function de domínio:

```ts
export default tratar(async (req, ctx) => {             // erros viram { erro } com o status certo
  const corpo = new Validador(await lerCorpo(req, ['nome']));  // recusa campos extras e user_id
  const nome = corpo.texto('nome', 1, 40);
  corpo.conferir();                                       // 400 dados_invalidos com detalhes
  return comUsuario(req, async (db, usuarioId) => {       // 401 sem sessão; RLS ligado
    const id = randomUUID();
    await db.query('insert ... values ($1, $2)', [id, cifrar(usuarioId, `tabela.coluna:${id}`, nome)]);
    return json({ id, nome }, 201);
  });
});
```

- **Nada de arquivo auxiliar dentro de `netlify/functions/`**: todo arquivo ali vira function. Helpers ficam em `netlify/lib/` e testes em `netlify/testes/`.
- Toda rota nova entra no `docs/api/openapi.yaml`, com todos os erros; o teste `openapi.spec.ts` cobra.
- Teste de integração com duas contas (`cadastrar()` de `netlify/testes/apoio.ts`): B recebe `404` nos recursos de A; sem sessão, `401`.

### 13.7 Problemas comuns

| Sintoma | Causa e solução |
|---------|-----------------|
| `defina POSTGRES_PASSWORD no .env` | Falta o `.env`. Rode `cp .env.example .env`. |
| `port is already allocated` | A porta já está em uso no seu computador. Troque `DB_PORTA`, `APP_PORTA` ou `MAIL_PORTA` no `.env`. |
| `localhost:8888` não abre logo depois do `up` | Na primeira vez o `app` roda `npm ci`. Acompanhe com `docker compose logs -f app`. |
| Mudei senhas no `.env` e o banco não aceita | O banco guarda as senhas da primeira subida. Use `docker compose down -v` para recriar (apaga os dados locais). |
| Instalei um pacote e o `app` não enxerga | Os `node_modules` do container são separados dos do host. O `app` reinstala sozinho quando o `package-lock.json` muda: `docker compose restart app`. |
| `Permission denied` no git ou arquivos com dono `root` no repositório (`.netlify/`, `web/dist/`, `netlify/`) | O `app` rodou com outro usuário: `APP_UID`/`APP_GID` do `.env` diferentes de `id -u`/`id -g`, ou volumes criados antes dessa regra existir. Corrija o `.env`, devolva os arquivos para você com `docker run --rm -v "$PWD":/r alpine chown -R "$(id -u):$(id -g)" /r` e recrie o app: `docker compose down`, `docker volume rm nubanko_app-node-modules nubanko_web-node-modules nubanko_web-angular-cache`, `docker compose up -d --build`. |
| `role "nubanko_auth" does not exist` (ou o `app` não sobe com erro de banco) | O banco foi criado antes do papel existir. Crie à mão: `docker compose exec db psql -U postgres -c "create role nubanko_auth login nobypassrls password 'auth-dev'"` (a senha é a de `NUBANKO_AUTH_PASSWORD`), ou recrie o banco com `docker compose down -v` (apaga os dados locais). |
| `defina NUBANKO_CHAVE_DADOS no .env` | O `.env` é anterior às variáveis novas. Copie de `.env.example` as linhas `NUBANKO_AUTH_PASSWORD`, `BETTER_AUTH_SECRET` e `NUBANKO_CHAVE_DADOS`. |
| `migrate` falhou | Veja `docker compose logs migrate`. A migração com erro não fica registrada, então é só corrigir e rodar `docker compose up -d migrate` de novo. |

### 13.8 Dados cifrados e a chave

Os textos que a pessoa escreve ficam cifrados no banco (R-00.8):

| Coluna | Contexto (AAD) |
|--------|----------------|
| `perfis.nome_cifrado` | `perfis.nome:<id do usuário>` |
| `caixinhas.nome_cifrado` | `caixinhas.nome:<id da caixinha>` |
| `lancamentos.descricao_cifrada` | `lancamentos.descricao:<id do lançamento>` |

- **Como:** `netlify/lib/cripto.ts`. AES-256-GCM com IV aleatório; chave por pessoa = HKDF-SHA256 da chave mestra `NUBANKO_CHAVE_DADOS` com o id do usuário. Um texto copiado para outra pessoa, outra linha ou outra coluna não decifra.
- **O banco se protege:** essas colunas têm `check (app.eh_cifrado(...))`. Gravar texto em claro falha no insert.
- **Tamanho dos textos** (40 ou 60 caracteres) é validado na function, antes de cifrar: o banco só vê o texto cifrado.
- **O nome do cadastro** é cifrado num hook do Better Auth, que gera o id do usuário antes de gravar. A trigger `criar_perfil` move o valor para `perfis` e deixa `auth.user.name` vazio.
- **A chave:** 32 bytes em base64 (`openssl rand -base64 32`). Em produção, só nas variáveis de ambiente da Netlify, uma por ambiente. **Perder a chave é perder esses textos.** Guarde uma cópia num cofre de senhas do time.
- **Trocar a chave:** o formato começa com `v1.`. Para rotacionar, crie a `v2` em `cripto.ts` (aceitando ler `v1` com a chave antiga), recifre as linhas com um script e só então remova a antiga.


---

## 14. Deploy na Netlify

A Netlify faz a build direto do GitHub a cada push, com as configurações do `netlify.toml` (comando, pasta publicada, functions e Node 24). Não há passo de build manual.

| Branch | Ambiente |
|--------|----------|
| `master` | produção (branch de produção do site) |
| `test` | homologação (branch deploy, quando ligado) |
| PRs | deploy previews |

**O banco (Netlify DB / Neon).** As functions **nunca** usam `NETLIFY_DATABASE_URL`: ela entra como o dono do Neon, que contorna o RLS. Elas usam os papéis do app:

1. Pegue a URL **direta** (não pooled) do dono do banco: `npx netlify env:get NETLIFY_DATABASE_URL_UNPOOLED`.
2. Rode, com senhas fortes novas para os três papéis (`openssl rand -hex 24`):
   ```bash
   NEON_URL_ADMIN='<url direta>' NUBANKO_OWNER_PASSWORD=... NUBANKO_APP_PASSWORD=... NUBANKO_AUTH_PASSWORD=... \
     ./scripts/preparar-banco-netlify.sh
   ```
   O script cria os papéis (`nubanko_owner`, `nubanko_app`, `nubanko_auth`) e aplica `db/migrations`. É idempotente: **rode de novo antes de publicar cada release que traga migração** (migrações precisam ser compatíveis com o código anterior).

**Variáveis de ambiente do site** (Site configuration → Environment variables, ou `npx netlify env:set`):

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | URL **pooled** com `nubanko_app` e `sslmode=require` |
| `DATABASE_URL_AUTH` | URL pooled com `nubanko_auth` |
| `BETTER_AUTH_URL` | endereço oficial, ex. `https://nubanko.netlify.app`. Escopo **só produção**: em previews, o código usa a URL do próprio deploy (`netlify/lib/site.ts`) |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` |
| `NUBANKO_CHAVE_DADOS` | `openssl rand -base64 32`. **Guarde uma cópia no cofre do time** (seção 13.8) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_REMETENTE` | **Hoje não definidas** (sem SMTP). Sem `SMTP_HOST`, o servidor desliga `/request-password-reset` e `/reset-password` (404), e a build de produção (`environment.prod.ts`, `recuperacaoSenha: false`) esconde "Esqueci a senha" e as rotas `/esqueci-senha` e `/nova-senha`. Para religar: defina as variáveis e troque a flag para `true` |

Não defina `NUBANKO_RATE_LIMIT` em ambiente publicado (o padrão é ligado).

**Lançar uma versão:** suba a versão em `package.json` e `web/package.json` numa branch, leve `develop` → `test` → `master` com `--no-ff`, crie a tag `vX.Y.Z` no merge do `master` e faça push. O push do `master` dispara o deploy de produção.
