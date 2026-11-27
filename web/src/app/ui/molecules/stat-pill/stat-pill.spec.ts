import { limpo, renderizar } from '../../../../testing/renderizar';
import { NbStatPill } from './stat-pill';

describe('NbStatPill', () => {
  it('mostra entradas e gastos com cor', async () => {
    const r = await renderizar(NbStatPill, { tipo: 'entrada', centavos: 141200 });
    expect(limpo(r.texto())).toContain('Entradas R$ 1.412,00');
    expect(r.q('nb-valor').className).toContain('text-pos-ink');
    await r.definir({ tipo: 'gasto', oculto: true });
    expect(limpo(r.texto())).toContain('Gastos R$ ••••');
  });
});
