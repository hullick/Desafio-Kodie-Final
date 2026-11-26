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
| Hospedagem | **Netlify**: o front estático e a API no mesmo domínio *(time)* |
| Backend | **Netlify Functions** (TypeScript, Node) expostas em `/api/*`. Sem Supabase *(time; ver `docs/adr/0001-backend-netlify.md`)* |
| Banco | **Netlify DB** (Postgres gerenciado pela Neon) em produção; `postgres:17` no Docker localmente. Migrações em SQL puro (`db/migrations/`), sem ORM, para o banco continuar testável com pgTAP *(proposta)* |
| Autenticação | **Better Auth** (e-mail e senha) rodando numa Netlify Function em `/api/auth/*`, com as tabelas no próprio Postgres (schema `auth`). Sessão em cookie `HttpOnly` *(time)* |
| Acesso a dados (front) | Repositórios HTTP (`HttpClient` para `/api/*`) e o client do Better Auth atrás das classes abstratas de `core/dados/`. Os componentes não sabem que existe uma API, o que permite trocar o backend no futuro *(proposta)* |
| Acesso a dados (functions) | `pg` (node-postgres) com a URL **pooled** do Neon, a mesma biblioteca localmente e em produção. Toda function de domínio passa pelo helper `comUsuario` (ver Segurança) *(proposta)* |
| Testes | Vitest (unidade e componente no front; integração das functions contra o Postgres do compose), pgTAP (banco e RLS), Playwright (e2e e usabilidade), `@axe-core/playwright` (acessibilidade) |

## Ambiente local: Docker Compose *(time)*

Um `docker-compose.yml` na raiz sobe tudo isolado numa rede própria, com o comando `docker compose up`:

- `db`: Postgres 17 (imagem `postgres:17`), a mesma versão principal do Netlify DB
- `migrate`: aplica `db/migrations/*.sql` e encerra
- `mail`: Mailpit (confirmação de cadastro e recuperação de senha sem enviar e-mail real)
- `app`: **Netlify CLI** (`netlify dev`) em `localhost:8888`. Sobe o dev server do Angular, as Functions e os redirects do `netlify.toml` atrás de um único endereço, como em produção
- `dbtest` (profile `test`): runner pgTAP contra `db`
- `e2e` (profile `test`): imagem oficial do Playwright, roda contra `app`

Não existe imagem Docker oficial da Netlify: o que roda localmente é a **emulação da CLI**. Ela não reproduz timeout, cold start nem limites de payload, que são validados nos deploy previews *(proposta)*. Os segredos ficam em `.env` (fora do controle de versão), com um `.env.example` versionado. O banco de teste é recriado a cada execução de testes.

## Hospedagem e deploy *(proposta)*

- **Netlify** serve `web/dist/web/browser` e as Functions de `netlify/functions/`, configurados no `netlify.toml` da raiz. O fallback de SPA (`/* → /index.html 200`) não pode capturar `/api/*`.
- **Bancos:** um Netlify DB para produção (`master`) e outro para homologação (`test`), que também atende os deploy previews dos PRs. Nenhum preview fala com o banco de produção.
- **Migrações** rodam no GitHub Actions com a URL **direta** (não pooled) do banco de destino, antes do deploy. Por isso precisam ser compatíveis com a versão anterior do código (adicionar antes, remover depois).
- **Pipeline:** PR → testes no GitHub Actions (Vitest, pgTAP, Playwright) + deploy preview da Netlify; `test` → homologação; `master` → produção, só com os checks verdes. O detalhe fica num plan próprio de CI/CD.

## Modelo de dados (visão geral)

O detalhe de cada tabela está na spec dona dela. Todas as tabelas de domínio têm `user_id text not null default app.usuario_id() references auth."user"(id) on delete cascade`. O id é `text` porque é o formato do Better Auth.

| Tabela | Spec |
|--------|------|
| `auth.user`, `auth.session`, `auth.account`, `auth.verification` (do Better Auth, fora de `public`) | 01 |
| `perfis` (nome, aceite da política) | 01 |
| `lancamentos` | 02 |
| `caixinhas`, `movimentos_caixinha` | 04 |

**Dinheiro:** sempre em **centavos inteiros** (`bigint`), nunca `float`. A formatação `R$ 1.234,56` acontece só na exibição (`Intl.NumberFormat('pt-BR', {style:'currency', currency:'BRL'})`) *(proposta)*.
**Datas:** `date` para a data do lançamento. O "mês" é calculado no fuso `America/Sao_Paulo` *(proposta)*.

