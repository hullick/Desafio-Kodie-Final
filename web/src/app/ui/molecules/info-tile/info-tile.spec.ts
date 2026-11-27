import { renderizar } from '../../../../testing/renderizar';
import { NbInfoTile } from './info-tile';

describe('NbInfoTile', () => {
  it('mostra rótulo, valor e detalhe', async () => {
    const r = await renderizar(NbInfoTile, { icone: 'calendar', rotulo: 'Prazo final', valor: 'mar/2027', detalhe: 'Faltam 5 meses' });
    expect(r.texto()).toBe('Prazo final mar/2027 Faltam 5 meses');
  });
});
