import { Signal, effect, signal, untracked } from '@angular/core';

export interface Carregavel<T> {
  /** Último valor carregado. Fica com o anterior durante uma recarga, para não pular a tela (U-03.5). */
  readonly valor: Signal<T | undefined>;
  readonly carregando: Signal<boolean>;
  readonly falhou: Signal<boolean>;
}

/**
 * Carrega dados sempre que `parametros()` muda. Respostas antigas são descartadas se
 * chegarem depois de uma mais nova. Precisa de contexto de injeção (campo de um facade).
 */
export function carregavel<P, T>(parametros: () => P, carregar: (p: P) => Promise<T>): Carregavel<T> {
  const valor = signal<T | undefined>(undefined);
  const carregando = signal(true);
  const falhou = signal(false);
  let seq = 0;

  effect(() => {
    const p = parametros();
    const atual = ++seq;
    untracked(() => {
      carregando.set(true);
      falhou.set(false);
      carregar(p).then(
        (v) => {
          if (atual !== seq) return;
          valor.set(v);
          carregando.set(false);
        },
        () => {
          if (atual !== seq) return;
          falhou.set(true);
          carregando.set(false);
        },
      );
    });
  });

  return { valor: valor.asReadonly(), carregando: carregando.asReadonly(), falhou: falhou.asReadonly() };
}
