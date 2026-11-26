import { renderizar } from '../../../../testing/renderizar';
import { GrupoTransacoesVM, TransacaoItemVM } from '../../modelos';
import { NbTransactionList } from './transaction-list';

const item = (id: string, titulo: string): TransacaoItemVM => ({
  id, titulo, subtitulo: 'Alimentação • Hoje', centavos: 1000, tipo: 'gasto', icone: 'utensils', cor: '#000', fundo: '#fff',
});

describe('NbTransactionList (R-02.8)', () => {
  it('agrupa por dia e emite editar com o id', async () => {
    const grupos: GrupoTransacoesVM[] = [
      { rotulo: 'Hoje', itens: [item('l1', 'iFood')] },
      { rotulo: 'Ontem', itens: [item('l2', 'Metrô'), item('l3', 'Café')] },
    ];
    const r = await renderizar(NbTransactionList, { grupos });
    expect(r.qs('h3').map((h) => h.textContent)).toEqual(['Hoje', 'Ontem']);
    let id = '';
    r.instancia.editar.subscribe((x) => (id = x));
    r.q('button[aria-label="Editar Metrô"]').click();
    expect(id).toBe('l2');
  });

  it('sem itens mostra estado vazio', async () => {
    const r = await renderizar(NbTransactionList, { grupos: [], textoVazio: 'Nada em outubro.' });
    expect(r.texto()).toContain('Nada em outubro.');
  });
});
