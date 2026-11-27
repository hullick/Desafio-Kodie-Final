import { provideRouter } from '@angular/router';
import { renderizar } from '../../../../testing/renderizar';
import { NbDetailTemplate } from './detail-template';

describe('NbDetailTemplate', () => {
  it('tem voltar rotulado e título', async () => {
    const r = await renderizar(NbDetailTemplate,
      { titulo: 'Nova caixinha', voltarPara: '/caixinhas', rotuloVoltar: 'Caixinhas', sobretitulo: 'Metas' }, [provideRouter([])]);
    const voltar = r.q('a');
    expect(voltar.getAttribute('href')).toBe('/caixinhas');
    expect(voltar.getAttribute('aria-label')).toBe('Voltar para Caixinhas');
    expect(r.q('h1').textContent).toBe('Nova caixinha');
  });
});
