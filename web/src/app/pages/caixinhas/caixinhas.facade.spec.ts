import { TestBed } from '@angular/core/testing';
import { estabilizar } from '../../../testing/estabilizar';
import { proverDadosEmMemoria } from '../../core/dados/prover-dados';
import { BancoMemoria } from '../../core/dados/memoria/banco-memoria';
import { MovimentoSheet } from '../../core/estado/sheets';
import { DadosAlterados } from '../../core/estado/dados-alterados';
import { CaixinhasFacade } from './caixinhas.facade';

describe('CaixinhasFacade (R-04.1)', () => {
  let f: CaixinhasFacade;
  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [proverDadosEmMemoria(), CaixinhasFacade] });
    f = TestBed.inject(CaixinhasFacade);
    await estabilizar();
  });

  it('soma o total e separa em andamento e atingidas', () => {
    const vm = f.vm()!;
    expect(vm.totalCentavos).toBe(195000);
    expect(vm.emAndamento.map((c) => c.nome)).toEqual(['Reserva de Emergência', 'Viagem Fim de Ano', 'Celular novo']);
    expect(vm.atingidas.map((c) => c.nome)).toEqual(['Fone Bluetooth']);
  });

  it('guardar e retirar abrem o sheet certo (U-04.3)', () => {
    f.guardar('c1');
    expect(TestBed.inject(MovimentoSheet).pedido()).toEqual({ caixinhaId: 'c1', tipo: 'guardar' });
    f.retirar('c4');
    expect(TestBed.inject(MovimentoSheet).pedido()).toEqual({ caixinhaId: 'c4', tipo: 'retirar' });
  });

  it('sem caixinhas indica vazio (R-04.9)', async () => {
    const banco = TestBed.inject(BancoMemoria);
    banco.dados.caixinhas = [];
    banco.dados.movimentos = [];
    TestBed.inject(DadosAlterados).notificar();
    await estabilizar();
    expect(f.vm()!.vazio).toBe(true);
  });
});
