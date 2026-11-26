# Spec 00: Fundação

## Intenção

Dar ao time uma base única para as specs 01 a 05: stack, ambiente local isolado, modelo de segurança, estratégia de testes e usabilidade, design system e os papéis dos agentes. O objetivo do produto é que a Lari (19 anos, jovem aprendiz) registre um gasto em segundos e confie que só ela vê os próprios dados.

## Objetivos, não objetivos, anti-objetivos

- **Objetivos:** ambiente que sobe com um comando; segurança testada automaticamente; todo requisito rastreado até um teste; usabilidade medida e justificada.
- **Não objetivos (v1):** todos os itens de "fora do escopo" do resumo; app nativo nas lojas *(time: PWA agora, Capacitor só se precisar depois)*.
- **Anti-objetivos:** um app que "funciona" mas leva mais toques que uma planilha; qualquer caminho em que um usuário leia dados de outro; textos que prometam segurança que o app não tem.

## Stack *(time, exceto onde marcado)*

| Camada | Escolha |
|--------|---------|
| Front | Angular (versão estável atual), standalone components, signals, **PWA** (`@angular/pwa`), mobile-first |
| Estilo | Tailwind CSS com os tokens do `design/nubanko_neo_fintech/DESIGN.md` e componentes próprios *(proposta: os mockups já usam Tailwind; Angular Material brigaria com o visual)* |
| Gráfico de rosca | Componente SVG próprio *(proposta: um gráfico só não justifica uma biblioteca)* |
| Backend | **Supabase**: Postgres, Auth (GoTrue), PostgREST. Sem Edge Functions na v1 *(proposta)* |
| Acesso a dados | `supabase-js` atrás de serviços Angular (`LancamentosService` etc.). Os componentes não falam com o Supabase direto, o que permite trocar o backend no futuro *(proposta)* |
| Testes | Vitest (unidade e componente), pgTAP via `supabase test db` (banco e RLS), Playwright (e2e e usabilidade), `@axe-core/playwright` (acessibilidade) |

## Ambiente local: Docker Compose *(time)*

Um `docker-compose.yml` na raiz sobe tudo isolado numa rede própria, com o comando `docker compose up`:

- `db`: Postgres do Supabase (imagem `supabase/postgres`)
- `auth`: GoTrue
- `rest`: PostgREST
- `kong`: gateway que expõe a API em `localhost:8000`
- `meta` + `studio`: painel de admin em `localhost:3000`
- `mail`: Mailpit (confirmação de cadastro e recuperação de senha sem enviar e-mail real)
- `migrate`: aplica `supabase/migrations/*.sql` e encerra
- `web`: Angular dev server em `localhost:4200`
- `e2e` (profile `test`): imagem oficial do Playwright, roda contra `web`

Base: o compose oficial de self-hosting do Supabase, **reduzido** aos serviços acima (sem realtime, storage, functions ou analytics) *(proposta)*. Os segredos ficam em `.env` (fora do controle de versão), com um `.env.example` versionado. O banco de teste é recriado a cada execução de testes.

## Modelo de dados (visão geral)

O detalhe de cada tabela está na spec dona dela. Todas as tabelas de domínio têm `user_id uuid not null default auth.uid() references auth.users on delete cascade`.

| Tabela | Spec |
|--------|------|
| `perfis` (nome, aceite da política) | 01 |
| `lancamentos` | 02 |
| `caixinhas`, `movimentos_caixinha` | 04 |

**Dinheiro:** sempre em **centavos inteiros** (`bigint`), nunca `float`. A formatação `R$ 1.234,56` acontece só na exibição (`Intl.NumberFormat('pt-BR', {style:'currency', currency:'BRL'})`) *(proposta)*.
**Datas:** `date` para a data do lançamento. O "mês" é calculado no fuso `America/Sao_Paulo` *(proposta)*.

## Segurança *(resumo; a implementação é proposta)*

| Requisito | Como |
|-----------|------|
| R-00.1: cada pessoa vê só os próprios dados | **RLS habilitado em todas as tabelas**, com políticas `user_id = auth.uid()` para select, insert, update e delete. Sem política, não há acesso. |
| R-00.2: senha com hash | Supabase Auth (bcrypt). O app nunca armazena nem loga senha. |
| R-00.3: tráfego só por HTTPS | Em produção, Supabase Cloud e hospedagem do front só em HTTPS com HSTS. A PWA exige HTTPS. Localmente, HTTP em `localhost`, que é aceitável. |
| R-00.4: regras de acesso por dono | Igual a R-00.1, mais `user_id` preenchido pelo banco (`default auth.uid()`) e imutável por trigger. O cliente não escolhe o dono. |
| R-00.5: coleta mínima | Só nome, e-mail, senha e o registro do aceite. Sem CPF, telefone, endereço, analytics ou rastreadores de terceiros. |
| R-00.6: a chave `service_role` nunca vai para o front | O front usa só a `anon key`. Teste automatizado verifica o bundle. |

**Testes obrigatórios de segurança:** para cada tabela, um teste pgTAP com dois usuários (A e B) prova que B não lê, não altera e não apaga dados de A, e que um anônimo não acessa nada.

## Estratégia de testes *(time: "tudo deverá ter teste")*

