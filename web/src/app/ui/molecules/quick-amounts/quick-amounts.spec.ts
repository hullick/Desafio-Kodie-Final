import { limpo, renderizar } from '../../../../testing/renderizar';
import { NbQuickAmounts } from './quick-amounts';

describe('NbQuickAmounts (R-04.3)', () => {
  it('mostra os atalhos e emite o valor', async () => {
    const r = await renderizar(NbQuickAmounts);
    const somados: number[] = [];
    r.instancia.somar.subscribe((v) => somados.push(v));
    expect(r.qs('button').map((b) => limpo(b.textContent))).toEqual(['+ R$ 500', '+ R$ 1.000', '+ R$ 2.000']);
    r.qs('button')[1].click();
    expect(somados).toEqual([100000]);
  });
});
