import { Component, computed, input } from '@angular/core';

/** Átomo: barra de progresso acessível (U-04.5). `valor` de 0 a 1. */
@Component({
  selector: 'nb-progress-bar',
  template: `<div class="h-2 w-full overflow-hidden rounded-full bg-line">
    <div data-preenchimento class="h-full rounded-full transition-[width] duration-500" [class]="cor()" [style.width.%]="pct()"></div>
  </div>`,
  host: {
    class: 'block',
    role: 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    '[attr.aria-valuenow]': 'pct()',
    '[attr.aria-label]': 'rotulo()',
  },
})
export class NbProgressBar {
  readonly valor = input.required<number>();
  readonly rotulo = input.required<string>();
  readonly variante = input<'marca' | 'ouro'>('marca');
  protected readonly pct = computed(() => Math.round(Math.min(1, Math.max(0, this.valor())) * 100));
  protected readonly cor = computed(() =>
    this.variante() === 'ouro' ? 'bg-gradient-to-r from-brand to-gold' : 'bg-brand');
}
