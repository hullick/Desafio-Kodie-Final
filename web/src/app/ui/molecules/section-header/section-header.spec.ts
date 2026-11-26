import { renderizar } from '../../../../testing/renderizar';
import { NbSectionHeader } from './section-header';

describe('NbSectionHeader', () => {
  it('renderiza título como h2 e contador', async () => {
    const r = await renderizar(NbSectionHeader, { titulo: 'Metas em andamento', contador: 3 });
    expect(r.q('h2').textContent).toContain('Metas em andamento');
    expect(r.q('h2 span').textContent).toBe('3');
  });
});
