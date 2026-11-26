import { Component, input } from '@angular/core';
import { NbIconTile } from '../../atoms/icon-tile/icon-tile';
import { NbValor } from '../../atoms/valor/valor';
import { MovimentoItemVM } from '../../modelos';

/** Molécula: linha do histórico de uma caixinha (guardar/retirar). */
@Component({
  selector: 'nb-movement-item',
  imports: [NbIconTile, NbValor],
  template: `
    <nb-icon-tile [icone]="item().tipo === 'guardar' ? 'arrow-down' : 'arrow-up'"
      [fundo]="item().tipo === 'guardar' ? 'var(--color-brand-light)' : '#FDEEEE'"
      [cor]="item().tipo === 'guardar' ? 'var(--color-brand-ink)' : 'var(--color-neg-ink)'" />
    <span class="flex-1">
      <span class="block text-[15px] font-semibold">{{ item().titulo }}</span>
      <span class="block text-xs text-muted">{{ item().dataRotulo }}</span>
    </span>
    <nb-valor [centavos]="item().centavos" [sinal]="item().tipo === 'guardar' ? 'entrada' : 'gasto'" />
  `,
  host: { class: 'flex items-center gap-3 py-2' },
})
export class NbMovementItem {
  readonly item = input.required<MovimentoItemVM>();
}
