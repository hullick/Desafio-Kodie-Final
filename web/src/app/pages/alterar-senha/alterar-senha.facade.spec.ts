import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { proverDadosEmMemoria } from '../../core/dados/prover-dados';
import { SessaoRepositorio } from '../../core/dados/repositorios';
import { ToastService } from '../../core/estado/toast';
import { AlterarSenhaFacade } from './alterar-senha.facade';

describe('AlterarSenhaFacade (R-05.3)', () => {
  let f: AlterarSenhaFacade;
  let router: Router;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [proverDadosEmMemoria(), provideRouter([]), AlterarSenhaFacade] });
    f = TestBed.inject(AlterarSenhaFacade);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
  });

  it('troca a senha, avisa e volta ao perfil', async () => {
    await f.alterar('Atual1!', 'Nova123!');
    expect(TestBed.inject(ToastService).atual()?.mensagem).toBe('Senha alterada');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/perfil');
    expect(f.erro()).toBeNull();
  });

  it('senha atual errada: mensagem, continua logado e na tela', async () => {
    await f.alterar('', 'Nova123!');
    expect(f.erro()).toBe('Senha atual incorreta.');
    expect(TestBed.inject(SessaoRepositorio).autenticado()).toBe(true);
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(f.carregando()).toBe(false);
  });
});
