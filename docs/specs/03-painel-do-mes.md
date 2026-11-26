# Spec 03: Painel do mês (aba Início)

## Intenção

Responder em segundos "como está meu mês?" e "pra onde foi meu dinheiro?". Isso resolve o problema central do resumo: o jovem não sabe para onde o dinheiro vai.

## Regras de cálculo *(proposta, aprovada na conversa: guardar sai do saldo)*

Para o mês M do usuário:
- **Entradas** = soma dos lançamentos `entrada` em M
- **Gastos** = soma dos lançamentos `gasto` em M
- **Guardado líquido** = soma de `guardar` − soma de `retirar` dos movimentos de caixinha em M
- **Saldo do mês** = Entradas − Gastos − Guardado líquido

Guardar não é gasto: não aparece na rosca nem em "Gastos". O saldo pode ficar negativo e, nesse caso, é exibido em vermelho, sem bloquear nada. Os cálculos rodam numa view ou RPC no banco (`resumo_mes(ano, mes)`) com RLS, e a lógica é espelhada em funções puras testadas *(proposta)*.

## Requisitos

| ID | Requisito | Origem |
|----|-----------|--------|
| R-03.1 | A saudação "Olá, {nome}" e o seletor de mês (‹ Novembro 2026 ›) abrem no mês atual. Não é possível avançar além do mês atual. | mockup + proposta |
| R-03.2 | O card do saldo mostra o saldo do mês, com Entradas e Gastos em sub-cards (verde e vermelho). | resumo |
| R-03.3 | O botão de olho esconde e mostra os valores (`R$ ••••`). A preferência fica salva só no aparelho. | mockup; privacidade em lugar público |
| R-03.4 | A rosca mostra o gasto por categoria, com o total no centro. Abaixo vem a lista das categorias com percentual (1 casa decimal) e valor, ordenada do maior para o menor. Categorias sem gasto não aparecem. | resumo |
| R-03.5 | Em "Suas caixinhas", até 2 caixinhas ativas (as de prazo mais próximo), com barra e valor guardado, mais o link "Criar nova +". | resumo |
| R-03.6 | Em "Últimos lançamentos", os 4 mais recentes do mês, com o link "Ver todos" (spec 02, R-02.8). | resumo |
| R-03.7 | Estado vazio: num mês sem lançamentos, a rosca é substituída por "Nenhum gasto em {mês}. Toque no + para registrar o primeiro." | proposta: primeira impressão da persona |
| R-03.8 | Depois de criar, editar ou excluir um lançamento ou movimento de caixinha, o painel se atualiza sem recarregar a página. | proposta |
| R-03.9 | As cores da rosca vêm de uma paleta fixa por categoria e não dependem só da cor: a lista ao lado traz nome e percentual. | proposta; WCAG 1.4.1 |

## Telas

Referência: `design/painel_do_m_s_nubanko`, sem o sino de notificações.

## Usabilidade

| ID | Critério (testado) | Justificativa |
|----|--------------------|---------------|
| U-03.1 | Saldo, entradas e gastos visíveis sem rolar em 360×740 | "Se entende em segundos" (resumo); H8 |
| U-03.2 | O saldo usa o maior tamanho tipográfico da tela (`numeric-balance`) | Hierarquia: a informação mais importante chama mais atenção |
| U-03.3 | A rosca tem texto alternativo com o resumo ("Alimentação 41,6%, …") | WCAG 1.1.1 |
| U-03.4 | O estado vazio indica a próxima ação | H10 (ajuda) |
| U-03.5 | Trocar de mês dá feedback de carregamento e mantém a rolagem | H1 |

## Testes mínimos

Unidade para os cálculos: saldo com guardar e retirar, percentuais que somam 100% com arredondamento, saldo negativo e virada de mês no fuso de São Paulo; pgTAP para `resumo_mes` (respeita a RLS e o fuso); componente para a rosca (fatias, alternativo, vazio); Playwright para o painel com dados de seed, a navegação de mês, ocultar valores e o estado vazio.
