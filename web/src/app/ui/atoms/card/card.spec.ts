import { renderizar } from '../../../../testing/renderizar';
import { NbCard } from './card';

describe('NbCard', () => {
  it('aplica raio e padding', async () => {
    const r = await renderizar(NbCard, { padding: 'md', raio: 'box' });
    expect(r.el.className).toContain('rounded-box');
    expect(r.el.className).toContain('p-4');
  });
});
