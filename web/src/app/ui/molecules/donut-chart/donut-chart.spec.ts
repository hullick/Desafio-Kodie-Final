import { renderizar } from '../../../../testing/renderizar';
import { NbDonutChart } from './donut-chart';

describe('NbDonutChart (U-03.3)', () => {
  it('gera uma fatia por item, proporcional, com texto alternativo', async () => {
    const r = await renderizar(NbDonutChart, {
      fatias: [
        { rotulo: 'Alimentação', valor: 32000, cor: '#00A3A6', percentual: 41.6 },
        { rotulo: 'Transporte', valor: 18000, cor: '#2563EB', percentual: 58.4 },
      ],
      valorCentro: 'R$ 500,00',
      legendaCentro: 'gasto',
    });
    const fatias = r.qs('circle[data-fatia]');
    expect(fatias).toHaveLength(2);
    expect(fatias[0].getAttribute('stroke-dasharray')).toBe('41.6 58.4');
    expect(fatias[1].getAttribute('stroke-dashoffset')).toBe('-41.6');
    expect(r.el.getAttribute('aria-label')).toBe('Gastos por categoria: Alimentação 41,6%, Transporte 58,4%');
    expect(r.texto()).toContain('Total');
  });

  it('desenha o anel completo com 100%', async () => {
    const r = await renderizar(NbDonutChart, { fatias: [{ rotulo: 'Lazer', valor: 1, cor: '#000', percentual: 100 }] });
    expect(r.q('circle[data-fatia]').getAttribute('stroke-dasharray')).toBe('100 0');
  });
});
