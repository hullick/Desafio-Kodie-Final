import { formatBRL, formatBRLComSinal, MASCARA_VALOR } from './dinheiro';

describe('dinheiro (U-00.5)', () => {
  it('formata centavos no padrão brasileiro', () => {
    expect(formatBRL(123456)).toBe('R$ 1.234,56');
    expect(formatBRL(0)).toBe('R$ 0,00');
    expect(formatBRL(-1234)).toBe('-R$ 12,34');
  });

  it('aplica sinal de entrada e gasto', () => {
    expect(formatBRLComSinal(141200, 'entrada')).toBe('+ R$ 1.412,00');
    expect(formatBRLComSinal(3850, 'gasto')).toBe('− R$ 38,50');
    expect(formatBRLComSinal(-500, 'nenhum')).toBe('-R$ 5,00');
  });

  it('expõe a máscara de valores ocultos', () => {
    expect(MASCARA_VALOR).toBe('R$ ••••');
  });
});
