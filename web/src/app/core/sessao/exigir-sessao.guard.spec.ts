import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { proverDadosEmMemoria } from '../dados/prover-dados';
import { SessaoRepositorio } from '../dados/repositorios';
import { exigirSessao } from './exigir-sessao.guard';

@Component({ template: '' })
class Vazio {}

describe('exigirSessao (R-01.9)', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [proverDadosEmMemoria(), provideRouter([
      { path: 'entrar', component: Vazio },
      { path: 'caixinhas', component: Vazio, canActivate: [exigirSessao] },
    ])],
  }));

  it('deixa passar com sessão', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/caixinhas');
    expect(router.url).toBe('/caixinhas');
  });

  it('ao abrir o app, consulta o servidor antes de decidir', async () => {
    const sessao = TestBed.inject(SessaoRepositorio);
    sessao.encerrarLocalmente();
    const verificar = vi.spyOn(sessao, 'verificar').mockResolvedValue(true);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/caixinhas');
    expect(verificar).toHaveBeenCalled();
    expect(router.url).toBe('/caixinhas');
  });

  it('sem sessão manda para o login guardando a rota pedida', async () => {
    await TestBed.inject(SessaoRepositorio).sair();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/caixinhas');
    expect(router.url).toBe('/entrar?voltar=%2Fcaixinhas');
  });
});
