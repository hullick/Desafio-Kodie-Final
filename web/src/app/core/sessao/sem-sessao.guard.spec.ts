import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { proverDadosEmMemoria } from '../dados/prover-dados';
import { SessaoRepositorio } from '../dados/repositorios';
import { semSessao } from './sem-sessao.guard';

@Component({ template: '' })
class Vazio {}

describe('semSessao (login e cadastro)', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [proverDadosEmMemoria(), provideRouter([
      { path: 'inicio', component: Vazio },
      { path: 'entrar', component: Vazio, canActivate: [semSessao] },
      { path: 'cadastro', component: Vazio, canActivate: [semSessao] },
    ])],
  }));

  it('com sessão, login e cadastro vão para o início', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/entrar');
    expect(router.url).toBe('/inicio');
    await router.navigateByUrl('/cadastro');
    expect(router.url).toBe('/inicio');
  });

  it('ao abrir o app, consulta o servidor: sessão válida no cookie também vai para o início', async () => {
    const sessao = TestBed.inject(SessaoRepositorio);
    sessao.encerrarLocalmente();
    const verificar = vi.spyOn(sessao, 'verificar').mockResolvedValue(true);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/cadastro');
    expect(verificar).toHaveBeenCalled();
    expect(router.url).toBe('/inicio');
  });

  it('sem sessão, mostra a tela', async () => {
    await TestBed.inject(SessaoRepositorio).sair();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/entrar?aviso=conta-excluida');
    expect(router.url).toBe('/entrar?aviso=conta-excluida');
  });
});