## Segurança *(resumo; a implementação é proposta)*

| Requisito | Como |
|-----------|------|
| R-00.1: cada pessoa vê só os próprios dados | **Duas camadas.** (1) Toda function de domínio usa `comUsuario(req, fn)`: valida a sessão do Better Auth (sem sessão, `401`), abre uma transação, executa `set_config('app.user_id', <id>, true)` e só então roda as queries. (2) **RLS habilitado em todas as tabelas de `public`**, com políticas `user_id = app.usuario_id()` para select, insert, update e delete. As functions conectam com o papel `nubanko_app`, que não é dono das tabelas nem tem `BYPASSRLS`. Se alguém esquecer um filtro no código, o banco ainda barra. |
| R-00.2: senha com hash | Better Auth (scrypt). O app nunca armazena nem loga senha. |
| R-00.3: tráfego só por HTTPS | A Netlify serve front e API só em HTTPS, com HSTS no `netlify.toml`. A conexão com o Neon exige TLS (`sslmode=require`). A PWA exige HTTPS. Localmente, HTTP em `localhost`, que é aceitável. |
| R-00.4: regras de acesso por dono | Igual a R-00.1, mais `user_id` preenchido pelo banco (`default app.usuario_id()`) e imutável por trigger. A API não aceita `user_id` no corpo das requisições; o cliente não escolhe o dono. |
| R-00.5: coleta mínima | Só nome, e-mail, senha e o registro do aceite. Sem CPF, telefone, endereço, analytics ou rastreadores de terceiros. O Better Auth guarda IP e user-agent na sessão; isso aparece no texto de privacidade (spec 05). |
| R-00.6: segredos do servidor nunca vão para o front | `DATABASE_URL`, `BETTER_AUTH_SECRET` e as credenciais de SMTP existem só nas variáveis de ambiente das Functions. Teste automatizado verifica que o bundle não contém nenhum deles. |
| R-00.7: cookies de sessão seguros | Cookie `HttpOnly`, `Secure` (em produção) e `SameSite=Lax`. O Better Auth confere a origem das requisições de escrita (`trustedOrigins`), o que cobre CSRF. |

**Testes obrigatórios de segurança:**
- **Banco:** para cada tabela, um teste pgTAP com dois usuários (A e B) prova que B não lê, não altera e não apaga dados de A, e que, sem `app.user_id`, nada é acessível.
- **API:** para cada endpoint de domínio, um teste de integração com as sessões de A e B prova que B recebe `404` (nunca os dados de A) e que, sem sessão, a resposta é `401`.
- **Guarda estático:** um teste falha se algum arquivo de `netlify/functions/` (exceto `auth` e `saude`) não usar `comUsuario`.

## Estratégia de testes *(time: "tudo deverá ter teste")*

- **Regra de pronto:** cada `R-xx.n` e `U-xx.n` tem pelo menos um teste que cita o ID. O agente de testes mantém uma matriz em `docs/rastreabilidade.md`.
- **TDD:** o teste é escrito antes e precisa falhar primeiro.
- **Camadas:** a lógica pura (cálculos de saldo e valor sugerido, formatação) fica em funções puras com testes unitários; componentes, com teste de componente; regras de banco e RLS, com pgTAP; functions, com testes de integração (Vitest chamando o handler contra o Postgres do compose); fluxos, com Playwright.
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
| `arquiteto` | Specs 00, ADRs em `docs/adr/`, migrações, RLS, papéis do banco, contrato da API e configuração do Better Auth; revisão de plans e de PRs quanto à estrutura e segurança | Código de tela |
| `dev` | Implementação no Angular, nas Functions e em SQL seguindo o plan, com TDD | Mudar escopo ou spec sem passar pelo arquiteto |
| `testes` | Testes unitários, de integração da API, pgTAP, Playwright e axe; matriz de rastreabilidade; cobertura | Ajustar teste para "passar" sem mudar a spec |
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

Versões exatas de pacotes; nomes de pastas internas do Angular; escolha de ícones lineares (sugestão: Lucide, para combinar com o traço dos mockups); pipeline de CI/CD (estrutura em plan próprio); provedor de SMTP de produção (sugestão: um que tenha plano gratuito e servidor no Brasil ou nos EUA, registrado na política de privacidade); confirmar na documentação atual do Better Auth os nomes exatos das opções citadas nos plans (hooks, rate limit em banco, schema `auth`).
