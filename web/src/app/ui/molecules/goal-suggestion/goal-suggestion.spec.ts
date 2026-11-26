import { limpo, renderizar } from '../../../../testing/renderizar';
import { NbGoalSuggestion } from './goal-suggestion';

describe('NbGoalSuggestion (U-04.3)', () => {
  it('mostra o sugerido e emite guardar', async () => {
    const r = await renderizar(NbGoalSuggestion, { sugeridoCentavos: 24000, nomeCaixinha: 'Celular novo' });
    let guardou = false;
    r.instancia.guardar.subscribe(() => (guardou = true));
    expect(limpo(r.q('p').textContent)).toBe('Guarde R$ 240,00/mês para atingir');
    const b = r.q('button');
    expect(b.getAttribute('aria-label')).toBe('Guardar em Celular novo');
    b.click();
    expect(guardou).toBe(true);
  });
});
