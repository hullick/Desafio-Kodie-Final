import { TestBed } from '@angular/core/testing';
import { estabilizar } from '../../../testing/estabilizar';
import { proverDadosEmMemoria } from '../../core/dados/prover-dados';
import { LancamentosRepositorio } from '../../core/dados/repositorios';
import { DadosAlterados } from '../../core/estado/dados-alterados';
import { LancamentoSheet } from '../../core/estado/sheets';
import { hojeISO } from '../../core/tempo/mes';
import { InicioFacade } from './inicio.facade';

describe('InicioFacade (spec 03)', () => {
  let f: InicioFacade;
  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [proverDadosEmMemoria(), InicioFacade] });
    f = TestBed.inject(InicioFacade);
    await estabilizar();
  });

  it('monta o painel do mockup (R-03.2, R-03.4 a R-03.6)', () => {
    const vm = f.vm()!;
    expect(vm.nome).toBe('Larissa');
    expect([vm.saldo, vm.entradas, vm.gastos]).toEqual([64230, 141200, 76970]);
    expect(vm.fatias.map((x) => [x.rotulo, x.percentual])).toEqual([
      ['Alimentação', 41.6], ['Transporte', 23.4], ['Lazer', 17.5], ['Compras', 11], ['Contas', 6.5]]);
    expect(vm.caixinhas.map((c) => c.nome)).toEqual(['Reserva de Emergência', 'Viagem Fim de Ano']);
    expect(vm.ultimos[0].itens).toHaveLength(4);
  });

  it('não avança além do mês atual e mês sem dados fica vazio (R-03.1, R-03.7)', async () => {
    expect(f.mes.podeAvancar()).toBe(false);
    f.mes.proximo();
    f.mes.anterior();
    f.mes.anterior();
    await estabilizar();
    expect(f.mes.podeAvancar()).toBe(true);
    expect(f.vm()!.fatias).toEqual([]);
    expect(f.vm()!.ultimos).toEqual([]);
  });

  it('recarrega quando os dados mudam (R-03.8)', async () => {
    await TestBed.inject(LancamentosRepositorio).criar({ tipo: 'gasto', valorCentavos: 230, categoria: 'saude', descricao: null, data: hojeISO() });
    TestBed.inject(DadosAlterados).notificar();
    await estabilizar();
    expect(f.vm()!.saldo).toBe(64000);
  });

  it('olho alterna a preferência e editar abre o sheet', () => {
    f.alternarOculto();
    expect(f.oculto()).toBe(true);
    f.editar('l2');
    expect(TestBed.inject(LancamentoSheet).emEdicao()).toBe('l2');
  });
});
