import { renderizar } from '../../../../testing/renderizar';
import { NbAmountDisplay } from './amount-display';

describe('NbAmountDisplay', () => {
  it('mostra o número sem o prefixo e anuncia o valor', async () => {
    const r = await renderizar(NbAmountDisplay, { centavos: 0 });
    expect(r.qs('span')[1].textContent).toBe('0,00');
    expect(r.qs('span')[1].className).toContain('text-ink/40');
    await r.definir({ centavos: 123456, tom: 'entrada', rotulo: 'Valor do gasto' });
    expect(r.qs('span')[1].textContent).toBe('1.234,56');
    expect(r.qs('span')[1].className).toContain('text-pos-ink');
    expect(r.el.getAttribute('aria-label')).toBe('Valor do gasto: 1.234,56 reais');
  });
});
