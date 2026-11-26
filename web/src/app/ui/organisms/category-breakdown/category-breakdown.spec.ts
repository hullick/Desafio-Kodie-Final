import { limpo, renderizar } from '../../../../testing/renderizar';
import { FatiaCategoriaVM } from '../../modelos';
import { NbCategoryBreakdown } from './category-breakdown';

const fatias: FatiaCategoriaVM[] = [
  { id: 'alimentacao', rotulo: 'Alimentação', icone: 'utensils', cor: '#00A3A6', fundo: '#E6FAFA', centavos: 32000, percentual: 41.6 },
  { id: 'transporte', rotulo: 'Transporte', icone: 'bus', cor: '#2563EB', fundo: '#EFF4FF', centavos: 18000, percentual: 23.4 },
];

describe('NbCategoryBreakdown (R-03.4, R-03.7)', () => {
  it('mostra rosca com total e lista de categorias', async () => {
    const r = await renderizar(NbCategoryBreakdown, { fatias, totalCentavos: 76970, nomeMes: 'novembro' });
    expect(r.q('nb-donut-chart').getAttribute('aria-label')).toBe('Gastos por categoria: Alimentação 41,6%, Transporte 23,4%');
    expect(limpo(r.q('nb-badge').textContent)).toBe('Total: R$ 769,70');
    expect(r.qs('nb-category-row')).toHaveLength(2);
  });

  it('sem gastos mostra o estado vazio com a próxima ação (U-03.4)', async () => {
    const r = await renderizar(NbCategoryBreakdown, { fatias: [], totalCentavos: 0, nomeMes: 'outubro' });
    expect(r.el.querySelector('nb-donut-chart')).toBeNull();
    expect(r.texto()).toContain('Nenhum gasto em outubro. Toque no + para registrar o primeiro.');
  });
});
