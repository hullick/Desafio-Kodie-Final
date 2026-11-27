# Plan 04: Caixinhas

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans. Passos em checkbox (`- [ ]`).

**Objetivo:** criar metas, guardar e retirar, ver o progresso e o valor sugerido por mês.

**Arquitetura:** tabelas `caixinhas` e `movimentos_caixinha`, com as regras de integridade no banco (dono, saldo suficiente, exclusão só com saldo zero) e a view `caixinhas_com_saldo` (`security_invoker`), expostas por `caixinhas.mts` em `/api/caixinhas`. Os cálculos de meta são uma função pura no front.

**Stack:** a do plan 00.

**Spec:** `docs/specs/04-caixinhas.md`

## Restrições globais

- Todas as do plan 00. Branch `feature/04-caixinhas`. Executar depois do plan 02, que traz `impedir_troca_de_dono`, o teclado e o `DadosAlterados`.
- Nome até 40 caracteres. Meta de 1 a 99.999.999 centavos. Prazo: último dia de um mês entre o mês atual e +120 meses.
- Ícones: `aparelho` Aparelho, `viagem` Viagem, `reserva` Reserva, `estudos` Estudos, `casa` Casa, `carro` Carro, `presente` Presente, `outro` Outro.
- Dourado `#FFE08F` só em caixinha com meta atingida.
- Mensagens: "Você tem {R$ X} nesta caixinha" (retirada acima do saldo); "Retire o saldo antes de excluir" (exclusão com saldo).

## Foco de revisão

- Duas retiradas simultâneas que, somadas, passam do saldo: o banco recusa a segunda (`select ... for update` na caixinha).
- Editar a meta para um valor abaixo do saldo: vira "Meta atingida" na hora, sem erro.
- Prazo no mês atual com o dia 30: os meses restantes são 1, e o sugerido é tudo o que falta.
- Movimento com data anterior à criação da caixinha: aceitar (a pessoa pode registrar algo atrasado).
- Caixinha com 0% de progresso: a barra é renderizada vazia, não some.

---

### Tarefa 1: tabelas, regras e view

**Arquivos:** criar `db/migrations/20261201000300_caixinhas.sql`, `db/tests/04_caixinhas.test.sql`

**Interfaces:**
- Produz:
  - `public.caixinhas(id, user_id text default app.usuario_id() references auth."user"(id) on delete cascade, nome text check 1..40 após trim, icone text check in (...), meta_centavos bigint check 1..99999999, prazo date (trigger em insert e em update que muda o prazo: recusa antes de hoje em America/Sao_Paulo ou depois de +10 anos), criado_em, atualizado_em)`
  - `public.movimentos_caixinha(id, user_id text default app.usuario_id() references auth."user"(id) on delete cascade, caixinha_id uuid references caixinhas on delete cascade, tipo text check in ('guardar','retirar'), valor_centavos bigint check 1..99999999, data date, criado_em)`
  - RLS (com `force`) de dono nas duas, com grants para `nubanko_app`; `impedir_troca_de_dono` nas duas
  - trigger `validar_movimento` (before insert): garante que a caixinha é do mesmo `user_id`, aplica `for update` na caixinha, recusa `retirar` acima do saldo (`raise exception 'saldo_insuficiente'`) e recusa data futura (SP)
  - trigger `validar_exclusao_caixinha` (before delete): com saldo ≠ 0, `raise exception 'caixinha_com_saldo'`
  - movimentos sem update: são apagados e criados de novo
  - view `public.caixinhas_com_saldo with (security_invoker = true)`: todas as colunas de `caixinhas` + `saldo_centavos`

- [ ] **Passo 1:** testes pgTAP:
  - A cria uma caixinha e guarda 1000; retirar 1001 dá `throws_ok 'saldo_insuficiente'`; retirar 1000 passa e o saldo fica 0 na view;
  - A não consegue um movimento numa caixinha de B, nem com `user_id` próprio;
  - B não vê a caixinha de A na view;
  - um prazo de ontem é recusado e `2027-03-15` é aceito; editar o nome de uma caixinha com prazo vencido continua permitido;
  - delete com saldo dá `throws_ok 'caixinha_com_saldo'`, e com saldo 0 passa, levando os movimentos junto.
- [ ] **Passos 2 a 4:** FAIL → migração → PASS (`dbtest` completo).
- [ ] **Passo 5:** commit `feat(R-04.5): cria caixinhas e movimentos com regras no banco`.

### Tarefa 2: API de caixinhas

**Arquivos:** criar `netlify/functions/caixinhas.mts`, `netlify/functions/caixinhas.spec.ts`

