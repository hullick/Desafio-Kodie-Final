import { renderizar } from '../../../../testing/renderizar';
import { NbBadge } from './badge';

describe('NbBadge', () => {
  it('aplica a variante', async () => {
    const r = await renderizar(NbBadge, { variante: 'ouro' });
    expect(r.el.className).toContain('bg-gold');
  });
});
