import { Component, computed, input } from '@angular/core';

export type VarianteBadge = 'marca' | 'neutro' | 'ouro' | 'positivo' | 'negativo';

const VARIANTES: Record<VarianteBadge, string> = {
  marca: 'bg-brand-light text-brand-ink',
  neutro: 'bg-line text-muted',
  ouro: 'bg-gold text-gold-ink',
  positivo: 'bg-pos/10 text-pos-ink',
  negativo: 'bg-neg/10 text-neg-ink',
};

/** Átomo: etiqueta em pílula. */
@Component({
  selector: 'nb-badge',
  template: '<ng-content />',
  host: { '[class]': 'classes()' },
})
export class NbBadge {
  readonly variante = input<VarianteBadge>('marca');
  protected readonly classes = computed(
    () => `inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold tabular ${VARIANTES[this.variante()]}`,
  );
}
