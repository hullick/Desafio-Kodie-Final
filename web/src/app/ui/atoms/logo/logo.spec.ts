import { renderizar } from '../../../../testing/renderizar';
import { NbLogo } from './logo';

describe('NbLogo', () => {
  it('mostra o ponto em turquesa e tem nome acessível', async () => {
    const r = await renderizar(NbLogo, { tamanho: 'lg' });
    expect(r.el.getAttribute('aria-label')).toBe('NuBanko');
    expect(r.q('.text-brand').textContent).toBe('.');
    expect(r.q('span').className).toContain('text-4xl');
  });
});