**Interfaces:**
- Consome: `comUsuario`, `tratar`, `lerCorpo`, `json` (plan 00).
- Produz (`config = { path: ['/api/caixinhas', '/api/caixinhas/:id', '/api/caixinhas/:id/movimentos'] }`), em camelCase, lendo da view `caixinhas_com_saldo`:
  - `GET /api/caixinhas` (por prazo asc) · `GET /api/caixinhas/:id` · `POST /api/caixinhas` → `201` · `PUT /api/caixinhas/:id` · `DELETE /api/caixinhas/:id` → `204`
  - `GET /api/caixinhas/:id/movimentos` (mais recente primeiro) · `POST /api/caixinhas/:id/movimentos` → `201`
  - `saldo_insuficiente` e `caixinha_com_saldo` viram `409 { erro: <codigo> }`; caixinha inexistente ou de outra pessoa, `404`

- [ ] **Passo 1:** testes de integração: CRUD e movimentos felizes como A; retirar acima do saldo dá `409 saldo_insuficiente`; excluir com saldo dá `409 caixinha_com_saldo`; B recebe `404` em todas as rotas com o id de A, inclusive `POST .../movimentos`; sem sessão, `401`; duas retiradas em paralelo que somadas passam do saldo: uma dá `201` e a outra `409`.
- [ ] **Passos 2 a 4:** FAIL → implementar → PASS, incluindo o guarda das functions.
- [ ] **Passo 5:** commit `feat(R-04.5): adiciona API de caixinhas`.

### Tarefa 3: cálculo da meta

**Arquivos:** criar `features/caixinhas/meta.ts` + spec

**Interfaces:**
- Consome: `mesDeISO`, `mesesInclusivos`.
- Produz: `calcularMeta(i: { metaCentavos: number; saldoCentavos: number; prazo: string /* YYYY-MM-DD */ }, hoje: string /* YYYY-MM-DD */): { progresso: number /* 0..1, limitado */; percentual: number /* 1 casa */; faltamCentavos: number /* >= 0 */; mesesRestantes: number; sugeridoMensalCentavos: number | null; estado: 'ativa' | 'atingida' | 'prazo_encerrado' }`

- [ ] **Passo 1:** testes (hoje = 2026-11-25):
```ts
calcularMeta({ metaCentavos: 200000, saldoCentavos: 80000, prazo: '2027-03-15' }, hoje)
// → mesesRestantes 5, faltamCentavos 120000, sugeridoMensalCentavos 24000, percentual 40, estado 'ativa'
calcularMeta({ metaCentavos: 100000, saldoCentavos: 0, prazo: '2026-11-30' }, hoje)
// → mesesRestantes 1, sugerido 100000
calcularMeta({ metaCentavos: 100, saldoCentavos: 0, prazo: '2027-02-10' }, hoje)
// → sugerido 25 (ceil de 100/4)
calcularMeta({ metaCentavos: 40000, saldoCentavos: 41000, prazo: '2027-01-31' }, hoje)
// → estado 'atingida', progresso 1, faltam 0, sugerido null
calcularMeta({ metaCentavos: 50000, saldoCentavos: 10000, prazo: '2026-11-24' }, hoje)
// → estado 'prazo_encerrado', mesesRestantes 0, sugerido null, faltam 40000
```
- [ ] **Passos 2 a 4:** FAIL → implementar → PASS.
- [ ] **Passo 5:** commit `feat(R-04.2): adiciona cálculo de valor sugerido por mês`.

### Tarefa 4: `CaixinhasService`

**Arquivos:** criar `features/caixinhas/caixinhas.service.ts` + spec

**Interfaces:**
- Produz:
  - `type Caixinha = { id; nome; icone; metaCentavos; prazo: string /* YYYY-MM-DD */; saldoCentavos; criadoEm }`
  - `type Movimento = { id; tipo: 'guardar' | 'retirar'; valorCentavos; data }`
  - `CaixinhasService { listar(): Promise<Caixinha[]>; obter(id): Promise<Caixinha>; criar(c): Promise<Caixinha>; editar(id, c): Promise<Caixinha>; excluir(id): Promise<void>; movimentos(id): Promise<Movimento[]>; movimentar(id, m: Omit<Movimento,'id'>): Promise<void> }`
  - os erros `saldo_insuficiente` e `caixinha_com_saldo` viram `ErroCaixinha` com o código; toda escrita chama `DadosAlterados.notificar()`; o prazo vai e volta como `date` (YYYY-MM-DD), sem conversão.

- [ ] **Passo 1:** testes com `HttpTestingController`: `listar` chama `GET /api/caixinhas`; `'2027-02-15'` vai no corpo como `'2027-02-15'`; um `409 { erro: 'saldo_insuficiente' }` vira `ErroCaixinha('saldo_insuficiente')`; escritas notificam.
- [ ] **Passos 2 a 4:** FAIL → implementar → PASS.
- [ ] **Passo 5:** commit `feat(R-04.4): adiciona serviço de caixinhas`.

