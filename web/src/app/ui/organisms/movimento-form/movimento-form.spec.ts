import { renderizar } from '../../../../testing/renderizar';
import { NovoMovimento } from '../../../core/dominio/tipos';
import { NbMovimentoForm } from './movimento-form';

describe('NbMovimentoForm (R-04.5)', () => {
  const botao = (r: Awaited<ReturnType<typeof renderizar>>, t: string) =>
    r.qs<HTMLButtonElement>('button').find((b) => b.textContent?.trim() === t || b.getAttribute('aria-label') === t)!;

  it('guarda o valor digitado', async () => {
    const r = await renderizar(NbMovimentoForm, { tipo: 'guardar', nomeCaixinha: 'Celular novo', saldoCentavos: 80000 });
    expect(r.texto()).toContain('Guardar em Celular novo');
    let mov: NovoMovimento | undefined;
    r.instancia.salvar.subscribe((m) => (mov = m));
    botao(r, '5').click();
    botao(r, '00').click();
    botao(r, '00').click();
    await r.fixture.whenStable();
    botao(r, 'Guardar').click();
    expect(mov?.valorCentavos).toBe(50000);
    expect(mov?.tipo).toBe('guardar');
  });

  it('retirar acima do saldo bloqueia e diz o disponível (U-04.4)', async () => {
    const r = await renderizar(NbMovimentoForm, { tipo: 'retirar', nomeCaixinha: 'Viagem', saldoCentavos: 1000 });
    ['2', '0', '0', '0'].forEach((d) => botao(r, d).click());
    await r.fixture.whenStable();
    expect(r.texto()).toContain('Você tem R$ 10,00 nesta caixinha. Retire até esse valor.');
    expect(botao(r, 'Retirar').disabled).toBe(true);
  });
});
