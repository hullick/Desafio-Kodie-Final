import { TestBed } from '@angular/core/testing';
import { proverDadosEmMemoria } from '../../core/dados/prover-dados';
import { SessaoRepositorio } from '../../core/dados/repositorios';
import { CadastroFacade } from './cadastro.facade';

describe('CadastroFacade (R-01.4, R-01.5)', () => {
  it('cadastra sem entrar e guarda o e-mail para a mensagem neutra', async () => {
    TestBed.configureTestingModule({ providers: [proverDadosEmMemoria(), CadastroFacade] });
    const f = TestBed.inject(CadastroFacade);
    const sessao = TestBed.inject(SessaoRepositorio);
    await sessao.sair();
    await f.cadastrar({ nome: 'Bia', email: 'bia@exemplo.com', senha: 'segredo1!' });
    expect(f.enviadoPara()).toBe('bia@exemplo.com');
    expect(sessao.autenticado()).toBe(false);
  });
});
