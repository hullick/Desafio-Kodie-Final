import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { proverDadosEmMemoria } from '../../core/dados/prover-dados';
import { SessaoRepositorio } from '../../core/dados/repositorios';
import { ExcluirContaFacade } from './excluir-conta.facade';

describe('ExcluirContaFacade (R-05.6)', () => {
  let f: ExcluirContaFacade;
  let router: Router;
  let sessao: SessaoRepositorio;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [proverDadosEmMemoria(), provideRouter([]), ExcluirContaFacade] });
    f = TestBed.inject(ExcluirContaFacade);
    router = TestBed.inject(Router);
    sessao = TestBed.inject(SessaoRepositorio);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('exclui, sai e vai ao login com o aviso, sem deixar a página no histórico', async () => {
    await f.excluir('Senha123!');
    expect(sessao.autenticado()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/entrar'], { queryParams: { aviso: 'conta-excluida' }, replaceUrl: true });
  });

  it('senha errada não apaga nada e mostra o erro', async () => {
    await f.excluir('');
    expect(f.erro()).toBe('Senha atual incorreta.');
    expect(sessao.autenticado()).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('falha inesperada avisa que nada foi apagado', async () => {
    vi.spyOn(sessao, 'excluirConta').mockRejectedValueOnce(new Error('rede'));
    await f.excluir('Senha123!');
    expect(f.erro()).toBe('Não foi possível excluir agora. Nada foi apagado. Tente de novo.');
  });
});
