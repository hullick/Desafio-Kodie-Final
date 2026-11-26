import { renderizar } from '../../../../testing/renderizar';
import { NbMovementHistory } from './movement-history';

describe('NbMovementHistory', () => {
  it('lista movimentos ou mostra o vazio', async () => {
    const r = await renderizar(NbMovementHistory, {
      itens: [{ id: 'm1', tipo: 'guardar', titulo: 'Guardou', dataRotulo: '10 de out.', centavos: 30000 }],
    });
    expect(r.qs('nb-movement-item')).toHaveLength(1);
    await r.definir({ itens: [] });
    expect(r.texto()).toContain('Nada guardado ainda');
  });
});
