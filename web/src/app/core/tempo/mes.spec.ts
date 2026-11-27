import {
  formatarData, somarMesesISO,
  compararMes, hojeISO, intervaloDoMes, mesAtual, mesDeISO, mesesInclusivos, nomeMes,
  rotuloDia, rotuloMes, rotuloMesCurto, somarMeses, ultimoDiaISO,
} from './mes';

describe('mes', () => {
  it('usa o fuso de São Paulo na virada do dia', () => {
    const quaseMeiaNoiteSP = new Date('2026-12-01T01:00:00Z'); // 22h de 30/11 em SP
    expect(hojeISO(quaseMeiaNoiteSP)).toBe('2026-11-30');
    expect(mesAtual(quaseMeiaNoiteSP)).toEqual({ ano: 2026, mes: 11 });
  });

  it('formata rótulos', () => {
    expect(rotuloMes({ ano: 2026, mes: 11 })).toBe('Novembro 2026');
    expect(rotuloMesCurto({ ano: 2027, mes: 3 })).toBe('mar/2027');
    expect(nomeMes({ ano: 2026, mes: 3 })).toBe('março');
  });

  it('soma e compara meses atravessando o ano', () => {
    expect(somarMeses({ ano: 2026, mes: 12 }, 1)).toEqual({ ano: 2027, mes: 1 });
    expect(somarMeses({ ano: 2027, mes: 1 }, -1)).toEqual({ ano: 2026, mes: 12 });
    expect(compararMes({ ano: 2026, mes: 11 }, { ano: 2027, mes: 1 })).toBe(-1);
    expect(compararMes({ ano: 2026, mes: 11 }, { ano: 2026, mes: 11 })).toBe(0);
    expect(compararMes({ ano: 2027, mes: 1 }, { ano: 2026, mes: 12 })).toBe(1);
  });

  it('conta meses inclusivos', () => {
    expect(mesesInclusivos({ ano: 2026, mes: 11 }, { ano: 2027, mes: 3 })).toBe(5);
    expect(mesesInclusivos({ ano: 2026, mes: 11 }, { ano: 2026, mes: 11 })).toBe(1);
    expect(mesesInclusivos({ ano: 2026, mes: 11 }, { ano: 2026, mes: 10 })).toBe(0);
  });

  it('calcula intervalos e último dia', () => {
    expect(intervaloDoMes({ ano: 2026, mes: 12 })).toEqual({ inicio: '2026-12-01', fim: '2027-01-01' });
    expect(ultimoDiaISO({ ano: 2027, mes: 2 })).toBe('2027-02-28');
    expect(ultimoDiaISO({ ano: 2028, mes: 2 })).toBe('2028-02-29');
    expect(mesDeISO('2027-03-31')).toEqual({ ano: 2027, mes: 3 });
  });

  it('rotula dias relativos', () => {
    expect(rotuloDia('2026-11-25', '2026-11-25')).toBe('Hoje');
    expect(rotuloDia('2026-11-24', '2026-11-25')).toBe('Ontem');
    expect(rotuloDia('2026-12-31', '2027-01-01')).toBe('Ontem');
    expect(rotuloDia('2026-11-05', '2026-11-25')).toBe('5 de nov.');
  });

  it('formata data como dd/mm/aaaa', () => {
    expect(formatarData('2027-03-05')).toBe('05/03/2027');
  });

  it('soma meses numa data ISO, limitando ao fim do mês', () => {
    expect(somarMesesISO('2026-11-25', 6)).toBe('2027-05-25');
    expect(somarMesesISO('2026-08-31', 1)).toBe('2026-09-30');
    expect(somarMesesISO('2028-02-29', 12)).toBe('2029-02-28');
    expect(somarMesesISO('2026-11-25', 120)).toBe('2036-11-25');
  });
});
