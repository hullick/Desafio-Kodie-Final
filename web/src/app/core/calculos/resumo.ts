import { ehCategoriaGasto } from '../dominio/categorias';
import { CategoriaGastoId, Lancamento, MovimentoCaixinha, ResumoMes } from '../dominio/tipos';

/**
 * Regra da spec 03: saldo = entradas − gastos − (guardar − retirar), tudo no mês.
 * Recebe apenas itens já filtrados para o mês.
 */
export function calcularResumo(lancamentos: readonly Lancamento[], movimentos: readonly MovimentoCaixinha[]): ResumoMes {
  let entradas = 0;
  let gastos = 0;
  const porCategoria = new Map<CategoriaGastoId, number>();
  for (const l of lancamentos) {
    if (l.tipo === 'entrada') {
      entradas += l.valorCentavos;
    } else {
      gastos += l.valorCentavos;
      if (ehCategoriaGasto(l.categoria)) {
        porCategoria.set(l.categoria, (porCategoria.get(l.categoria) ?? 0) + l.valorCentavos);
      }
    }
  }
  const guardadoLiquido = movimentos.reduce(
    (acc, m) => acc + (m.tipo === 'guardar' ? m.valorCentavos : -m.valorCentavos), 0);

  return {
    entradas,
    gastos,
    guardadoLiquido,
    saldo: entradas - gastos - guardadoLiquido,
    porCategoria: [...porCategoria.entries()]
      .map(([categoria, total]) => ({ categoria, total }))
      .sort((a, b) => b.total - a.total),
  };
}

/**
 * Percentuais com 1 casa decimal que somam exatamente 100,0 (método do maior resto, em décimos).
 * Empates no resto favorecem quem vem primeiro.
 */
export function percentuais<T extends { total: number }>(itens: readonly T[]): (T & { percentual: number })[] {
  const soma = itens.reduce((a, i) => a + i.total, 0);
  if (soma <= 0) return itens.map((i) => ({ ...i, percentual: 0 }));
  const brutos = itens.map((i) => (i.total / soma) * 1000);
  const base = brutos.map(Math.floor);
  let sobra = 1000 - base.reduce((a, b) => a + b, 0);
  const ordem = brutos
    .map((b, idx) => ({ idx, resto: b - Math.floor(b) }))
    .sort((a, b) => b.resto - a.resto || a.idx - b.idx);
  for (const { idx } of ordem) {
    if (sobra <= 0) break;
    base[idx] += 1;
    sobra -= 1;
  }
  return itens.map((i, idx) => ({ ...i, percentual: base[idx] / 10 }));
}