### Tarefa 5: componentes de progresso e card

**Arquivos:** criar `shared/ui/progress-bar/*`, `shared/ui/progress-ring/*`, `features/caixinhas/caixinha-card/*` + specs

**Interfaces:**
- Produz: `<nb-progress-bar [valor]="0..1" rotulo>` (`role=progressbar`, `aria-valuemin=0`, `aria-valuemax=100`, `aria-valuenow`); `<nb-progress-ring [valor]>` (SVG, mesmo contrato ARIA); `<nb-caixinha-card [caixinha] (guardar) (abrir)>`: estado `atingida` usa `gold`; `prazo_encerrado` mostra "Prazo encerrado · faltam {R$}".

- [ ] **Passo 1:** testes: `aria-valuenow` igual a 40 para 0,4; valor 0 ainda renderiza a trilha; o card mostra "R$ 800,00 de R$ 2.000,00", "40%", "Prazo: até mar/2027" e "Guarde R$ 240,00/mês para atingir"; o botão "Guardar +" emite `guardar` sem emitir `abrir`; o estado atingido tem a classe `bg-gold` e não mostra o sugerido.
- [ ] **Passos 2 a 4:** FAIL → implementar → PASS.
- [ ] **Passo 5:** commit `feat(U-04.5): adiciona componentes de progresso e card de caixinha`.

### Tarefa 6: telas

**Arquivos:** criar `features/caixinhas/{lista,form,detalhe,movimento-sheet}/*` + specs; rotas `/caixinhas`, `/caixinhas/nova`, `/caixinhas/:id`, `/caixinhas/:id/editar`

**Interfaces:**
- Consome: as tarefas 3 a 5, `nb-numeric-keypad`, `teclar`, `nb-bottom-sheet`, `ToastService`, `DadosAlterados`.
- Produz: `MovimentoSheet` aberto por `abrirMovimento(caixinhaId, tipo)`, usado na lista e no detalhe.

- [ ] **Passo 1:** testes de componente:
  - **lista:** "Total guardado" soma os saldos; seção de ativas por prazo e seção "Metas atingidas"; estado vazio com o texto de R-04.9.
  - **form:** os atalhos + R$ 500 / 1.000 / 2.000 somam ao valor; o prazo é um `input type=date` com `min` = hoje e `max` = hoje + 120 meses, e data fora disso mostra erro; o sugerido aparece e se atualiza ao mudar o valor ou o prazo, antes de criar (U-04.2); "Criar caixinha" fica desabilitado até nome, ícone, valor > 0 e prazo.
  - **detalhe:** anel, "Faltam R$ X", "Prazo final", "Meta mensal", histórico com "+"/"−" e menu ⋮ com Editar e Excluir; excluir com saldo mostra "Retire o saldo antes de excluir".
  - **movimento-sheet:** retirada acima do saldo mostra "Você tem R$ X nesta caixinha" (U-04.4), validada no front e também pelo erro do serviço.
- [ ] **Passos 2 a 4:** FAIL → implementar seguindo os mockups, sem CDI, nível, prioridade, filtro, Pix e mensagem motivacional → PASS.
- [ ] **Passo 5:** commit `feat(R-04.1): adiciona telas de caixinhas`.

### Tarefa 7: e2e e usabilidade

**Arquivos:** criar `web/e2e/04-caixinhas.spec.ts`

- [ ] **Passo 1:** testes Playwright:
  - `R-04.3` criar "Celular novo" com R$ 2.000,00 até mar/2027 → o card mostra o sugerido;
  - `U-04.1` o formulário está numa rota só, com 4 controles de decisão;
  - `U-04.3` "Guardar +" na lista abre o sheet sem navegar;
  - guardar R$ 800,00 → 40%;
  - `U-04.4` retirar R$ 900,00 mostra o erro com R$ 800,00;
  - `R-04.7` editar a meta para R$ 700,00 → seção "Metas atingidas" com o dourado; excluir com saldo é bloqueado; retirar tudo e excluir;
  - `R-04.6` o saldo do mês em `/inicio` cai R$ 800,00 após guardar *(só se o plan 03 já estiver entregue; senão, fica `test.fixme` com a referência)*;
  - `U-00.1/2/3` em `/caixinhas`, `/caixinhas/nova` e no detalhe.
- [ ] **Passos 2 a 4:** rodar → corrigir → PASS.
- [ ] **Passo 5:** atualizar a rastreabilidade e o registro de IA; commit `test(R-04.1): cobre caixinhas ponta a ponta`.
