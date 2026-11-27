import { Component, computed, input } from '@angular/core';
import { formatBRLComSinal, MASCARA_VALOR, SinalValor } from '../../../core/formatacao/dinheiro';

export type TamanhoValor = 'sm' | 'md' | 'lg' | 'xl' | 'saldo';

const TAMANHOS: Record<TamanhoValor, string> = {
  sm: 'text-sm font-semibold',
  md: 'text-[15px] font-bold',
  lg: 'text-xl font-bold',
  xl: 'text-[28px] font-extrabold tracking-tight',
  saldo: 'text-[32px] leading-[38px] font-extrabold tracking-tight',
};

/**
 * Átomo: valor monetário (R$ 1.234,56, U-00.5). Números tabulares.
 * Cor por sinal: entrada verde, gasto vermelho (variantes "ink" que passam no AA).
 */
@Component({
  selector: 'nb-valor',
  template: `{{ texto() }}`,
  host: {
    '[class]': 'classes()',
    '[attr.aria-label]': 'oculto() ? "Valor oculto" : null',
  },
})
export class NbValor {
  readonly centavos = input.required<number>();
  readonly sinal = input<SinalValor>('nenhum');
  readonly tamanho = input<TamanhoValor>('md');
  readonly oculto = input(false);
  /** Saldo negativo em vermelho (R-03.2). */
  readonly destacarNegativo = input(false);
  /** Mantém a cor herdada (ex.: sobre fundos coloridos). */
  readonly herdarCor = input(false);

  protected readonly texto = computed(() =>
    this.oculto() ? MASCARA_VALOR : formatBRLComSinal(this.centavos(), this.sinal()),
  );

  protected readonly classes = computed(() => {
    let cor = '';
    if (!this.herdarCor()) {
      if (this.sinal() === 'entrada') cor = 'text-pos-ink';
      else if (this.sinal() === 'gasto') cor = 'text-neg-ink';
      else if (this.destacarNegativo() && this.centavos() < 0) cor = 'text-neg-ink';
    }
    return `font-display tabular whitespace-nowrap ${TAMANHOS[this.tamanho()]} ${cor}`;
  });
}
