import { Component, input } from '@angular/core';
import { IconeNome } from '../../../core/dominio/icones';
import { NbIcon } from '../../atoms/icon/icon';

/** Molécula: chip de categoria selecionável (R-02.4, U-02.4: estado visual + aria-pressed). */
@Component({
  selector: 'button[nb-category-chip]',
  imports: [NbIcon],
  template: `<nb-icon [nome]="icone()" [tamanho]="22" /><span class="text-xs font-semibold leading-tight">{{ rotulo() }}</span>`,
  host: {
    type: 'button',
    '[attr.aria-pressed]': 'selecionado()',
    '[class]': `"flex min-h-16 flex-col items-center justify-center gap-1 rounded-box px-1 py-2 transition active:scale-95 " +
      (selecionado() ? "bg-brand text-ink shadow-n3" : "bg-canvas text-ink hover:bg-brand-light")`,
  },
})
export class NbCategoryChip {
  readonly icone = input.required<IconeNome>();
  readonly rotulo = input.required<string>();
  readonly selecionado = input(false);
}
