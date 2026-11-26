import { Component, computed, input } from '@angular/core';
import { IconeNome } from '../../../core/dominio/icones';
import { NbIcon } from '../icon/icon';

export type VarianteBotaoIcone = 'fantasma' | 'suave' | 'fab' | 'vidro';

const VARIANTES: Record<VarianteBotaoIcone, string> = {
  fantasma: 'size-11 text-ink hover:bg-black/5',
  suave: 'size-11 bg-brand-light text-brand-ink',
  fab: 'size-16 bg-brand text-ink shadow-n3 ring-4 ring-surface',
  vidro: 'size-11 bg-white/30 text-ink backdrop-blur',
};

/** Átomo: botão só com ícone. `rotulo` é obrigatório (nome acessível). */
@Component({
  selector: 'button[nb-icon-button], a[nb-icon-button]',
  imports: [NbIcon],
  template: `<nb-icon [nome]="icone()" [tamanho]="variante() === 'fab' ? 28 : 22" />`,
  host: {
    '[class]': 'classes()',
    '[attr.aria-label]': 'rotulo()',
    '[attr.title]': 'rotulo()',
  },
})
export class NbIconButton {
  readonly icone = input.required<IconeNome>();
  readonly rotulo = input.required<string>();
  readonly variante = input<VarianteBotaoIcone>('fantasma');

  protected readonly classes = computed(
    () => `inline-flex items-center justify-center rounded-full transition active:scale-95 ${VARIANTES[this.variante()]}`,
  );
}
