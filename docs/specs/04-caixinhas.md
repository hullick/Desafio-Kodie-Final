# Spec 04: Caixinhas (metas)

## Intenção

Transformar "quero um celular novo" num número mensal concreto e mostrar o progresso, para a Lari guardar com um objetivo e não "o que sobrar". Nenhum dinheiro real se move: a caixinha é um registro manual *(resumo)*.

## Modelo

- `caixinhas(id, user_id, nome text (até 40), icone text (lista fixa), meta_centavos bigint > 0, prazo date (sempre o último dia do mês escolhido), criado_em, atualizado_em)`
- `movimentos_caixinha(id, user_id, caixinha_id, tipo 'guardar'|'retirar', valor_centavos > 0, data date, criado_em)`

Ambas com RLS de dono. Uma trigger garante que `caixinha_id` pertence ao mesmo `user_id`.

**Ícones** *(mockup)*: Aparelho, Viagem, Reserva, Estudos, Casa, Carro, Presente, Outro.

## Cálculos *(proposta)*

- **Saldo da caixinha** = Σ guardar − Σ retirar
- **Progresso** = saldo ÷ meta, limitado a 100% na barra (o texto pode mostrar "R$ 2.100,00 de R$ 2.000,00")
- **Meses restantes** = meses do mês atual até o mês do prazo, **incluindo os dois**, com mínimo 1
- **Valor sugerido por mês** = arredondar para cima, em centavos, (meta − saldo) ÷ meses restantes. Se saldo ≥ meta: "Meta atingida". Se o prazo já passou: "Prazo encerrado" e o valor que falta.
- **Meta atingida:** saldo ≥ meta. Usa o acento dourado `#FFE08F`, o único uso dele no app *(resumo: "usar pouco")*.

## Requisitos

| ID | Requisito | Origem |
|----|-----------|--------|
| R-04.1 | A lista mostra o card "Total guardado" (soma dos saldos) com o botão "Nova caixinha", seguido das caixinhas ativas por prazo mais próximo e, por fim, a seção "Metas atingidas". | resumo + mockup |
| R-04.2 | Cada card mostra ícone, nome, "R$ X de R$ Y", %, barra, "Prazo: até {mês/ano}" e "Guarde R$ Z/mês para atingir", com um botão "Guardar +". | resumo |
| R-04.3 | Nova caixinha pede ícone, nome, valor (teclado do R-02.3, com atalhos + R$ 500 / + R$ 1.000 / + R$ 2.000) e prazo (seletor de mês/ano, no mínimo o mês atual e no máximo 10 anos). O valor sugerido aparece ao vivo antes de criar. | resumo + mockup |
| R-04.4 | O detalhe mostra o anel de progresso, o saldo, "Faltam R$ X", os cards "Prazo final" e "Meta mensal", os botões **Guardar** e **Retirar** e o histórico de movimentos (mais recente primeiro). | resumo |
| R-04.5 | Guardar e Retirar abrem um sheet com o teclado numérico e a data (padrão hoje, sem futuro). Retirar não pode exceder o saldo da caixinha: a validação é feita no banco, e o front mostra "Você tem R$ X nesta caixinha". | proposta |
| R-04.6 | Guardar e Retirar afetam o saldo do mês conforme a spec 03. | time |
| R-04.7 | O menu ⋮ do detalhe tem "Editar" (nome, ícone, meta e prazo, com recálculo do sugerido) e "Excluir". Excluir só é permitido com saldo zero; com saldo, pede para retirar antes. | proposta: evita sumir com dinheiro do saldo do mês |
| R-04.8 | Uma caixinha com meta atingida continua aceitando Guardar e Retirar. | proposta |
| R-04.9 | Estado vazio: "Crie sua primeira caixinha. Ex.: celular novo, viagem, reserva." e o botão de criar. | proposta |

## Telas

Referências: `design/caixinhas_nubanko`, `design/nova_caixinha_nubanko`, `design/detalhe_da_caixinha_nubanko`, sem CDI, rendimento, nível, prioridade, Pix e mensagens motivacionais (ver README).

## Usabilidade

| ID | Critério (testado) | Justificativa |
|----|--------------------|---------------|
| U-04.1 | Criar uma caixinha leva 1 tela, com no máximo 4 decisões (ícone, nome, valor, prazo) | Persona; H8 |
| U-04.2 | O valor sugerido aparece e se atualiza **antes** de criar | O resumo pede "quanto guardar por mês"; H1 |
| U-04.3 | "Guardar" fica a 1 toque a partir da lista (sem abrir o detalhe) | H7 (atalho para a ação frequente) |
| U-04.4 | O erro de retirada acima do saldo diz o valor disponível | H9 |
| U-04.5 | A barra de progresso tem `role=progressbar` com `aria-valuenow` | WCAG 4.1.2 |

## Testes mínimos

Unidade para o valor sugerido (prazo no mês atual, prazo passado, meta atingida, arredondamento para cima, virada de ano); pgTAP para a RLS, a trigger de dono da caixinha, a retirada acima do saldo e a exclusão com saldo; componente para os cards e o anel; Playwright para criar, guardar, retirar, editar, excluir e atingir meta (acento dourado), e para o reflexo no saldo do painel.
