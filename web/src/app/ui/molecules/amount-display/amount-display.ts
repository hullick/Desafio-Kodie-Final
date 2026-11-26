import { Component, computed, input } from '@angular/core';
import { formatBRL } from '../../../core/formatacao/dinheiro';

/** Molécula: valor grande em digitação (R$ 0,00), anunciado a leitores de tela. */
@Component({
  selector: 'nb-amount-display',
  template: `
    <span class="font-display text-xl font-bold text-ink/60">R$</span>
    <span class="font-display text-5xl font-extrabold tracking-tight tabular" [class]="cor()">{{ numero() }}</span>
  `,
  host: {
    class: 'flex items-baseline justify-center gap-2',
    role: 'status',
    'aria-live': 'polite',
    '[attr.aria-label]': 'rotulo() + ": " + numero() + " reais"',
  },
})
export class NbAmountDisplay {
  readonly centavos = input.required<number>();
  readonly rotulo = input('Valor');
  readonly tom = input<'neutro' | 'entrada' | 'gasto'>('neutro');
  protected readonly numero = computed(() => formatBRL(this.centavos()).replace(/^R\$\s?/, ''));
  protected readonly cor = computed(() =>
    this.centavos() === 0 ? 'text-ink/40' : this.tom() === 'entrada' ? 'text-pos-ink' : 'text-ink');
}
