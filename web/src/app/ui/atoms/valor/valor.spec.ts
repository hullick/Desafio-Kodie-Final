import { limpo, renderizar } from '../../../../testing/renderizar';
import { NbValor } from './valor';

describe('NbValor (U-00.5)', () => {
  it('formata com sinal e cor', async () => {
    const r = await renderizar(NbValor, { centavos: 3850, sinal: 'gasto' });
    expect(limpo(r.texto())).toBe('− R$ 38,50');
    expect(r.el.className).toContain('text-neg-ink');
    await r.definir({ sinal: 'entrada' });
    expect(r.el.className).toContain('text-pos-ink');
  });

  it('destaca saldo negativo e oculta valores', async () => {
    const r = await renderizar(NbValor, { centavos: -500, destacarNegativo: true, tamanho: 'saldo' });
    expect(r.el.className).toContain('text-neg-ink');
    expect(r.el.className).toContain('text-[32px]');
    await r.definir({ oculto: true });
    expect(limpo(r.texto())).toBe('R$ ••••');
    expect(r.el.getAttribute('aria-label')).toBe('Valor oculto');
  });

  it('herda cor quando pedido', async () => {
    const r = await renderizar(NbValor, { centavos: 100, sinal: 'gasto', herdarCor: true });
    expect(r.el.className).not.toContain('text-neg-ink');
  });
});
