import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { abrirRota } from '../../../testing/abrir-rota';
import { proverDadosEmMemoria } from '../../core/dados/prover-dados';
import { SessaoRepositorio } from '../../core/dados/repositorios';
import { ERRO_LOGIN, EntrarFacade } from './entrar.facade';

@Component({ template: '', providers: [EntrarFacade] })
class Pagina {}
@Component({ template: '' })
class Vazio {}

const rotas = [{ path: 'entrar', component: Pagina }, { path: 'inicio', component: Vazio }, { path: 'caixinhas', component: Vazio }];

describe('EntrarFacade (spec 01)', () => {
  const abrir = async (url: string) => {
    const r = await abrirRota(url, rotas, EntrarFacade, [proverDadosEmMemoria()]);
    await TestBed.inject(SessaoRepositorio).sair();
    return r;
  };

  it('volta para a rota pedida (R-01.9)', async () => {
    const { servico: f, router } = await abrir('/entrar?voltar=%2Fcaixinhas');
    await f.entrar({ email: 'lari@exemplo.com', senha: 'x' });
    expect(router.url).toBe('/caixinhas');
  });

  it('erro neutro e não segue links externos (R-01.7)', async () => {
    const { servico: f, router } = await abrir('/entrar?voltar=%2F%2Fmal.com');
    await f.entrar({ email: 'ninguem@exemplo.com', senha: 'x' });
    expect(f.erro()).toBe(ERRO_LOGIN);
    await f.entrar({ email: 'lari@exemplo.com', senha: 'x' });
    expect(router.url).toBe('/inicio');
  });

  it('mostra só avisos conhecidos deixados por outras telas', async () => {
    const { servico: f } = await abrir('/entrar?aviso=conta-excluida');
    expect(f.aviso()).toBe('Sua conta e seus dados foram apagados.');
  });

  it('ignora aviso desconhecido', async () => {
    const { servico: f } = await abrir('/entrar?aviso=qualquer-coisa');
    expect(f.aviso()).toBeNull();
  });
});
