import { calcularMeta } from './meta';

const hoje = { ano: 2026, mes: 11 };

describe('calcularMeta (R-04.2)', () => {
  it('sugere o valor mensal até o prazo', () => {
    expect(calcularMeta({ metaCentavos: 200000, saldoCentavos: 80000, prazo: { ano: 2027, mes: 3 } }, hoje)).toEqual({
      progresso: 0.4, percentual: 40, faltamCentavos: 120000, mesesRestantes: 5, sugeridoMensalCentavos: 24000, estado: 'ativa',
    });
  });

  it('prazo no mês atual pede tudo o que falta', () => {
    const r = calcularMeta({ metaCentavos: 100000, saldoCentavos: 0, prazo: hoje }, hoje);
    expect(r.mesesRestantes).toBe(1);
    expect(r.sugeridoMensalCentavos).toBe(100000);
    expect(r.progresso).toBe(0);
  });

  it('arredonda o sugerido para cima', () => {
    expect(calcularMeta({ metaCentavos: 100, saldoCentavos: 0, prazo: { ano: 2027, mes: 2 } }, hoje).sugeridoMensalCentavos).toBe(25);
    expect(calcularMeta({ metaCentavos: 100, saldoCentavos: 0, prazo: { ano: 2027, mes: 1 } }, hoje).sugeridoMensalCentavos).toBe(34);
  });

  it('marca meta atingida mesmo acima de 100%', () => {
    expect(calcularMeta({ metaCentavos: 40000, saldoCentavos: 41000, prazo: { ano: 2027, mes: 1 } }, hoje)).toEqual({
      progresso: 1, percentual: 102.5, faltamCentavos: 0, mesesRestantes: 3, sugeridoMensalCentavos: null, estado: 'atingida',
    });
  });

  it('marca prazo encerrado', () => {
    const r = calcularMeta({ metaCentavos: 50000, saldoCentavos: 10000, prazo: { ano: 2026, mes: 10 } }, hoje);
    expect(r.estado).toBe('prazo_encerrado');
    expect(r.mesesRestantes).toBe(0);
    expect(r.sugeridoMensalCentavos).toBeNull();
    expect(r.faltamCentavos).toBe(40000);
  });

  it('trata meta zero sem dividir por zero', () => {
    expect(calcularMeta({ metaCentavos: 0, saldoCentavos: 0, prazo: hoje }, hoje).estado).toBe('atingida');
  });
});
