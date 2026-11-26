import { renderizar } from '../../../../testing/renderizar';
import { NbIconTile } from './icon-tile';

describe('NbIconTile', () => {
  it('aplica tamanho e cores', async () => {
    const r = await renderizar(NbIconTile, { icone: 'bus', tamanho: 'lg', fundo: 'rgb(1, 2, 3)', cor: 'rgb(4, 5, 6)' });
    expect(r.el.className).toContain('size-14');
    expect(r.el.style.backgroundColor).toBe('rgb(1, 2, 3)');
    expect(r.el.style.color).toBe('rgb(4, 5, 6)');
    expect(r.q('svg').getAttribute('width')).toBe('26');
  });
});
