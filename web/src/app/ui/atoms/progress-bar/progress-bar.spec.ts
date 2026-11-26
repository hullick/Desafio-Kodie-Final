import { renderizar } from '../../../../testing/renderizar';
import { NbProgressBar } from './progress-bar';

describe('NbProgressBar (U-04.5)', () => {
  it('expõe aria-valuenow e limita entre 0 e 100', async () => {
    const r = await renderizar(NbProgressBar, { valor: 0.4, rotulo: 'Progresso' });
    expect(r.el.getAttribute('role')).toBe('progressbar');
    expect(r.el.getAttribute('aria-valuenow')).toBe('40');
    await r.definir({ valor: 1.7, variante: 'ouro' });
    expect(r.el.getAttribute('aria-valuenow')).toBe('100');
    expect(r.q('[data-preenchimento]').className).toContain('to-gold');
    await r.definir({ valor: 0 });
    expect(r.q<HTMLElement>('[data-preenchimento]').style.width).toBe('0%');
  });
});
