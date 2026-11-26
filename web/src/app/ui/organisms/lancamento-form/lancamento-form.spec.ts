import { renderizar } from '../../../../testing/renderizar';
import { NovoLancamento } from '../../../core/dominio/tipos';
import { hojeISO } from '../../../core/tempo/mes';
import { NbLancamentoForm } from './lancamento-form';

const tocar = (r: Awaited<ReturnType<typeof renderizar>>, rotulo: string) =>
  r.qs<HTMLButtonElement>('button').find((b) => b.textContent?.trim() === rotulo || b.getAttribute('aria-label') === rotulo)!.click();

describe('NbLancamentoForm', () => {
  it('vem em Gasto, sem categoria, e só salva com valor e categoria (R-02.2, R-02.4, R-02.7)', async () => {
    const r = await renderizar(NbLancamentoForm);
    const salvar = () => r.qs<HTMLButtonElement>('button').find((b) => b.textContent?.trim() === 'Salvar')!;
    expect(r.q('button[aria-pressed=true]').textContent?.trim()).toBe('Gasto');
    expect(r.qs('[nb-category-chip][aria-pressed=true]')).toHaveLength(0);
    expect(salvar().disabled).toBe(true);

    let enviado: NovoLancamento | undefined;
    r.instancia.salvar.subscribe((v) => (enviado = v));
    ['3', '8', '5', '0'].forEach((d) => tocar(r, d));
    await r.fixture.whenStable();
    expect(salvar().disabled).toBe(true);
    tocar(r, 'Alimentação');
    await r.fixture.whenStable();
    expect(r.q('[nb-category-chip][aria-pressed=true]').textContent).toContain('Alimentação');
    salvar().click();
    expect(enviado).toEqual({ tipo: 'gasto', valorCentavos: 3850, categoria: 'alimentacao', descricao: null, data: hojeISO() });
  });

  it('trocar para Entrada troca as categorias e limpa a escolha', async () => {
    const r = await renderizar(NbLancamentoForm);
    tocar(r, 'Alimentação');
    tocar(r, 'Entrada');
    await r.fixture.whenStable();
    expect(r.texto()).toContain('Salário/Bolsa');
    expect(r.texto()).not.toContain('Alimentação');
    expect(r.qs('[nb-category-chip][aria-pressed=true]')).toHaveLength(0);
  });

  it('em edição preenche os campos e pede confirmação para excluir (R-02.9)', async () => {
    const inicial: NovoLancamento = { tipo: 'entrada', valorCentavos: 141200, categoria: 'salario', descricao: 'Bolsa', data: '2026-11-05' };
    const r = await renderizar(NbLancamentoForm, { inicial });
    expect(r.texto()).toContain('Editar lançamento');
    expect(r.q<HTMLInputElement>('input[maxlength]').value).toBe('Bolsa');
    let excluiu = 0;
    r.instancia.excluir.subscribe(() => excluiu++);
    tocar(r, 'Excluir');
    await r.fixture.whenStable();
    expect(excluiu).toBe(0);
    tocar(r, 'Excluir de vez');
    expect(excluiu).toBe(1);
  });

  it('mostra o erro de gravação (R-02.10)', async () => {
    const r = await renderizar(NbLancamentoForm, { erro: 'Não foi possível salvar. Tente de novo.' });
    expect(r.texto()).toContain('Não foi possível salvar. Tente de novo.');
  });
});
