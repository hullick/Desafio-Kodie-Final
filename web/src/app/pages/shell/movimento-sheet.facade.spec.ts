import { TestBed } from '@angular/core/testing';
import { estabilizar } from '../../../testing/estabilizar';
import { limpo } from '../../../testing/renderizar';
import { proverDadosEmMemoria } from '../../core/dados/prover-dados';
import { CaixinhasRepositorio } from '../../core/dados/repositorios';
import { MovimentoSheet } from '../../core/estado/sheets';
import { ToastService } from '../../core/estado/toast';
import { hojeISO } from '../../core/tempo/mes';
import { MovimentoSheetFacade } from './movimento-sheet.facade';

describe('MovimentoSheetFacade (R-04.5)', () => {
  let f: MovimentoSheetFacade;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [proverDadosEmMemoria(), MovimentoSheetFacade] });
    f = TestBed.inject(MovimentoSheetFacade);
  });

  it('guarda na caixinha pedida', async () => {
    TestBed.inject(MovimentoSheet).abrir('c3', 'guardar');
    await estabilizar();
    expect(f.caixinha()?.nome).toBe('Celular novo');
    await f.salvar({ tipo: 'guardar', valorCentavos: 5000, data: hojeISO() });
    expect((await TestBed.inject(CaixinhasRepositorio).obter('c3')).saldoCentavos).toBe(85000);
    expect(TestBed.inject(ToastService).atual()?.mensagem).toBe('Guardado em Celular novo');
    expect(f.pedido()).toBeNull();
  });

  it('retirada acima do saldo diz o disponível (U-04.4)', async () => {
    TestBed.inject(MovimentoSheet).abrir('c2', 'retirar');
    await estabilizar();
    await f.salvar({ tipo: 'retirar', valorCentavos: 999999, data: hojeISO() });
    expect(limpo(f.erro())).toBe('Você tem R$ 300,00 nesta caixinha.');
    expect(f.pedido()).not.toBeNull();
  });
});
