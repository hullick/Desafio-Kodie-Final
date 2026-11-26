import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { abrirRota } from '../../../testing/abrir-rota';
import { proverDadosEmMemoria } from '../../core/dados/prover-dados';
import { PerfilRepositorio } from '../../core/dados/repositorios';
import { PerfilDadosFacade } from './perfil-dados.facade';

@Component({ template: '', providers: [PerfilDadosFacade] })
class Pagina {}
@Component({ template: '' })
class Vazio {}

describe('PerfilDadosFacade (R-05.2)', () => {
  it('salva o nome e volta ao perfil', async () => {
    const { servico: f, router } = await abrirRota('/perfil/dados',
      [{ path: 'perfil/dados', component: Pagina }, { path: 'perfil', component: Vazio }], PerfilDadosFacade, [proverDadosEmMemoria()]);
    expect(f.perfil()?.email).toBe('lari@exemplo.com');
    await f.salvarNome('  Lari  ');
    expect((await TestBed.inject(PerfilRepositorio).obter()).nome).toBe('Lari');
    expect(router.url).toBe('/perfil');
  });
});
