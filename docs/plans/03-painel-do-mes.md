# Plan 03: Painel do mês

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans. Passos em checkbox (`- [ ]`).

**Objetivo:** a aba Início mostra em segundos o saldo, as entradas, os gastos por categoria, as caixinhas e os últimos lançamentos do mês.

**Arquitetura:** uma RPC `resumo_mes` (security invoker, respeita RLS) agrega no banco; funções puras no front calculam os percentuais; a página compõe os componentes já existentes e reage ao `DadosAlterados`.

**Stack:** a do plan 00.

**Spec:** `docs/specs/03-painel-do-mes.md`

## Restrições globais

- Todas as do plan 00. Branch `feature/03-painel`. Executar depois dos plans 02 e 04.
- Saldo = entradas − gastos − (guardar − retirar), tudo no mês.
- Percentual com 1 casa decimal (`41,6%`); a soma dos exibidos dá 100,0%.
- Chave do olho no `localStorage`: `nubanko.ocultarValores`. Máscara: `R$ ••••`.
- Estado vazio: "Nenhum gasto em {mês}. Toque no + para registrar o primeiro." (com o mês em minúsculas, ex.: "novembro").

## Foco de revisão

- Mês com só entradas: o saldo é positivo, a rosca mostra o estado vazio de gastos e as entradas continuam visíveis.
- Saldo negativo: vermelho, com o sinal, e sem quebrar o layout em 360 px com valores de 7 dígitos.
- Uma categoria com 100%: a rosca desenha um círculo completo (o arco SVG de 360° costuma sumir).
- Navegar para um mês antigo e criar um lançamento com data de hoje: o painel do mês antigo não muda, e o atual muda.
- Olho fechado e trocar de mês: continua oculto.

---

### Tarefa 1: RPC `resumo_mes`

**Arquivos:** criar `supabase/migrations/20261201000400_resumo_mes.sql`, `supabase/tests/03_resumo_mes.test.sql`

**Interfaces:**
- Produz: `public.resumo_mes(p_ano int, p_mes int) returns jsonb` (`language sql`, `stable`, `security invoker`) →
  `{ "entradas": int, "gastos": int, "guardado_liquido": int, "saldo": int, "por_categoria": [{ "categoria": text, "total": int }] }`. `por_categoria` traz só gastos, com total > 0, ordenado desc. `grant execute` só para `authenticated`.

- [ ] **Passo 1:** testes pgTAP (como A, nov/2026): entrada 141200; gastos alimentacao 32000 e transporte 18000; guardar 30000 e retirar 5000 → `entradas=141200`, `gastos=50000`, `guardado_liquido=25000`, `saldo=66200`, `por_categoria[0].categoria='alimentacao'`. Lançamentos de B no mesmo mês não entram. Lançamento de 01/12 não entra em novembro. Um mês vazio dá tudo 0 e `por_categoria = []`. Anônimo não executa.
- [ ] **Passos 2 a 4:** FAIL → migração → PASS.
- [ ] **Passo 5:** commit `feat(R-03.2): adiciona RPC de resumo do mês`.

### Tarefa 2: percentuais e serviço do painel

**Arquivos:** criar `features/painel/percentuais.ts`, `features/painel/painel.service.ts` + specs

**Interfaces:**
- Produz:
  - `percentuais(itens: { categoria: string; total: number }[]): { categoria: string; total: number; percentual: number }[]`: maior resto em décimos, somando exatamente 100,0
  - `type ResumoMes = { entradas; gastos; guardadoLiquido; saldo; porCategoria: { categoria; total; percentual }[] }`
  - `PainelService { resumo(m: Mes): Promise<ResumoMes> }`

- [ ] **Passo 1:** testes: `[320,180,135,84.7,50]` em reais (como centavos) dão `41,6 / 23,4 / 17,5 / 11,0 / 6,5`, conferindo que somam 100,0; um item dá 100; uma lista vazia dá `[]`; três iguais dão `33,4 / 33,3 / 33,3`.
- [ ] **Passos 2 a 4:** FAIL → implementar → PASS.
- [ ] **Passo 5:** commit `feat(R-03.4): adiciona cálculo de percentuais por categoria`.

