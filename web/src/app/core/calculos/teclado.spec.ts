import { centavosDeTexto, MAX_CENTAVOS, teclar } from './teclado';

describe('teclado (R-02.3)', () => {
  it('preenche da direita para a esquerda', () => {
    expect(teclar(0, '1')).toBe(1);
    expect(teclar(1, '2')).toBe(12);
    expect(teclar(12, '5')).toBe(125);
    expect(teclar(5, '00')).toBe(500);
    expect(teclar(0, '0')).toBe(0);
  });

  it('apaga o último dígito', () => {
    expect(teclar(125, 'apagar')).toBe(12);
    expect(teclar(0, 'apagar')).toBe(0);
  });

  it('respeita o máximo de R$ 999.999,99', () => {
    expect(teclar(MAX_CENTAVOS, '9')).toBe(MAX_CENTAVOS);
    expect(teclar(9_999_999, '00')).toBe(9_999_999);
  });

  it('converte texto em centavos', () => {
    expect(centavosDeTexto('R$ 1.234,56')).toBe(123456);
    expect(centavosDeTexto('')).toBe(0);
    expect(centavosDeTexto('000')).toBe(0);
    expect(centavosDeTexto('9999999999')).toBe(MAX_CENTAVOS);
  });
});
