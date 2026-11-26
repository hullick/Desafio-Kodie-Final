# NuBanko: specs

Desenvolvimento orientado a specs: cada funcionalidade tem uma spec (o **quê** e o **porquê**) e um plan (o **como**, em tarefas) em `docs/plans/`. Nada é implementado sem spec aprovada pelo time.

| # | Spec | Depende de |
|---|------|-----------|
| 00 | [Fundação: arquitetura, segurança, testes, usabilidade, agentes](00-fundacao.md) | — |
| 01 | [Login e cadastro](01-autenticacao.md) | 00 |
| 02 | [Lançamentos](02-lancamentos.md) | 01 |
| 03 | [Painel do mês](03-painel-do-mes.md) | 02, 04 (resumo de caixinhas) |
| 04 | [Caixinhas](04-caixinhas.md) | 01 |
| 05 | [Perfil e privacidade](05-perfil-privacidade.md) | 01 |

Ordem de entrega sugerida: 00 → 01 → 02 → 04 → 03 → 05.

## Convenções

- **IDs rastreáveis:** requisitos `R-<spec>.<n>` (ex.: `R-02.3`) e critérios de usabilidade `U-<spec>.<n>`. Todo teste cita no nome o ID que cobre. Um requisito sem teste não está pronto.
- **Origem das decisões:** cada decisão está marcada como *(resumo)*, quando veio do resumo do projeto; *(time)*, quando foi decidida na conversa; ou *(proposta)*, quando é uma escolha técnica do autor da spec que o time pode revisar.
- **Mockups:** `design/*/screen.png` são a referência visual. **Quando o mockup diverge do resumo, vale o resumo** *(time)*.

## Divergências dos mockups (não implementar na v1)

| Tela | Elemento do mockup | Motivo |
|------|--------------------|--------|
| Login | "E-mail ou CPF" | CPF não é necessário (coleta mínima). O login é só por e-mail. |
| Login | "Senha de 6 dígitos" | Contradiz o cadastro (8+ caracteres, número e símbolo). Vale a regra do cadastro. |
| Login | "Entrar com Face ID ou Biometria" | Recurso nativo. A v1 é uma PWA. |
| Login | "SafeGuard 256-bit, criptografado de ponta a ponta" | **Afirmação falsa.** Não há criptografia ponta a ponta. Trocar por texto verdadeiro: "Senha protegida e conexão segura (HTTPS)". |
| Login | Selo "RK" | Sem significado no produto. Remover. |
| Cadastro | "100% gratuito · sem tarifas" | O app não movimenta dinheiro. Remover para não sugerir conta bancária. |
| Topo (todas) | Sino de notificações | Notificações estão fora do escopo. |
| Caixinhas | "Nível 3", "Prioridade alta", "Conquistas", "Filtrar" | Gamificação fora do escopo. Prioridade e filtro não estão no resumo. A seção "metas atingidas" fica, sem o tom de conquista. |
| Caixinhas / Nova / Detalhe | "Rendimento 100% CDI", "Plano sugerido com CDI" | Investimentos fora do escopo. O valor sugerido é aritmético, sem rendimento. |
| Caixinhas | "Usar saldo da caixinha" | Equivale a "Retirar". Usar esse rótulo. |
| Detalhe | "Pix agendado", "Saldo em conta", "Ver extrato" | Pix e conta bancária fora do escopo. O histórico mostra só guardar e retirar. |
| Detalhe | "Você está indo super bem!" | Mensagem motivacional / educação financeira: fora do escopo. |
| Perfil | "Dados pessoais: CPF, telefone e endereço" | Violaria a coleta mínima. Só nome e e-mail. |
| Perfil | "Categorias: personalizar" | As categorias são pré-definidas *(resumo)*. |
| Perfil | "Biometria", foto do avatar, "Nível Ouro", "Conta verificada" | Fora do escopo ou sem função na v1. O avatar mostra as iniciais. |
| Perfil | "Cliente desde Mar/2023", "v1.4.2" | Usar dados reais (data do cadastro, versão do build). |
