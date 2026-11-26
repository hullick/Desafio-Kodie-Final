import { Component, computed, input } from '@angular/core';

const PADDINGS = { nenhum: '', md: 'p-4', lg: 'p-6' } as const;

/** Átomo: superfície elevada nível 1, cantos de 24px (DESIGN.md). */
@Component({
  selector: 'nb-card',
  template: '<ng-content />',
  host: { '[class]': 'classes()' },
})
export class NbCard {
  readonly padding = input<keyof typeof PADDINGS>('lg');
  readonly raio = input<'card' | 'box'>('card');
  protected readonly classes = computed(
    () => `block bg-surface shadow-n1 ${this.raio() === 'card' ? 'rounded-card' : 'rounded-box'} ${PADDINGS[this.padding()]}`,
  );
}
