import { limpo, renderizar } from '../../../../testing/renderizar';
import { NbMoneyInput } from './money-input';

describe('NbMoneyInput', () => {
  it('converte a digitação em centavos e reformata', async () => {
    const r = await renderizar(NbMoneyInput, { centavos: 0 });
    const input = r.q<HTMLInputElement>('input');
    expect(input.getAttribute('inputmode')).toBe('numeric');
    input.value = 'R$ 0,001';
    input.dispatchEvent(new Event('input'));
    expect(r.instancia.centavos()).toBe(1);
    expect(limpo(input.value)).toBe('R$ 0,01');
    input.value = '200000';
    input.dispatchEvent(new Event('input'));
    expect(limpo(input.value)).toBe('R$ 2.000,00');
  });
});
