import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { abrirRota } from '../../../testing/abrir-rota';
import { proverDadosEmMemoria } from '../../core/dados/prover-dados';
import { ErroSessao, SessaoRepositorio } from '../../core/dados/repositorios';
import { NovaSenhaFacade } from './nova-senha.facade';

@Component({ template: '', providers: [NovaSenhaFacade] })
class Pagina {}
@Component({ template: '' })
class Vazio {}

const rotas = [{ path: 'nova-senha', component: Pagina }, { path: 'entrar', component: Vazio }];
const abrir = (url: string) => abrirRota(url, rotas, NovaSenhaFacade, [proverDadosEmMemoria()]);

describe('NovaSenhaFacade (R-01.8)', () => {
  it('com token, redefine e vai ao login com o aviso', async () => {
    const { servico: f, router } = await abrir('/nova-senha?token=abc');
    const redefinir = vi.spyOn(TestBed.inject(SessaoRepositorio), 'redefinirSenha');
    expect(f.linkInvalido()).toBe(false);
    await f.salvar('Nova123!');
    expect(redefinir).toHaveBeenCalledWith('abc', 'Nova123!');
    expect(router.url).toBe('/entrar?aviso=senha-redefinida');
  });

  it.each(['/nova-senha', '/nova-senha?error=INVALID_TOKEN', '/nova-senha?token=abc&error=INVALID_TOKEN'])(
    '%s mostra link inválido e não chama a API', async (url) => {
      const { servico: f } = await abrir(url);
      const redefinir = vi.spyOn(TestBed.inject(SessaoRepositorio), 'redefinirSenha');
      expect(f.linkInvalido()).toBe(true);
      await f.salvar('Nova123!');
      expect(redefinir).not.toHaveBeenCalled();
    });

  it('token recusado pela API vira link inválido; senha fraca vira mensagem', async () => {
    const { servico: f } = await abrir('/nova-senha?token=velho');
    const sessao = TestBed.inject(SessaoRepositorio);
    vi.spyOn(sessao, 'redefinirSenha').mockRejectedValueOnce(new ErroSessao('senha_fraca'));
    await f.salvar('fraca');
    expect(f.erro()).toBe('A senha precisa de 8+ caracteres, 1 número e 1 símbolo.');
    expect(f.linkInvalido()).toBe(false);
    vi.spyOn(sessao, 'redefinirSenha').mockRejectedValueOnce(new ErroSessao('token_invalido'));
    await f.salvar('Nova123!');
    expect(f.linkInvalido()).toBe(true);
    expect(f.carregando()).toBe(false);
  });
});
