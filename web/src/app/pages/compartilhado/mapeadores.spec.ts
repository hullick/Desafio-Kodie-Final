import { Caixinha, Lancamento } from '../../core/dominio/tipos';
import { agruparPorDia, paraCaixinhaVM, paraFatiasVM, paraMovimentoVM, paraTransacaoVM } from './mapeadores';

const hoje = '2026-11-25';
const l = (id: string, data: string, descricao: string | null = null): Lancamento => ({
  id, tipo: 'gasto', valorCentavos: 3850, categoria: 'alimentacao', descricao, data, criadoEm: '',
});

describe('mapeadores', () => {
  it('lançamento usa a descrição ou o nome da categoria (R-02.8)', () => {
    expect(paraTransacaoVM(l('l1', hoje, 'iFood'), hoje)).toMatchObject({ titulo: 'iFood', subtitulo: 'Alimentação • Hoje', icone: 'utensils' });
    expect(paraTransacaoVM(l('l2', '2026-11-24'), hoje).titulo).toBe('Alimentação');
  });

  it('agrupa por dia na ordem recebida', () => {
    const g = agruparPorDia([l('a', hoje), l('b', '2026-11-24'), l('c', '2026-11-24'), l('d', '2026-11-15')], hoje);
    expect(g.map((x) => [x.rotulo, x.itens.length])).toEqual([['Hoje', 1], ['Ontem', 2], ['15 de nov.', 1]]);
    expect(g[1].itens[0].subtitulo).toBe('Alimentação');
  });

  it('fatias somam 100% com 1 casa (R-03.4)', () => {
    const f = paraFatiasVM([{ categoria: 'alimentacao', total: 32000 }, { categoria: 'transporte', total: 18000 },
      { categoria: 'lazer', total: 13500 }, { categoria: 'compras', total: 8470 }, { categoria: 'contas', total: 5000 }]);
    expect(f.map((x) => x.percentual)).toEqual([41.6, 23.4, 17.5, 11, 6.5]);
    expect(f[0]).toMatchObject({ rotulo: 'Alimentação', cor: '#00A3A6' });
  });

  it('caixinha traz progresso, prazo e sugerido (R-04.2)', () => {
    const c: Caixinha = { id: 'c3', nome: 'Celular novo', icone: 'aparelho', metaCentavos: 200000, prazo: '2027-03-15',
      saldoCentavos: 80000, criadoEm: '' };
    expect(paraCaixinhaVM(c, hoje)).toMatchObject({
      icone: 'smartphone', percentual: 40, prazoRotulo: '15/03/2027', sugeridoCentavos: 24000, estado: 'ativa',
    });
  });

  it('movimento vira Guardou/Retirou', () => {
    expect(paraMovimentoVM({ id: 'm', caixinhaId: 'c', tipo: 'retirar', valorCentavos: 100, data: hoje, criadoEm: '' }, hoje))
      .toEqual({ id: 'm', tipo: 'retirar', titulo: 'Retirou', dataRotulo: 'Hoje', centavos: 100 });
  });
});