- **Regra de pronto:** cada `R-xx.n` e `U-xx.n` tem pelo menos um teste que cita o ID. O agente de testes mantém uma matriz em `docs/rastreabilidade.md`.
- **TDD:** o teste é escrito antes e precisa falhar primeiro.
- **Camadas:** a lógica pura (cálculos de saldo e valor sugerido, formatação) fica em funções puras com testes unitários; componentes, com teste de componente; regras de banco e RLS, com pgTAP; fluxos, com Playwright.
- **Cobertura mínima** do front: 80% de linhas e branches, com falha no CI abaixo disso *(proposta)*.
- **Playwright:** projetos com viewport de celular (360×740, Android pequeno, e 390×844, iPhone) *(proposta)*.

## Usabilidade: como medimos e justificamos *(time valida)*

Cada spec traz critérios `U-xx.n`. Cada critério tem **teste Playwright** (tag `@usabilidade`) e uma **justificativa de uma linha** ligada a uma fonte reconhecida: heurísticas de Nielsen (H1 a H10), WCAG 2.2 ou a persona. A justificativa fica no próprio critério, e o teste cita o ID.

Critérios globais, que valem para todas as telas:

| ID | Critério (testado) | Justificativa |
|----|--------------------|---------------|
| U-00.1 | Alvos de toque ≥ 44×44 px | WCAG 2.5.8; uso com o polegar, em movimento |
| U-00.2 | Zero violações axe de nível A/AA (contraste, labels, roles) | WCAG 2.2 AA |
| U-00.3 | Sem rolagem horizontal em 360 px | Android de entrada é o aparelho provável da persona |
| U-00.4 | Ação principal da tela nos 40% inferiores da viewport | Zona do polegar (DESIGN.md); uso com uma mão |
| U-00.5 | Valores sempre no formato `R$ 1.234,56` | H4 (consistência e padrões) |
| U-00.6 | Erros em pt-BR, ao lado do campo, dizendo como corrigir | H9 (ajudar a reconhecer e recuperar erros) |
| U-00.7 | Toda ação de gravar dá feedback visível em ≤ 1 s (toast ou estado) | H1 (visibilidade do estado do sistema) |
| U-00.8 | Navegável só por teclado, com foco visível | WCAG 2.1.1 / 2.4.7 |

**Achado de contraste:** texto branco sobre `#01CED1` não passa no AA. Regra: texto sobre turquesa claro é `#1A1A1A`; texto branco só sobre `#00A3A6` ou mais escuro, se passar no axe *(proposta)*.

## Design system

A fonte é `design/nubanko_neo_fintech/DESIGN.md`, traduzida para o `tailwind.config` e para variáveis CSS. As cores do resumo prevalecem quando houver conflito (ex.: fundo `#F7F8FA`, texto `#1A1A1A`). Os componentes base, cada um com teste de componente, são: botão (primário, secundário, ghost), campo, chip de categoria, card, barra de progresso, anel de progresso, rosca, bottom sheet, toast, teclado numérico, navegação inferior com "+", e o logo "NuBanko." com o ponto turquesa.

## Agentes *(time: quatro agentes)*

Definidos em `.claude/agents/`. Fluxo de cada tarefa de um plan: **arquitetura** valida a abordagem → **testes** escreve os testes que falham → **desenvolvimento** implementa até passar → **UI/UX** revisa a tela (screenshot do Playwright + critérios U) → **testes** confirma a matriz de rastreabilidade.

| Agente | Responsável por | Não faz |
|--------|-----------------|---------|
| `arquiteto` | Specs 00, ADRs em `docs/adr/`, migrações e RLS, revisão de plans e de PRs quanto à estrutura e segurança | Código de tela |
| `dev` | Implementação no Angular e SQL seguindo o plan, com TDD | Mudar escopo ou spec sem passar pelo arquiteto |
| `testes` | Testes unitários, pgTAP, Playwright e axe; matriz de rastreabilidade; cobertura | Ajustar teste para "passar" sem mudar a spec |
| `ui-ux` | Tokens e componentes visuais, critérios U, justificativas, revisão visual contra os mockups (respeitando as divergências) | Regra de negócio |

## Fluxo de branches *(time)*

Git flow com três branches permanentes:
- `master`: produção; só recebe merge de `test`
- `test`: homologação; recebe merge de `develop` para validação do time
- `develop`: integração; **toda branch de trabalho sai dela** e volta para ela

Branches de trabalho: `feature/<spec>-<assunto>` (ex.: `feature/02-teclado-numerico`) e `fix/<assunto>`. Commits em pt-BR, no imperativo, com prefixo do tipo (`feat:`, `fix:`, `test:`, `docs:`, `chore:`) e o ID do requisito quando houver (`feat(R-02.3): ...`) *(proposta)*. Versionamento (tags e releases) virá depois *(time)*.

## Registro de uso de IA *(time)*

Todo pedido relevante a uma IA e o que ela gerou ficam em `docs/ai/registro-ia.md`, em ordem cronológica. Cada entrada traz data, agente ou ferramenta, o pedido **resumido** (1 a 2 linhas, só o essencial), o que foi gerado, os arquivos afetados e se foi aceito ou ajustado. Não se cola prompt bruto, conversa inteira ou trecho sem relevância. Cada agente registra as próprias gerações ao fim da tarefa.

## Fica para o builder

Versões exatas de pacotes; nomes de pastas internas do Angular; escolha de ícones lineares (sugestão: Lucide, para combinar com o traço dos mockups); pipeline de CI (estrutura em plan próprio).
