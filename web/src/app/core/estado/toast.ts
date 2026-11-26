import { Injectable, signal } from '@angular/core';

export interface Toast {
  readonly id: number;
  readonly mensagem: string;
}

/** Feedback de ação em até 1 s (U-00.7). */
@Injectable({ providedIn: 'root' })
export class ToastService {
  static readonly DURACAO_MS = 3000;
  private readonly _atual = signal<Toast | null>(null);
  readonly atual = this._atual.asReadonly();
  private seq = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;

  mostrar(mensagem: string): void {
    clearTimeout(this.timer);
    this.seq += 1;
    this._atual.set({ id: this.seq, mensagem });
    this.timer = setTimeout(() => this._atual.set(null), ToastService.DURACAO_MS);
  }

  fechar(): void {
    clearTimeout(this.timer);
    this._atual.set(null);
  }
}
