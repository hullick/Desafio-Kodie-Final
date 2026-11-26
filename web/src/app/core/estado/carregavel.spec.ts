import { Injector, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { estabilizar } from '../../../testing/estabilizar';
import { carregavel } from './carregavel';

describe('carregavel', () => {
  const criar = <P, T>(p: () => P, f: (x: P) => Promise<T>) =>
    runInInjectionContext(TestBed.inject(Injector), () => carregavel(p, f));

  it('carrega e recarrega quando o parâmetro muda, mantendo o valor anterior', async () => {
    const n = signal(1);
    let soltar: (v: number) => void = () => {};
    const c = criar(n, (x) => (x === 1 ? Promise.resolve(10) : new Promise<number>((r) => (soltar = r))));
    await estabilizar();
    expect([c.valor(), c.carregando()]).toEqual([10, false]);
    n.set(2);
    await estabilizar();
    expect([c.valor(), c.carregando()]).toEqual([10, true]);
    soltar(20);
    await estabilizar();
    expect([c.valor(), c.carregando()]).toEqual([20, false]);
  });

  it('descarta resposta antiga e marca falha', async () => {
    const n = signal(1);
    const pendentes: ((v: number) => void)[] = [];
    const c = criar(n, (x) => (x === 3 ? Promise.reject(new Error('rede')) : new Promise<number>((r) => pendentes.push(r))));
    await estabilizar();
    n.set(2);
    await estabilizar();
    pendentes[1](2);
    pendentes[0](1);
    await estabilizar();
    expect(c.valor()).toBe(2);
    n.set(3);
    await estabilizar();
    expect(c.falhou()).toBe(true);
  });
});
