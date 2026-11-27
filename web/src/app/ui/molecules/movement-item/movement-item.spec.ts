import { limpo, renderizar } from '../../../../testing/renderizar';
import { NbMovementItem } from './movement-item';

describe('NbMovementItem', () => {
  it('mostra guardar e retirar com sinal', async () => {
    const r = await renderizar(NbMovementItem, {
      item: { id: 'm1', tipo: 'guardar', titulo: 'Guardou', dataRotulo: '10 de out.', centavos: 30000 },
    });
    expect(limpo(r.texto())).toBe('Guardou 10 de out. + R$ 300,00');
    await r.definir({ item: { id: 'm2', tipo: 'retirar', titulo: 'Retirou', dataRotulo: 'Hoje', centavos: 500 } });
    expect(limpo(r.texto())).toBe('Retirou Hoje − R$ 5,00');
  });
});
