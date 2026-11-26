# Spec 02: Lançamentos (registro rápido)

## Intenção

É o coração do app: registrar um gasto ou uma entrada **em poucos segundos**. Se isso der mais trabalho que uma planilha, a Lari abandona o app como abandonou a planilha.

## Escopo

Criar, listar, editar e excluir lançamentos manuais.
Fora: recorrência, parcelamento, importação, categorização automática, anexos.

## Modelo

`lancamentos(id uuid, user_id, tipo 'gasto'|'entrada', valor_centavos bigint > 0, categoria text, descricao text null (até 60), data date, criado_em, atualizado_em)`, com RLS de dono (R-00.1).

**Categorias pré-definidas** *(resumo; lista dos mockups)*, guardadas como `check` no banco e como constante no front:
- **Gasto:** Alimentação, Transporte, Lazer, Compras, Contas, Saúde, Educação, Outros
- **Entrada** *(proposta)*: Salário/Bolsa, Extra, Presente, Outros

## Requisitos

| ID | Requisito | Origem |
|----|-----------|--------|
| R-02.1 | O "+" central abre um bottom sheet de novo lançamento a partir de qualquer aba. | resumo |
| R-02.2 | O seletor Gasto/Entrada vem em **Gasto** por padrão. Trocar o tipo troca os chips de categoria. | proposta: gasto é o caso mais frequente |
| R-02.3 | O valor é digitado num teclado numérico próprio que preenche da direita para a esquerda, em centavos ("1", "2", "5" vira R$ 1,25). Tem backspace. O máximo é R$ 999.999,99. | mockup + proposta |
| R-02.4 | É obrigatório escolher uma categoria. Nenhuma vem pré-selecionada. | proposta: pré-seleção gera dado errado silencioso |
| R-02.5 | A descrição é opcional, com até 60 caracteres. | resumo |
| R-02.6 | A data vem como "Hoje". Pode mudar para Ontem ou outra data do seletor, mas não para uma data futura. | proposta |
| R-02.7 | "Salvar" fica desabilitado até valor > 0 e categoria escolhida. Ao salvar, o sheet fecha, aparece o toast "Gasto registrado" ou "Entrada registrada" e o painel se atualiza. | mockup |
| R-02.8 | A lista "Ver todos" mostra os lançamentos do mês selecionado, agrupados por dia e do mais recente para o mais antigo. Cada um tem ícone da categoria, descrição (ou o nome da categoria, se vazia), categoria, data e valor (gasto `− R$` em vermelho, entrada `+ R$` em verde). | mockup |
| R-02.9 | Tocar num lançamento abre o mesmo sheet em modo edição, com "Excluir". Excluir pede confirmação. | proposta: corrigir erro é essencial (H3) |
| R-02.10 | Se a gravação falhar (sem rede), os dados do sheet são mantidos e aparece a mensagem "Não foi possível salvar. Tente de novo." | proposta |

## Telas

Referência: `design/novo_lan_amento_nubanko`. Sheet com alça; título "NOVO LANÇAMENTO"; seletor segmentado; valor grande; grade de chips 4×2; descrição e data na mesma linha; teclado; "Salvar" em largura total no rodapé.

## Usabilidade

| ID | Critério (testado) | Justificativa |
|----|--------------------|---------------|
| U-02.1 | Registrar um gasto a partir do Início leva **no máximo 3 toques além dos dígitos do valor**: "+", categoria, "Salvar". | Persona: "registrar em poucos segundos"; H7 |
| U-02.2 | O valor e os chips aparecem sem rolar em 360×740 | Reduz esforço; zona do polegar |
| U-02.3 | O teclado numérico fica nos 40% inferiores e o "Salvar" sempre visível | U-00.4 |
| U-02.4 | O chip selecionado tem estado visual **e** `aria-pressed` | H1; WCAG 4.1.2 |
| U-02.5 | Editar e excluir ficam a um toque a partir da lista | H3 (controle e liberdade) |
| U-02.6 | Com o sheet aberto, o botão voltar do navegador ou Esc fecha o sheet, sem sair do app | H3; comportamento esperado em Android |

## Testes mínimos

Unidade para o teclado (montagem de centavos, limite, backspace) e para a formatação; pgTAP para os checks (valor > 0, categoria válida para o tipo, data não futura) e para a RLS com A e B; componente para o sheet; Playwright para criar gasto, criar entrada, editar, excluir, erro de rede e para U-02.1, que conta os cliques.
