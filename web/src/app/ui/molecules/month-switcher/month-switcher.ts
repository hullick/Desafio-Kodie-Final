import { Component, input, output } from '@angular/core';
import { NbIconButton } from '../../atoms/icon-button/icon-button';

/** Molécula: ‹ Novembro 2026 › (R-03.1). */
@Component({
  selector: 'nb-month-switcher',
  imports: [NbIconButton],
  template: `
    <button nb-icon-button icone="chevron-left" rotulo="Mês anterior" (click)="anterior.emit()"></button>
    <span class="min-w-32 text-center text-sm font-semibold" aria-live="polite">{{ rotulo() }}</span>
    <button nb-icon-button icone="chevron-right" rotulo="Próximo mês" [disabled]="!podeAvancar()"
      class="disabled:opacity-30" (click)="proximo.emit()"></button>
  `,
  host: { class: 'inline-flex items-center rounded-full bg-surface shadow-n1' },
})
export class NbMonthSwitcher {
  readonly rotulo = input.required<string>();
  readonly podeAvancar = input(true);
  readonly anterior = output<void>();
  readonly proximo = output<void>();
}
