import { renderizar } from '../../../../testing/renderizar';
import { NbIcon } from './icon';

describe('NbIcon', () => {
  it('renderiza SVG decorativo por padrão', async () => {
    const r = await renderizar(NbIcon, { nome: 'wallet' });
    const svg = r.q('svg');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('width')).toBe('20');
  });

  it('expõe título quando tem rótulo', async () => {
    const r = await renderizar(NbIcon, { nome: 'eye', rotulo: 'Mostrar', tamanho: 24 });
    expect(r.q('svg title').textContent).toBe('Mostrar');
  });
});
