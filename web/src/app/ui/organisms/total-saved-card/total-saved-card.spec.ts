import { provideRouter } from '@angular/router';
import { limpo, renderizar } from '../../../../testing/renderizar';
import { NbTotalSavedCard } from './total-saved-card';

describe('NbTotalSavedCard (R-04.1)', () => {
  it('mostra o total, as ativas e o link de nova caixinha', async () => {
    const r = await renderizar(NbTotalSavedCard, { totalCentavos: 115000, ativas: 3 }, [provideRouter([])]);
    expect(limpo(r.texto())).toBe('Total guardado R$ 1.150,00 3 caixinhas ativas Nova caixinha');
    expect(r.q('a').getAttribute('href')).toBe('/caixinhas/nova');
  });
});
