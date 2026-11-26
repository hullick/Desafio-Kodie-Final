import { formatPercentual, formatPercentualFixo } from './numero';

describe('percentual', () => {
  it('formata em pt-BR', () => {
    expect(formatPercentual(40)).toBe('40%');
    expect(formatPercentual(37.5)).toBe('37,5%');
    expect(formatPercentualFixo(11)).toBe('11,0%');
    expect(formatPercentualFixo(41.6)).toBe('41,6%');
  });
});
