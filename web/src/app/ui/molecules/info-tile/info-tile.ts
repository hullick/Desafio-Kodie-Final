import { Component, input } from '@angular/core';
import { IconeNome } from '../../../core/dominio/icones';
import { NbIcon } from '../../atoms/icon/icon';

/** Molécula: cartão de informação (PRAZO FINAL, META MENSAL). */
@Component({
  selector: 'nb-info-tile',
  imports: [NbIcon],
  template: `
    <p class="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted">
      <nb-icon [nome]="icone()" [tamanho]="16" />{{ rotulo() }}
    </p>
    <p class="mt-1 font-display text-lg font-bold tabular">{{ valor() }}</p>
    <p class="text-xs text-muted">{{ detalhe() }}</p>
  `,
  host: { class: 'block rounded-box bg-surface p-4 shadow-n1' },
})
export class NbInfoTile {
  readonly icone = input.required<IconeNome>();
  readonly rotulo = input.required<string>();
  readonly valor = input.required<string>();
  readonly detalhe = input('');
}
