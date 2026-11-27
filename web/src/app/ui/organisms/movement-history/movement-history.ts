import { Component, input } from '@angular/core';
import { NbCard } from '../../atoms/card/card';
import { NbEmptyState } from '../../molecules/empty-state/empty-state';
import { NbMovementItem } from '../../molecules/movement-item/movement-item';
import { NbSectionHeader } from '../../molecules/section-header/section-header';
import { MovimentoItemVM } from '../../modelos';

/** Organismo: histórico de guardar/retirar, mais recente primeiro (R-04.4). */
@Component({
  selector: 'nb-movement-history',
  imports: [NbCard, NbEmptyState, NbMovementItem, NbSectionHeader],
  template: `
    <nb-section-header titulo="Histórico" />
    <nb-card class="mt-3" padding="md">
      <ul class="divide-y divide-line">
        @for (m of itens(); track m.id) { <li><nb-movement-item [item]="m" /></li> }
        @empty { <li><nb-empty-state icone="piggy-bank" titulo="Nada guardado ainda" texto="Toque em Guardar para começar." /></li> }
      </ul>
    </nb-card>
  `,
  host: { class: 'block' },
})
export class NbMovementHistory {
  readonly itens = input.required<readonly MovimentoItemVM[]>();
}
