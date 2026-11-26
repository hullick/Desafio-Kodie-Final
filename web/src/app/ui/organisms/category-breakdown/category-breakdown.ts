import { Component, computed, input } from '@angular/core';
import { MASCARA_VALOR, formatBRL } from '../../../core/formatacao/dinheiro';
import { NbBadge } from '../../atoms/badge/badge';
import { NbCard } from '../../atoms/card/card';
import { NbCategoryRow } from '../../molecules/category-row/category-row';
import { FatiaDonut, NbDonutChart } from '../../molecules/donut-chart/donut-chart';
import { NbEmptyState } from '../../molecules/empty-state/empty-state';
import { NbSectionHeader } from '../../molecules/section-header/section-header';
import { FatiaCategoriaVM } from '../../modelos';

/** Organismo: gastos por categoria, rosca + lista, ou estado vazio (R-03.4, R-03.7, R-03.9). */
@Component({
  selector: 'nb-category-breakdown',
  imports: [NbBadge, NbCard, NbCategoryRow, NbDonutChart, NbEmptyState, NbSectionHeader],
  template: `
    <nb-section-header titulo="Gastos por categoria">
      @if (fatias().length) { <nb-badge variante="neutro">Total: {{ total() }}</nb-badge> }
    </nb-section-header>
    <nb-card class="mt-3">
      @if (fatias().length) {
        <nb-donut-chart class="mx-auto" [fatias]="donut()" tituloCentro="Total" [valorCentro]="total()" legendaCentro="gasto" />
        <ul class="mt-6 space-y-2">
          @for (f of fatias(); track f.id) { <li><nb-category-row [fatia]="f" [oculto]="oculto()" /></li> }
        </ul>
      } @else {
        <nb-empty-state icone="piggy-bank" [titulo]="'Nenhum gasto em ' + nomeMes() + '.'" texto="Toque no + para registrar o primeiro." />
      }
    </nb-card>
  `,
  host: { class: 'block' },
})
export class NbCategoryBreakdown {
  readonly fatias = input.required<readonly FatiaCategoriaVM[]>();
  readonly totalCentavos = input.required<number>();
  readonly nomeMes = input.required<string>();
  readonly oculto = input(false);

  protected readonly total = computed(() => (this.oculto() ? MASCARA_VALOR : formatBRL(this.totalCentavos())));
  protected readonly donut = computed<FatiaDonut[]>(() =>
    this.fatias().map((f) => ({ rotulo: f.rotulo, valor: f.centavos, cor: f.cor, percentual: f.percentual })));
}
