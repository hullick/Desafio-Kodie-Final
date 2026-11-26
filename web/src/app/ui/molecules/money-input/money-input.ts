import { Component, computed, model } from '@angular/core';
import { centavosDeTexto } from '../../../core/calculos/teclado';
import { formatBRL } from '../../../core/formatacao/dinheiro';
import { NbInput } from '../../atoms/input/input';

/** Molécula: campo de valor em reais (teclado numérico do sistema, entrada por centavos). */
@Component({
  selector: 'nb-money-input',
  imports: [NbInput],
  template: `<input nbInput inputmode="numeric" autocomplete="off" class="font-display text-2xl font-extrabold tabular text-center"
    [value]="texto()" (input)="aoDigitar($event)" />`,
  host: { class: 'block' },
})
export class NbMoneyInput {
  readonly centavos = model.required<number>();
  protected readonly texto = computed(() => formatBRL(this.centavos()));

  protected aoDigitar(ev: Event): void {
    const el = ev.target as HTMLInputElement;
    const novo = centavosDeTexto(el.value);
    this.centavos.set(novo);
    el.value = formatBRL(novo);
  }
}
