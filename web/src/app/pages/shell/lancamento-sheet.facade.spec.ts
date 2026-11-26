import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { estabilizar } from '../../../testing/estabilizar';
import { proverDadosEmMemoria } from '../../core/dados/prover-dados';
import { LancamentosRepositorio } from '../../core/dados/repositorios';
import { DadosAlterados } from '../../core/estado/dados-alterados';
import { LancamentoSheet } from '../../core/estado/sheets';
import { ToastService } from '../../core/estado/toast';
import { hojeISO, mesAtual } from '../../core/tempo/mes';
import { ERRO_SALVAR, LancamentoSheetFacade } from './lancamento-sheet.facade';

describe('LancamentoSheetFacade', () => {
  let f: LancamentoSheetFacade;
  let repo: LancamentosRepositorio;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [proverDadosEmMemoria(), LancamentoSheetFacade] });
    f = TestBed.inject(LancamentoSheetFacade);
    repo = TestBed.inject(LancamentosRepositorio);
  });

  it('cria, avisa, notifica e fecha (R-02.7, R-03.8)', async () => {
    TestBed.inject(LancamentoSheet).abrir();
    const antes = (await repo.listarDoMes(mesAtual())).length;
    await f.salvar({ tipo: 'gasto', valorCentavos: 1000, categoria: 'saude', descricao: null, data: hojeISO() });
    expect((await repo.listarDoMes(mesAtual())).length).toBe(antes + 1);
    expect(TestBed.inject(ToastService).atual()?.mensagem).toBe('Gasto registrado');
    expect(TestBed.inject(DadosAlterados).versao()).toBe(1);
    expect(f.aberto()).toBe(false);
  });

  it('carrega o lançamento em edição e exclui (R-02.9)', async () => {
    TestBed.inject(LancamentoSheet).abrir('l2');
    await estabilizar();
    expect(f.pronto()).toBe(true);
    expect(f.inicial()?.descricao).toBe('iFood Delivery');
    await f.excluir();
    await expect(repo.obter('l2')).rejects.toThrow();
    expect(TestBed.inject(ToastService).atual()?.mensagem).toBe('Lançamento excluído');
  });

  it('falha mantém o sheet aberto com a mensagem (R-02.10)', async () => {
    TestBed.inject(LancamentoSheet).abrir();
    vi.spyOn(repo, 'criar').mockRejectedValue(new Error('offline'));
    await f.salvar({ tipo: 'entrada', valorCentavos: 1, categoria: 'extra', descricao: null, data: hojeISO() });
    expect(f.erro()).toBe(ERRO_SALVAR);
    expect(f.aberto()).toBe(true);
  });
});
