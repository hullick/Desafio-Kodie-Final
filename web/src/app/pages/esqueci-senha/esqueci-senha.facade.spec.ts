import { TestBed } from '@angular/core/testing';
import { proverDadosEmMemoria } from '../../core/dados/prover-dados';
import { ErroSessao, SessaoRepositorio } from '../../core/dados/repositorios';
import { EsqueciSenhaFacade } from './esqueci-senha.facade';

describe('EsqueciSenhaFacade (R-01.8)', () => {
  let f: EsqueciSenhaFacade;
  let sessao: SessaoRepositorio;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [proverDadosEmMemoria(), EsqueciSenhaFacade] });
    f = TestBed.inject(EsqueciSenhaFacade);
    sessao = TestBed.inject(SessaoRepositorio);
  });

  it('pede o link e guarda o e-mail para a confirmação neutra; dá para trocar o e-mail', async () => {
    const pedir = vi.spyOn(sessao, 'pedirRedefinicao');
    await f.enviar('lari@exemplo.com');
    expect(pedir).toHaveBeenCalledWith('lari@exemplo.com');
    expect(f.enviadoPara()).toBe('lari@exemplo.com');
    expect(f.carregando()).toBe(false);
    f.outroEmail();
    expect(f.enviadoPara()).toBeNull();
  });

  it('rate limit e falha mostram erro e não confirmam envio', async () => {
    vi.spyOn(sessao, 'pedirRedefinicao').mockRejectedValueOnce(new ErroSessao('muitas_tentativas'));
    await f.enviar('lari@exemplo.com');
    expect(f.erro()).toBe('Muitas tentativas. Espere um minuto e tente de novo.');
    expect(f.enviadoPara()).toBeNull();
    vi.spyOn(sessao, 'pedirRedefinicao').mockRejectedValueOnce(new Error('rede'));
    await f.enviar('lari@exemplo.com');
    expect(f.erro()).toBe('Não foi possível enviar agora. Tente de novo.');
  });
});
