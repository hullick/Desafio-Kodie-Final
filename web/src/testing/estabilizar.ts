import { TestBed } from '@angular/core/testing';

/** Roda efeitos e deixa as promises pendentes resolverem (facades com carregamento). */
export async function estabilizar(voltas = 3): Promise<void> {
  for (let i = 0; i < voltas; i++) {
    TestBed.tick();
    await new Promise((r) => setTimeout(r));
  }
}
