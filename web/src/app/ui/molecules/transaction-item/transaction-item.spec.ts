import { limpo, renderizar } from '../../../../testing/renderizar';
import { NbTransactionItem } from './transaction-item';

describe('NbTransactionItem (R-02.8)', () => {
  it('mostra título, subtítulo e valor com sinal', async () => {
    const r = await renderizar(NbTransactionItem, {
      item: { id: 'l1', titulo: 'iFood Delivery', subtitulo: 'Alimentação • Hoje', centavos: 3850, tipo: 'gasto',
        icone: 'utensils', cor: '#00A3A6', fundo: '#E6FAFA' },
    });
    expect(limpo(r.texto())).toBe('iFood Delivery Alimentação • Hoje − R$ 38,50');
    expect(r.el.getAttribute('type')).toBe('button');
  });
});
