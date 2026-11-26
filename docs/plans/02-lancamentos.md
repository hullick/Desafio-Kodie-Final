# Plan 02: Lançamentos

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans. Passos em checkbox (`- [ ]`).

**Objetivo:** registrar, listar, editar e excluir gastos e entradas em poucos toques.

**Arquitetura:** tabela `lancamentos` com checks e RLS; categorias como constante compartilhada (front) e `check` (banco); um sheet único para criar e editar, plugado no `NovoLancamentoService` do plan 00; `DadosAlterados` avisa o painel de que algo mudou.

**Stack:** a do plan 00.

**Spec:** `docs/specs/02-lancamentos.md`

## Restrições globais

- Todas as do plan 00. Branch `feature/02-lancamentos`.
- Valor: 1 a 99.999.999 centavos (R$ 999.999,99). Descrição até 60 caracteres. Data ≤ hoje (SP).
- Categorias de gasto: `alimentacao` Alimentação, `transporte` Transporte, `lazer` Lazer, `compras` Compras, `contas` Contas, `saude` Saúde, `educacao` Educação, `outros_gasto` Outros.
- Categorias de entrada: `salario` Salário/Bolsa, `extra` Extra, `presente` Presente, `outros_entrada` Outros.
- Toasts: "Gasto registrado", "Entrada registrada", "Lançamento atualizado", "Lançamento excluído"; erro "Não foi possível salvar. Tente de novo."

## Foco de revisão

- Duplo toque em "Salvar": um registro só (botão desabilitado enquanto salva).
- Trocar Gasto → Entrada com uma categoria de gasto selecionada: limpar a seleção, para nunca salvar uma combinação inválida.
- Editar um lançamento de outro mês e mudar a data: ele some da lista atual e aparece no mês certo.
- Descrição com só espaços: salvar como `null`.
- Teclado físico no desktop: dígitos, Backspace e vírgula funcionam no teclado numérico.

---

### Tarefa 1: tabela `lancamentos`

**Arquivos:** criar `supabase/migrations/20261201000200_lancamentos.sql`, `supabase/tests/02_lancamentos.test.sql`

**Interfaces:**
- Produz:
  - `public.lancamentos(id uuid pk default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade, tipo text check in ('gasto','entrada'), valor_centavos bigint check between 1 and 99999999, categoria text not null, descricao text check (char_length(descricao) <= 60), data date not null, criado_em, atualizado_em)`
  - `check` de categoria por tipo (as listas das restrições)
  - índice `(user_id, data desc)`
  - RLS com as 4 políticas de dono
  - função genérica `public.impedir_troca_de_dono()` (trigger `before update`: `new.user_id <> old.user_id` levanta erro), **reutilizada no plan 04**
  - trigger `validar_data_lancamento` (`new.data > (now() at time zone 'America/Sao_Paulo')::date` levanta erro)
  - trigger de `atualizado_em`

- [ ] **Passo 1:** testes pgTAP: insere válido como A; `throws_ok` para valor 0, valor 100000000, categoria `salario` com tipo `gasto`, descrição de 61 caracteres e data de amanhã; B não vê, não atualiza (0 linhas) e não apaga o de A; A não consegue mudar `user_id` para B; anônimo vê 0 linhas; insert com `user_id` de B explícito falha por RLS.
- [ ] **Passos 2 a 4:** FAIL → migração → PASS (`dbtest` completo).
- [ ] **Passo 5:** commit `feat(R-00.4): cria tabela de lançamentos com RLS e validações`.

### Tarefa 2: categorias e lógica do teclado

**Arquivos:** criar `web/src/app/core/categorias.ts`, `features/lancamentos/teclado.ts` + specs

**Interfaces:**
- Produz:
  - `type TipoLancamento = 'gasto' | 'entrada'`
  - `type Categoria = { id: string; rotulo: string; icone: string; cor: string; tipo: TipoLancamento }`
  - `CATEGORIAS: readonly Categoria[]`; `categoriasDe(tipo): Categoria[]`; `categoria(id): Categoria`
  - `type Tecla = '0'..'9' | '00' | 'apagar'`; `teclar(centavos: number, t: Tecla): number`; `MAX_CENTAVOS = 99_999_999`

  A tecla "," do mockup é substituída por "00" *(decisão: em entrada por centavos, vírgula não tem efeito; registrar no `registro-ia.md` como ajuste de UI)*.

- [ ] **Passo 1:** testes: `teclar(0,'1')=1`, `teclar(1,'2')=12`, `teclar(12,'5')=125`, `teclar(125,'apagar')=12`, `teclar(0,'apagar')=0`, `teclar(5,'00')=500`, `teclar(99_999_999,'9')=99_999_999`, `teclar(0,'0')=0`. As categorias de gasto são 8 e as de entrada, 4, com ids únicos e iguais aos do `check` do banco (o teste lê a migração e compara).
- [ ] **Passos 2 a 4:** FAIL → implementar → PASS.
- [ ] **Passo 5:** commit `feat(R-02.3): adiciona categorias e lógica do teclado numérico`.

### Tarefa 3: `LancamentosService` e `DadosAlterados`

**Arquivos:** criar `core/dados-alterados.ts`, `features/lancamentos/lancamentos.service.ts` + specs

