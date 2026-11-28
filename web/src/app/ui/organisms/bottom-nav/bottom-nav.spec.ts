import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { renderizar } from '../../../../testing/renderizar';
import { NbBottomNav } from './bottom-nav';

@Component({ template: '' })
class Vazio {}

describe('NbBottomNav (R-02.1)', () => {
  it('tem só Início e Caixinhas, com o "+" entre as duas, e não leva ao Perfil', async () => {
    const r = await renderizar(NbBottomNav, {}, [provideRouter([])]);
    const filhos = Array.from(r.q('nav').children).map((e) => e.textContent?.trim() || e.querySelector('button')?.getAttribute('aria-label'));
    expect(filhos).toEqual(['Início', 'Novo lançamento', 'Caixinhas']);
    expect(r.qs<HTMLAnchorElement>('a').map((a) => a.getAttribute('href'))).toEqual(['/inicio', '/caixinhas']);
    expect(r.q('nav').textContent).not.toContain('Perfil');
  });

  it('o "+" emite novo lançamento', async () => {
    const r = await renderizar(NbBottomNav, {}, [provideRouter([])]);
    let novo = 0;
    r.instancia.novoLancamento.subscribe(() => novo++);
    r.q('button[aria-label="Novo lançamento"]').click();
    expect(novo).toBe(1);
  });

  it('marca a aba da rota atual com aria-current="page"', async () => {
    const r = await renderizar(NbBottomNav, {}, [
      provideRouter([{ path: 'inicio', component: Vazio }, { path: 'caixinhas', component: Vazio }]),
    ]);
    await TestBed.inject(Router).navigateByUrl('/caixinhas');
    r.fixture.detectChanges();
    await r.fixture.whenStable();
    const atual = (href: string) => r.q(`a[href="${href}"]`).getAttribute('aria-current');
    expect(atual('/caixinhas')).toBe('page');
    expect(atual('/inicio')).toBeNull();
  });
});
