# Registro de uso de IA

Rastreio do que foi pedido a ferramentas de IA e do que elas geraram. Só o essencial: o pedido resumido em 1 a 2 linhas, sem prompts brutos.

| Data | Agente/ferramenta | Pedido (resumo) | Gerado | Arquivos | Status |
|------|-------------------|-----------------|--------|----------|--------|
| (anterior) | Ferramenta de design (não registrada) | Mockups das 8 telas e design system a partir do resumo | Telas HTML/PNG e `DESIGN.md` | `design/` | Aceito com divergências (ver `docs/specs/README.md`) |
| 2026-11-25 | Claude Code (Opus 5.5) | Quebrar o NuBanko em specs no formato SDD; Angular PWA, Supabase, Docker Compose, Playwright para usabilidade e 4 agentes | Specs 00 a 05, índice com divergências dos mockups, este registro | `docs/specs/*`, `docs/ai/registro-ia.md` | Aguardando revisão do time |
| 2026-11-25 | Claude Code (Opus 5.5) | Escrever os plans de implementação das specs 00 a 05 (TDD, Docker Compose, git flow) | Plans com tarefas, interfaces e testes; seção de git flow na spec 00; tecla "00" no lugar da vírgula (spec 02) | `docs/plans/*`, `docs/specs/00-fundacao.md`, `docs/specs/02-lancamentos.md` | Aguardando revisão do time |
| 2026-11-25 | Claude Code (Opus 5.5) | Criar o app Angular, checar saúde e quebrar o design em átomos ao máximo, com serviços que montam as páginas | Angular 22 com Vitest; núcleo (domínio, cálculos, repositórios em memória); átomos, moléculas, organismos e templates; páginas com um facade cada; sessão e guarda em memória | `web/` | Aguardando revisão do time |
