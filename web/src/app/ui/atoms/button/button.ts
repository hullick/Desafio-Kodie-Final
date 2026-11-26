import { Component, computed, input } from '@angular/core';

export type VarianteBotao = 'primario' | 'secundario' | 'fantasma' | 'perigo' | 'escuro' | 'ouro';
export type TamanhoBotao = 'md' | 'sm';

const VARIANTES: Record<VarianteBotao, string> = {
  primario: 'bg-brand text-ink shadow-n3 hover:brightness-95',
  secundario: 'bg-brand-light text-brand-ink hover:brightness-95',
  fantasma: 'bg-transparent text-ink hover:bg-black/5',
  perigo: 'bg-transparent text-neg-ink hover:bg-neg/10',
  escuro: 'bg-ink text-white hover:brightness-110',
  ouro: 'bg-gold text-gold-ink hover:brightness-95',
};
const TAMANHOS: Record<TamanhoBotao, string> = {
  md: 'min-h-12 px-6 text-[15px]',
  sm: 'min-h-11 px-4 text-sm',
};

/**
 * Átomo: botão. Usa o elemento nativo (button/a) para manter semântica e teclado.
 * Altura mínima 44px (U-00.1). Texto sobre turquesa é escuro (contraste AA).
 */
@Component({
  selector: 'button[nb-button], a[nb-button]',
  template: '<ng-content />',
  host: { '[class]': 'classes()' },
})
export class NbButton {
  readonly variante = input<VarianteBotao>('primario');
  readonly tamanho = input<TamanhoBotao>('md');
  readonly larguraTotal = input(false);

  protected readonly classes = computed(() =>
    [
      'inline-flex items-center justify-center gap-2 rounded-full font-display font-bold select-none',
      'transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none aria-disabled:opacity-50',
      VARIANTES[this.variante()],
      TAMANHOS[this.tamanho()],
      this.larguraTotal() ? 'w-full' : '',
    ].join(' '),
  );
}
