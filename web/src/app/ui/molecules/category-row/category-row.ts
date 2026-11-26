import { Component, input } from '@angular/core';
import { formatPercentualFixo } from '../../../core/formatacao/numero';
import { NbIconTile } from '../../atoms/icon-tile/icon-tile';
import { NbValor } from '../../atoms/valor/valor';
import { FatiaCategoriaVM } from '../../modelos';

/** Molécula: linha de categoria sob a rosca (nome, %, valor). Não depende só de cor (R-03.9). */
@Component({
  selector: 'nb-category-row',
  imports: [NbIconTile, NbValor],
  template: `
    <nb-icon-tile [icone]="fatia().icone" [fundo]="fatia().fundo" [cor]="fatia().cor" tamanho="md" />
    <span class="flex-1">
      <span class="block text-sm font-semibold">{{ fatia().rotulo }}</span>
      <span class="block text-xs text-muted tabular">{{ pct() }}</span>
    </span>
    <nb-valor [centavos]="fatia().centavos" tamanho="sm" [oculto]="oculto()" />
  `,
  host: { class: 'flex items-center gap-3 rounded-box bg-canvas px-3 py-2.5' },
})
export class NbCategoryRow {
  readonly fatia = input.required<FatiaCategoriaVM>();
  readonly oculto = input(false);
  protected pct() {
    return formatPercentualFixo(this.fatia().percentual);
  }
}
