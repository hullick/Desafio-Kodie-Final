import { renderizar } from '../../../../testing/renderizar';
import { NbBottomSheet } from './bottom-sheet';

describe('NbBottomSheet (U-02.6)', () => {
  it('é um diálogo modal rotulado que recebe o foco', async () => {
    const r = await renderizar(NbBottomSheet, { rotulo: 'Novo lançamento' });
    const d = r.q('[role=dialog]');
    expect(d.getAttribute('aria-modal')).toBe('true');
    expect(d.getAttribute('aria-label')).toBe('Novo lançamento');
    expect(document.activeElement).toBe(d);
  });

  it('Esc e o fundo fecham', async () => {
    const r = await renderizar(NbBottomSheet, { rotulo: 'x' });
    let fechou = 0;
    r.instancia.fechar.subscribe(() => fechou++);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    r.q('[aria-hidden=true]').click();
    expect(fechou).toBe(2);
  });
});
