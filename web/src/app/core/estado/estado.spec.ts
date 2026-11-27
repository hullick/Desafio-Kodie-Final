import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { DadosAlterados } from './dados-alterados';
import { Preferencias } from './preferencias';
import { LancamentoSheet, MovimentoSheet } from './sheets';
import { ToastService } from './toast';

describe('estado global', () => {
  beforeEach(() => localStorage.clear());

  it('DadosAlterados incrementa a versão', () => {
    const d = TestBed.inject(DadosAlterados);
    d.notificar();
    d.notificar();
    expect(d.versao()).toBe(2);
  });

  it('ToastService some após 3 s (U-00.7)', () => {
    vi.useFakeTimers();
    const t = TestBed.inject(ToastService);
    t.mostrar('Gasto registrado');
    expect(t.atual()?.mensagem).toBe('Gasto registrado');
    vi.advanceTimersByTime(ToastService.DURACAO_MS);
    expect(t.atual()).toBeNull();
    t.mostrar('x');
    t.fechar();
    expect(t.atual()).toBeNull();
    vi.useRealTimers();
  });

  it('LancamentoSheet abre para criar e para editar', () => {
    const s = TestBed.inject(LancamentoSheet);
    s.abrir();
    expect([s.aberto(), s.emEdicao()]).toEqual([true, null]);
    s.abrir('l1');
    expect(s.emEdicao()).toBe('l1');
    s.fechar();
    expect([s.aberto(), s.emEdicao()]).toEqual([false, null]);
  });

  it('MovimentoSheet guarda o pedido', () => {
    const s = TestBed.inject(MovimentoSheet);
    s.abrir('c1', 'guardar');
    expect(s.pedido()).toEqual({ caixinhaId: 'c1', tipo: 'guardar' });
    s.fechar();
    expect(s.pedido()).toBeNull();
  });

  it('Preferencias persiste ocultar valores (R-03.3)', () => {
    const p = TestBed.inject(Preferencias);
    expect(p.ocultarValores()).toBe(false);
    p.alternarOcultarValores();
    expect(localStorage.getItem('nubanko.ocultarValores')).toBe('1');
    p.alternarOcultarValores();
    expect(localStorage.getItem('nubanko.ocultarValores')).toBe('0');
  });
});