**Interfaces:**
- Produz:
  - `DadosAlterados { versao: Signal<number>; notificar(): void }`
  - `type Lancamento = { id; tipo: TipoLancamento; valorCentavos: number; categoria: string; descricao: string | null; data: string }`
  - `LancamentosService { criar(l: Omit<Lancamento,'id'>): Promise<Lancamento>; atualizar(id, l): Promise<Lancamento>; excluir(id): Promise<void>; obter(id): Promise<Lancamento>; listarDoMes(m: Mes): Promise<Lancamento[]>; ultimos(m: Mes, n: number): Promise<Lancamento[]> }`. Toda escrita chama `notificar()`; a descrição passa por `trim() || null`.

- [ ] **Passo 1:** testes com o client mockado: `listarDoMes({2026,11})` filtra `data >= '2026-11-01'` e `< '2026-12-01'` e ordena `data desc, criado_em desc`; criar, atualizar e excluir incrementam `versao`; descrição `'  '` vira `null`; snake_case ↔ camelCase.
- [ ] **Passos 2 a 4:** FAIL → implementar → PASS.
- [ ] **Passo 5:** commit `feat(R-02.7): adiciona serviço de lançamentos`.

### Tarefa 4: sheet de novo e editar lançamento

**Arquivos:** criar `shared/ui/numeric-keypad/*`, `shared/ui/chip/*`, `features/lancamentos/lancamento-sheet/*` + specs; montar o sheet no `ShellComponent`

**Interfaces:**
- Consome: `NovoLancamentoService` (`aberto`, `emEdicao`), `teclar`, `categoriasDe`, `LancamentosService`, `ToastService`, `nb-bottom-sheet`, `hojeISO`.
- Produz: `<nb-numeric-keypad (tecla)>` (grade 3×4: 1–9, `00`, 0, apagar com `aria-label="Apagar"`; também escuta o teclado físico); `<nb-chip [selecionado] icone rotulo>` com `aria-pressed`.

- [ ] **Passo 1:** testes de componente:
  - abre em "Gasto" com R$ 0,00 e nenhuma categoria;
  - "Salvar" fica desabilitado até valor > 0 e categoria escolhida;
  - trocar para Entrada mostra 4 chips e limpa a seleção;
  - a data oferece Hoje, Ontem e um seletor com `max` = hoje;
  - salvar chama `criar` uma vez mesmo com duplo clique, fecha o sheet e mostra "Gasto registrado";
  - com erro do serviço, mantém os dados e mostra "Não foi possível salvar. Tente de novo.";
  - com `emEdicao='id'`, carrega os dados e mostra "Excluir"; excluir pede confirmação ("Excluir este lançamento?") e mostra "Lançamento excluído".
- [ ] **Passos 2 a 4:** FAIL → implementar seguindo `design/novo_lan_amento_nubanko` → PASS.
- [ ] **Passo 5:** commit `feat(R-02.1): adiciona sheet de novo lançamento`.

### Tarefa 5: lista "Ver todos"

**Arquivos:** criar `features/lancamentos/lista/*` + spec; rota `/lancamentos?ano=&mes=` (filha do shell); `shared/ui/lancamento-item/*` (reutilizado pelo painel)

**Interfaces:**
- Produz: `<nb-lancamento-item [lancamento] (selecionar)>`: ícone, título (descrição ou rótulo da categoria), "Categoria • data curta", valor `− R$` em `neg` ou `+ R$` em `pos`; é um `button` inteiro.
- Consome: `LancamentosService.listarDoMes`, `DadosAlterados.versao`, `NovoLancamentoService.abrir(id)`.

- [ ] **Passo 1:** testes: agrupa por dia com cabeçalhos "Hoje", "Ontem" e "25 de nov."; mostra a descrição ou, sem ela, o rótulo da categoria; os sinais e cores estão certos; o toque chama `abrir(id)`; recarrega quando a `versao` muda; com lista vazia, mostra "Nenhum lançamento em {mês}.".
- [ ] **Passos 2 a 4:** FAIL → implementar → PASS.
- [ ] **Passo 5:** commit `feat(R-02.8): adiciona lista de lançamentos do mês`.

### Tarefa 6: e2e e usabilidade

**Arquivos:** criar `web/e2e/02-lancamentos.spec.ts`

- [ ] **Passo 1:** testes Playwright (usuário de `criarUsuario`):
  - `U-02.1`: com `contadorDeToques`, "+", chip Alimentação e Salvar (os dígitos são digitados à parte) somam `total() <= 3`, e o toast aparece em ≤ 1 s (U-00.7);
  - `R-02.7` o gasto aparece na lista;
  - `R-02.9` editar o valor e excluir;
  - `R-02.10` com `page.route('**/rest/v1/lancamentos*', r => r.abort())`, os dados permanecem no sheet;
  - `U-02.2` valor e chips visíveis sem rolar em 360×740;
  - `U-02.3` "Salvar" e o teclado na zona do polegar;
  - `U-02.4` `aria-pressed` no chip;
  - `U-02.6` `page.goBack()` fecha o sheet e continua em `/inicio`;
  - `U-00.1/2/3` com o sheet aberto.
- [ ] **Passos 2 a 4:** rodar → corrigir → PASS nos dois viewports.
- [ ] **Passo 5:** atualizar a rastreabilidade e o registro de IA; commit `test(U-02.1): cobre lançamentos ponta a ponta`.
