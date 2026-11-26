import { Lancamento, MovimentoCaixinha } from '../dominio/tipos';
import { calcularResumo, percentuais } from './resumo';

const l = (p: Partial<Lancamento>): Lancamento => ({
  id: 'x', tipo: 'gasto', valorCentavos: 0, categoria: 'outros_gasto', descricao: null,
  data: '2026-11-10', criadoEm: '', ...p,
});
const m = (p: Partial<MovimentoCaixinha>): MovimentoCaixinha => ({
  id: 'm', caixinhaId: 'c', tipo: 'guardar', valorCentavos: 0, data: '2026-11-10', criadoEm: '', ...p,
});

describe('calcularResumo (R-03.2)', () => {
  it('desconta o guardado líquido do saldo e agrupa gastos', () => {
    const r = calcularResumo(
      [
        l({ tipo: 'entrada', categoria: 'salario', valorCentavos: 141200 }),
        l({ categoria: 'alimentacao', valorCentavos: 32000 }),
        l({ categoria: 'transporte', valorCentavos: 18000 }),
        l({ categoria: 'alimentacao', valorCentavos: 1000 }),
      ],
      [m({ valorCentavos: 30000 }), m({ tipo: 'retirar', valorCentavos: 5000 })],
    );
    expect(r).toEqual({
      entradas: 141200,
      gastos: 51000,
      guardadoLiquido: 25000,
      saldo: 65200,
      porCategoria: [
        { categoria: 'alimentacao', total: 33000 },
        { categoria: 'transporte', total: 18000 },
      ],
    });
  });

  it('permite saldo negativo', () => {
    expect(calcularResumo([l({ valorCentavos: 500 })], []).saldo).toBe(-500);
  });

  it('mês vazio zera tudo', () => {
    expect(calcularResumo([], [])).toEqual({ entradas: 0, gastos: 0, guardadoLiquido: 0, saldo: 0, porCategoria: [] });
  });
});

describe('percentuais (R-03.4)', () => {
  it('reproduz o mockup e soma 100,0', () => {
    const r = percentuais([32000, 18000, 13500, 8470, 5000].map((total) => ({ total })));
    expect(r.map((x) => x.percentual)).toEqual([41.6, 23.4, 17.5, 11, 6.5]);
    expect(r.reduce((a, x) => a + x.percentual * 10, 0)).toBe(1000);
  });

  it('divide empates a favor do primeiro', () => {
    expect(percentuais([{ total: 1 }, { total: 1 }, { total: 1 }]).map((x) => x.percentual)).toEqual([33.4, 33.3, 33.3]);
  });

  it('trata lista única e vazia', () => {
    expect(percentuais([{ total: 5 }])[0].percentual).toBe(100);
    expect(percentuais([])).toEqual([]);
    expect(percentuais([{ total: 0 }])[0].percentual).toBe(0);
  });
});
