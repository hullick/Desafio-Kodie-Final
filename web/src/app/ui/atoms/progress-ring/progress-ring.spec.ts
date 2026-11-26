import { renderizar } from '../../../../testing/renderizar';
import { NbProgressRing } from './progress-ring';

describe('NbProgressRing', () => {
  it('calcula o deslocamento do traço e expõe ARIA', async () => {
    const r = await renderizar(NbProgressRing, { valor: 0.4, rotulo: 'Progresso da meta', tamanho: 100, espessura: 10 });
    expect(r.el.getAttribute('aria-valuenow')).toBe('40');
    const c = r.q('circle[data-progresso]');
    const circ = 2 * Math.PI * 45;
    expect(Number(c.getAttribute('stroke-dashoffset'))).toBeCloseTo(circ * 0.6);
    await r.definir({ variante: 'ouro', valor: 1 });
    expect(c.getAttribute('stroke')).toBe('var(--color-gold)');
    expect(Number(c.getAttribute('stroke-dashoffset'))).toBe(0);
  });
});
