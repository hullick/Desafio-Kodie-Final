import { calcularMeta } from './meta';

const hoje = '2026-11-25';

describe('calcularMeta (R-04.2)', () => {
  it('sugere o valor mensal até o mês do prazo', () => {
    expect(calcularMeta({ metaCentavos: 200000, saldoCentavos: 80000, prazo: '2027-03-15' }, hoje)).toEqual({
      progresso: 0.4, percentual: 40, faltamCentavos: 120000, mesesRestantes: 5, sugeridoMensalCentavos: 24000, estado: 'ativa',
    });
  });

  it('prazo hoje ou ainda neste mês pede tudo o que falta', () => {
    for (const prazo of [hoje, '2026-11-30']) {
      const r = calcularMeta({ metaCentavos: 100000, saldoCentavos: 0, prazo }, hoje);
      expect([r.estado, r.mesesRestantes, r.sugeridoMensalCentavos, r.progresso]).toEqual(['ativa', 1, 100000, 0]);
    }
  });

  it('arredonda o sugerido para cima', () => {
    expect(calcularMeta({ metaCentavos: 100, saldoCentavos: 0, prazo: '2027-02-10' }, hoje).sugeridoMensalCentavos).toBe(25);
    expect(calcularMeta({ metaCentavos: 100, saldoCentavos: 0, prazo: '2027-01-31' }, hoje).sugeridoMensalCentavos).toBe(34);
  });

  it('marca meta atingida mesmo acima de 100%', () => {
    expect(calcularMeta({ metaCentavos: 40000, saldoCentavos: 41000, prazo: '2027-01-31' }, hoje)).toEqual({
      progresso: 1, percentual: 102.5, faltamCentavos: 0, mesesRestantes: 3, sugeridoMensalCentavos: null, estado: 'atingida',
    });
  });

  it('marca prazo encerrado no dia seguinte ao prazo', () => {
    for (const prazo of ['2026-11-24', '2026-10-31']) {
      const r = calcularMeta({ metaCentavos: 50000, saldoCentavos: 10000, prazo }, hoje);
      expect([r.estado, r.mesesRestantes, r.sugeridoMensalCentavos, r.faltamCentavos]).toEqual(['prazo_encerrado', 0, null, 40000]);
    }
  });

  it('trata meta zero sem dividir por zero', () => {
    expect(calcularMeta({ metaCentavos: 0, saldoCentavos: 0, prazo: hoje }, hoje).estado).toBe('atingida');
  });
});
