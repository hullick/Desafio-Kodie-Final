import { renderizar } from '../../../../testing/renderizar';
import { NbMonthSelect } from './month-select';

describe('NbMonthSelect (R-04.3)', () => {
  it('lista meses no intervalo e atualiza o valor', async () => {
    const r = await renderizar(NbMonthSelect, {
      valor: { ano: 2026, mes: 11 }, de: { ano: 2026, mes: 11 }, ate: { ano: 2027, mes: 2 },
    });
    const opts = r.qs<HTMLOptionElement>('option');
    expect(opts.map((o) => o.textContent)).toEqual(['Novembro 2026', 'Dezembro 2026', 'Janeiro 2027', 'Fevereiro 2027']);
    expect(opts[0].selected).toBe(true);
    const sel = r.q<HTMLSelectElement>('select');
    sel.value = '2027-1';
    sel.dispatchEvent(new Event('change'));
    expect(r.instancia.valor()).toEqual({ ano: 2027, mes: 1 });
    sel.value = 'inexistente';
    sel.dispatchEvent(new Event('change'));
    expect(r.instancia.valor()).toEqual({ ano: 2027, mes: 1 });
  });
});
