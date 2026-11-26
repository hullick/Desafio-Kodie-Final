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

  it('cadastrar não entra, mas libera o e-mail (R-01.5)', async () => {
    await s.sair();
    await s.cadastrar({ nome: 'Bia', email: 'bia@exemplo.com', senha: 'segredo1!' });
    expect(s.autenticado()).toBe(false);
    await s.entrar('bia@exemplo.com', 'segredo1!');
    expect(s.autenticado()).toBe(true);
  });
});
