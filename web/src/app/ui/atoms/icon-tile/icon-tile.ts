import { Component, computed, input } from '@angular/core';
import { IconeNome } from '../../../core/dominio/icones';
import { NbIcon } from '../icon/icon';

export type TamanhoTile = 'sm' | 'md' | 'lg' | 'xl';
const TAMANHOS: Record<TamanhoTile, { caixa: string; icone: number }> = {
  sm: { caixa: 'size-8', icone: 16 },
  md: { caixa: 'size-10', icone: 20 },
  lg: { caixa: 'size-14', icone: 26 },
  xl: { caixa: 'size-20', icone: 36 },
};

/** Átomo: ícone dentro de um círculo colorido (categorias, caixinhas, itens de menu). */
@Component({
  selector: 'nb-icon-tile',
  imports: [NbIcon],
  template: `<nb-icon [nome]="icone()" [tamanho]="dims().icone" />`,
  host: {
    '[class]': '"inline-flex items-center justify-center rounded-full shrink-0 " + dims().caixa',
    '[style.background-color]': 'fundo()',
    '[style.color]': 'cor()',
  },
})
export class NbIconTile {
  readonly icone = input.required<IconeNome>();
  readonly tamanho = input<TamanhoTile>('md');
  readonly fundo = input('var(--color-brand-light)');
  readonly cor = input('var(--color-brand-ink)');
  protected readonly dims = computed(() => TAMANHOS[this.tamanho()]);
}
