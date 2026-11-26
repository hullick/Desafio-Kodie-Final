import { Component, input, output } from '@angular/core';
import { formatBRL } from '../../../core/formatacao/dinheiro';

/** Molécula: atalhos "+ R$ 500" que somam ao valor (R-04.3). */
@Component({
  selector: 'nb-quick-amounts',
  template: `
    @for (v of valores(); track v) {
      <button type="button" class="min-h-11 rounded-full bg-canvas px-4 text-sm font-semibold text-ink transition hover:bg-brand-light"
        (click)="somar.emit(v)">+ {{ rotulo(v) }}</button>
    }
  `,
  host: { class: 'flex flex-wrap justify-center gap-2', role: 'group', 'aria-label': 'Atalhos de valor' },
})
export class NbQuickAmounts {
  readonly valores = input<readonly number[]>([50000, 100000, 200000]);
  readonly somar = output<number>();
  protected rotulo(v: number) {
    return formatBRL(v).replace(',00', '');
  }
}
