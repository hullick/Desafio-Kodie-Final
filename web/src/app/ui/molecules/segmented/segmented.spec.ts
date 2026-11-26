import { renderizar } from '../../../../testing/renderizar';
import { NbSegmented } from './segmented';

describe('NbSegmented', () => {
  it('marca a opção ativa e troca ao clicar', async () => {
    const r = await renderizar(NbSegmented, {
      opcoes: [{ valor: 'gasto', rotulo: 'Gasto' }, { valor: 'entrada', rotulo: 'Entrada' }],
      rotulo: 'Tipo de lançamento',
      valor: 'gasto',
    });
    expect(r.el.getAttribute('aria-label')).toBe('Tipo de lançamento');
    const [g, e] = r.qs('button');
    expect(g.getAttribute('aria-pressed')).toBe('true');
    e.click();
    await r.fixture.whenStable();
    expect(r.instancia.valor()).toBe('entrada');
    expect(e.getAttribute('aria-pressed')).toBe('true');
  });
});
