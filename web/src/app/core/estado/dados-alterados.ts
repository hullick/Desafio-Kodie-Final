import { Injectable, signal } from '@angular/core';

/** Sinal global que muda a cada escrita, para as páginas recarregarem (R-03.8). */
@Injectable({ providedIn: 'root' })
export class DadosAlterados {
  private readonly _versao = signal(0);
  readonly versao = this._versao.asReadonly();

  notificar(): void {
    this._versao.update((v) => v + 1);
  }
}
