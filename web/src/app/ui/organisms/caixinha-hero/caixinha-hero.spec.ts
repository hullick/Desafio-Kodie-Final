import { limpo, renderizar } from '../../../../testing/renderizar';
import { CaixinhaCardVM } from '../../modelos';
import { NbCaixinhaHero } from './caixinha-hero';

const c: CaixinhaCardVM = {
  id: 'c3', nome: 'Celular novo', icone: 'smartphone', guardadoCentavos: 80000, metaCentavos: 200000,
  progresso: 0.4, percentual: 40, prazoRotulo: 'mar/2027', sugeridoCentavos: 30000, faltamCentavos: 120000, estado: 'ativa',
};

describe('NbCaixinhaHero (R-04.4)', () => {
  it('mostra anel, saldo, faltam, prazo e meta mensal', async () => {
    const r = await renderizar(NbCaixinhaHero, { caixinha: c, mesesRestantes: 4 });
    const t = limpo(r.texto());
    expect(t).toContain('Meta ativa • 40% concluída');
    expect(t).toContain('R$ 800,00 de R$ 2.000,00');
    expect(t).toContain('Faltam R$ 1.200,00 para a meta');
    expect(t).toContain('Prazo final mar/2027 Faltam 4 meses');
    expect(t).toContain('Meta mensal R$ 300,00 por mês sugerido');
    expect(r.q('nb-progress-ring').getAttribute('aria-valuenow')).toBe('40');
  });
});
