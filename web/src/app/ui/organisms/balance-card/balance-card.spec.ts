import { limpo, renderizar } from '../../../../testing/renderizar';
import { NbBalanceCard } from './balance-card';

describe('NbBalanceCard (R-03.2, R-03.3)', () => {
  it('mostra saldo, entradas e gastos e esconde com o olho', async () => {
    const r = await renderizar(NbBalanceCard, { saldo: 64230, entradas: 141200, gastos: 76970 });
    expect(limpo(r.texto())).toBe('Saldo do mês R$ 642,30 Entradas R$ 1.412,00 Gastos R$ 769,70');
    let cliques = 0;
    r.instancia.alternarOculto.subscribe(() => cliques++);
    r.q('button').click();
    expect(cliques).toBe(1);
    await r.definir({ oculto: true });
    expect(r.texto()).not.toContain('642');
    expect(r.q('button').getAttribute('aria-label')).toBe('Mostrar valores');
  });

  it('saldo negativo fica vermelho', async () => {
    const r = await renderizar(NbBalanceCard, { saldo: -100, entradas: 0, gastos: 100 });
    expect(r.q('nb-valor').className).toContain('text-neg-ink');
  });
});
