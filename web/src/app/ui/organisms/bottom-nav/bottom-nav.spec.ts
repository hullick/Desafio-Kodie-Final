import { provideRouter } from '@angular/router';
import { renderizar } from '../../../../testing/renderizar';
import { NbBottomNav } from './bottom-nav';

describe('NbBottomNav (R-02.1)', () => {
  it('tem as três abas e o "+" que emite novo lançamento', async () => {
    const r = await renderizar(NbBottomNav, {}, [provideRouter([])]);
    expect(r.qs<HTMLAnchorElement>('a').map((a) => a.getAttribute('href'))).toEqual(['/inicio', '/caixinhas', '/perfil']);
    let novo = 0;
    r.instancia.novoLancamento.subscribe(() => novo++);
    r.q('button[aria-label="Novo lançamento"]').click();
    expect(novo).toBe(1);
  });
});
