import { renderizar } from '../../../../testing/renderizar';
import { NbEmptyState } from './empty-state';

describe('NbEmptyState', () => {
  it('mostra título e texto', async () => {
    const r = await renderizar(NbEmptyState, { titulo: 'Nada aqui', texto: 'Toque no +' });
    expect(r.texto()).toBe('Nada aqui Toque no +');
  });
});
