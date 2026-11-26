const formatador = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** Máscara exibida quando a pessoa oculta os valores (R-03.3). */
export const MASCARA_VALOR = 'R$ ••••';

/** Formata centavos inteiros no padrão R$ 1.234,56 (com NBSP após "R$", como o Intl). */
export function formatBRL(centavos: number): string {
  return formatador.format(centavos / 100);
}

export type SinalValor = 'entrada' | 'gasto' | 'nenhum';

/** "+ R$ 1.412,00" para entrada, "− R$ 38,50" para gasto (sinal de menos tipográfico). */
export function formatBRLComSinal(centavos: number, sinal: SinalValor): string {
  const base = formatBRL(Math.abs(centavos));
  if (sinal === 'entrada') return `+ ${base}`;
  if (sinal === 'gasto') return `− ${base}`;
  return formatBRL(centavos);
}
