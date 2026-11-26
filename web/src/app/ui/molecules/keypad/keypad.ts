import { Component, input, output } from '@angular/core';
import { Tecla } from '../../../core/calculos/teclado';
import { NbIcon } from '../../atoms/icon/icon';

const TECLAS: readonly Tecla[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'apagar'];

/**
 * Molécula: teclado numérico (R-02.3). Também aceita teclado físico (dígitos e Backspace)
 * quando `capturarTeclado` está ativo, para uso no desktop.
 */
@Component({
  selector: 'nb-keypad',
  imports: [NbIcon],
  template: `
    @for (t of teclas; track t) {
      <button type="button" class="rounded-box font-display text-2xl font-semibold text-ink transition hover:bg-canvas active:bg-brand-light"
        [class.min-h-12]="compacto()" [class.min-h-14]="!compacto()"
        [attr.aria-label]="t === 'apagar' ? 'Apagar' : null" (click)="tecla.emit(t)">
        @if (t === 'apagar') { <nb-icon nome="delete" [tamanho]="26" /> } @else { {{ t }} }
      </button>
    }
  `,
  host: {
    class: 'grid grid-cols-3 gap-1',
    role: 'group',
    'aria-label': 'Teclado numérico',
    '(document:keydown)': 'aoTeclar($event)',
  },
})
export class NbKeypad {
  readonly capturarTeclado = input(false);
  /** Teclas mais baixas, para caber com o botão de salvar em telas de 740 px (U-02.3). */
  readonly compacto = input(false);
  readonly tecla = output<Tecla>();
  protected readonly teclas = TECLAS;

  protected aoTeclar(ev: KeyboardEvent): void {
    if (!this.capturarTeclado()) return;
    const alvo = ev.target as HTMLElement | null;
    if (alvo && ['INPUT', 'TEXTAREA', 'SELECT'].includes(alvo.tagName)) return;
    if (/^[0-9]$/.test(ev.key)) {
      this.tecla.emit(ev.key as Tecla);
      ev.preventDefault();
    } else if (ev.key === 'Backspace') {
      this.tecla.emit('apagar');
      ev.preventDefault();
    }
  }
}
