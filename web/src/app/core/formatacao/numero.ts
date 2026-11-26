const pct = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 0 });
const pctFixo = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 });

/** "40%", "37,5%" (cards de caixinha). */
export function formatPercentual(valor: number): string {
  return `${pct.format(valor)}%`;
}

/** "41,6%", "11,0%" (lista de categorias, sempre 1 casa). */
export function formatPercentualFixo(valor: number): string {
  return `${pctFixo.format(valor)}%`;
}
