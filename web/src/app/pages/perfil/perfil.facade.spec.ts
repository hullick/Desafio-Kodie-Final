import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { abrirRota } from '../../../testing/abrir-rota';
import { proverDadosEmMemoria } from '../../core/dados/prover-dados';
import { SessaoRepositorio } from '../../core/dados/repositorios';
import { mesAtual, rotuloMesCurto, somarMeses } from '../../core/tempo/mes';
import { PerfilFacade } from './perfil.facade';

@Component({ template: '', providers: [PerfilFacade] })
class Pagina {}
@Component({ template: '' })
class Vazio {}

describe('PerfilFacade (spec 05)', () => {
  it('mostra dados reais e sai para o login (R-05.1, R-05.5)', async () => {
    const { servico: f, router } = await abrirRota('/perfil',
      [{ path: 'perfil', component: Pagina }, { path: 'entrar', component: Vazio }], PerfilFacade, [proverDadosEmMemoria()]);
    expect(f.vm()).toEqual({ nome: 'Larissa Santos', email: 'lari@exemplo.com', desde: rotuloMesCurto(somarMeses(mesAtual(), -1)) });
    expect(f.versao).toBe('0.1.0');
    await f.sair();
    expect(TestBed.inject(SessaoRepositorio).autenticado()).toBe(false);
    expect(router.url).toBe('/entrar');
  });
});
