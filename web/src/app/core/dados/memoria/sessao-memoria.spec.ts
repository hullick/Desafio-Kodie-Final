import { TestBed } from '@angular/core/testing';
import { proverDadosEmMemoria } from '../prover-dados';
import { ErroSessao, SessaoRepositorio } from '../repositorios';

describe('SessaoMemoria', () => {
  let s: SessaoRepositorio;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [proverDadosEmMemoria()] });
    s = TestBed.inject(SessaoRepositorio);
  });

  it('começa logada, sai e entra de novo com o e-mail da semente', async () => {
    expect(s.autenticado()).toBe(true);
    await s.sair();
    expect(s.autenticado()).toBe(false);
    await s.entrar(' LARI@exemplo.com ', 'qualquer1!');
    expect(s.autenticado()).toBe(true);
  });

  it('e-mail desconhecido falha com erro neutro (R-01.7)', async () => {
    await s.sair();
    await expect(s.entrar('outra@exemplo.com', 'x')).rejects.toEqual(new ErroSessao('credenciais_invalidas'));
    expect(s.autenticado()).toBe(false);
  });

  it('cadastrar já entra na conta e libera o e-mail para logar depois', async () => {
    await s.sair();
    await s.cadastrar({ nome: 'Bia', email: 'bia@exemplo.com', senha: 'segredo1!' });
    expect(s.autenticado()).toBe(true);
    await s.sair();
    await s.entrar('bia@exemplo.com', 'segredo1!');
    expect(s.autenticado()).toBe(true);
  });

  it('e-mail já cadastrado é recusado', async () => {
    await expect(s.cadastrar({ nome: 'Lari', email: 'LARI@exemplo.com', senha: 'x' }))
      .rejects.toEqual(new ErroSessao('email_em_uso'));
  });

  it('verificar devolve o estado atual e encerrarLocalmente sai', async () => {
    expect(await s.verificar()).toBe(true);
    s.encerrarLocalmente();
    expect(await s.verificar()).toBe(false);
  });

  it('senha: redefinir, alterar e excluir conferem o que foi digitado', async () => {
    await expect(s.pedirRedefinicao('lari@exemplo.com')).resolves.toBeUndefined();
    await expect(s.redefinirSenha('', 'Nova123!')).rejects.toEqual(new ErroSessao('token_invalido'));
    await expect(s.redefinirSenha('tok', '')).rejects.toEqual(new ErroSessao('senha_fraca'));
    await expect(s.alterarSenha('', 'Nova123!')).rejects.toEqual(new ErroSessao('senha_atual_incorreta'));
    await expect(s.alterarSenha('Atual1!', '')).rejects.toEqual(new ErroSessao('senha_fraca'));
    await expect(s.alterarSenha('Atual1!', 'Nova123!')).resolves.toBeUndefined();
    await expect(s.excluirConta('')).rejects.toEqual(new ErroSessao('senha_atual_incorreta'));
    await s.excluirConta('Atual1!');
    expect(s.autenticado()).toBe(false);
    await s.entrar('lari@exemplo.com', 'x');
    await s.redefinirSenha('tok', 'Nova123!');
    expect(s.autenticado()).toBe(false);
  });
});
