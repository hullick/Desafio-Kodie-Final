import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { proverDadosEmMemoria } from '../../core/dados/prover-dados';
import { ErroSessao, SessaoRepositorio } from '../../core/dados/repositorios';
import { CadastroFacade, ERRO_CADASTRO_GENERICO } from './cadastro.facade';

describe('CadastroFacade (sem confirmação de e-mail)', () => {
  let f: CadastroFacade;
  let sessao: SessaoRepositorio;
  let router: Router;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [proverDadosEmMemoria(), provideRouter([]), CadastroFacade] });
    f = TestBed.inject(CadastroFacade);
    sessao = TestBed.inject(SessaoRepositorio);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    await sessao.sair();
  });

  it('cadastra, já entra na conta e vai para o Início', async () => {
    await f.cadastrar({ nome: 'Bia', email: 'bia@exemplo.com', senha: 'segredo1!' });
    expect(sessao.autenticado()).toBe(true);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/inicio');
    expect(f.erro()).toBeNull();
  });

  it('e-mail já cadastrado mostra como seguir', async () => {
    await f.cadastrar({ nome: 'Lari', email: 'lari@exemplo.com', senha: 'segredo1!' });
    expect(f.erro()).toBe('Já existe uma conta com esse e-mail. Entre ou recupere a senha.');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(f.carregando()).toBe(false);
  });

  it('erro sem mensagem própria cai na genérica', async () => {
    vi.spyOn(sessao, 'cadastrar').mockRejectedValue(new ErroSessao('falha'));
    await f.cadastrar({ nome: 'Bia', email: 'bia@exemplo.com', senha: 'segredo1!' });
    expect(f.erro()).toBe(ERRO_CADASTRO_GENERICO);
  });

  it('senha fraca recusada pelo servidor mostra a regra', async () => {
    vi.spyOn(sessao, 'cadastrar').mockRejectedValue(new ErroSessao('senha_fraca'));
    await f.cadastrar({ nome: 'Bia', email: 'bia@exemplo.com', senha: 'x' });
    expect(f.erro()).toBe('A senha precisa de 8+ caracteres, 1 número e 1 símbolo.');
  });
});
