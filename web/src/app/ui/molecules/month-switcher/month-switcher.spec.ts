import { renderizar } from '../../../../testing/renderizar';
import { NbMonthSwitcher } from './month-switcher';

describe('NbMonthSwitcher (R-03.1)', () => {
  it('emite navegação e bloqueia o futuro', async () => {
    const r = await renderizar(NbMonthSwitcher, { rotulo: 'Novembro 2026', podeAvancar: false });
    const eventos: string[] = [];
    r.instancia.anterior.subscribe(() => eventos.push('ant'));
    r.instancia.proximo.subscribe(() => eventos.push('prox'));
    const [ant, prox] = r.qs<HTMLButtonElement>('button');
    expect(r.texto()).toContain('Novembro 2026');
    expect(prox.disabled).toBe(true);
    ant.click();
    await r.definir({ podeAvancar: true });
    prox.click();
    expect(eventos).toEqual(['ant', 'prox']);
  });
});