### Tarefa 3: rosca

**Arquivos:** criar `shared/ui/donut/*` + spec

**Interfaces:**
- Produz: `<nb-donut [fatias]="{ rotulo; valor; cor }[]" [centroTitulo] [centroValor]>`: SVG com `role="img"` e `aria-label` "Gastos por categoria: Alimentação 41,6%, Transporte 23,4%, …".

- [ ] **Passo 1:** testes: N fatias geram N `<circle>` com `stroke-dasharray` proporcional; uma fatia de 100% renderiza o círculo completo; o `aria-label` lista rótulos e percentuais; o centro mostra "TOTAL" e o valor.
- [ ] **Passos 2 a 4:** FAIL → implementar (círculos com `stroke-dasharray`/`dashoffset`, sem `path` de arco) → PASS.
- [ ] **Passo 5:** commit `feat(U-03.3): adiciona componente de rosca acessível`.

### Tarefa 4: página Início

**Arquivos:** criar `features/painel/inicio/*` + spec; trocar o placeholder `/inicio`

**Interfaces:**
- Consome: `PainelService`, `percentuais`, `CaixinhasService.listar` (2 ativas por prazo), `LancamentosService.ultimos(m, 4)`, `nb-lancamento-item`, `nb-caixinha-card` (variante compacta `[compacto]`), `nb-donut`, `categoria(id)`, `AuthService.nome`, `DadosAlterados.versao`, `rotuloMes`, `somarMeses`.

- [ ] **Passo 1:** testes de componente com serviços mockados:
  - "Olá, Lari" e "Novembro 2026"; o botão › fica desabilitado no mês atual e ‹ volta para outubro;
  - o card mostra o saldo, Entradas (verde) e Gastos (vermelho); o saldo negativo fica em `neg`;
  - o olho alterna para `R$ ••••` em todos os valores e persiste no `localStorage`;
  - lista de categorias ordenada com percentual; estado vazio com o texto exato;
  - até 2 caixinhas e o link "Criar nova +" → `/caixinhas/nova`;
  - 4 últimos lançamentos e "Ver todos" → `/lancamentos?ano=&mes=`;
  - recarrega quando a `versao` muda; troca de mês mostra `aria-busy` durante o carregamento (U-03.5).
- [ ] **Passos 2 a 4:** FAIL → implementar seguindo `design/painel_do_m_s_nubanko` (saldo em `numeric-balance`, sem o sino) → PASS.
- [ ] **Passo 5:** commit `feat(R-03.1): adiciona painel do mês`.

### Tarefa 5: e2e e usabilidade

**Arquivos:** criar `web/e2e/03-painel.spec.ts`, `web/e2e/support/seed.ts` (`semearMes(usuario, dados)` via REST com o token do usuário)

- [ ] **Passo 1:** testes Playwright com o seed do mockup (entrada 1.412,00; gastos 320,00 / 180,00 / 135,00 / 84,70 / 50,00; caixinhas 450/1000 e 300/800 com movimentos datados em **outubro**, para não afetar o saldo de novembro):
  - `R-03.2` o saldo exibido é `R$ 642,30`, as entradas `R$ 1.412,00` e os gastos `R$ 769,70`;
  - `U-03.1` saldo, entradas e gastos sem rolar em 360×740;
  - `U-03.2` o saldo tem o maior `font-size` da página;
  - `R-03.3` ocultar valores e recarregar mantém oculto;
  - `R-03.7`/`U-03.4` usuário novo vê o estado vazio;
  - `R-03.8` criar um gasto pelo "+" atualiza o saldo sem reload;
  - `R-04.6` guardar numa caixinha reduz o saldo (remover o `fixme` do plan 04);
  - `U-00.1/2/3`.
- [ ] **Passos 2 a 4:** rodar → corrigir → PASS.
- [ ] **Passo 5:** atualizar a rastreabilidade e o registro de IA; commit `test(R-03.2): cobre painel do mês ponta a ponta`.
