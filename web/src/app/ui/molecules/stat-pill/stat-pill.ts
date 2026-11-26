import { Component, input } from '@angular/core';
import { TipoLancamento } from '../../../core/dominio/tipos';
import { NbIconTile } from '../../atoms/icon-tile/icon-tile';
import { NbValor } from '../../atoms/valor/valor';

/** Molécula: sub-card de Entradas/Gastos no card de saldo. */
@Component({
  selector: 'nb-stat-pill',
  imports: [NbIconTile, NbValor],
  template: `
    <nb-icon-tile [icone]="tipo() === 'entrada' ? 'arrow-up' : 'arrow-down'" tamanho="sm"
      [fundo]="tipo() === 'entrada' ? '#EAF7EE' : '#FDEEEE'"
      [cor]="tipo() === 'entrada' ? 'var(--color-pos-ink)' : 'var(--color-neg-ink)'" />
    <div class="min-w-0">
      <p class="text-[11px] font-semibold uppercase tracking-wide text-ink/70">{{ tipo() === 'entrada' ? 'Entradas' : 'Gastos' }}</p>
      <nb-valor [centavos]="centavos()" tamanho="sm" [oculto]="oculto()"
        [class]="tipo() === 'entrada' ? 'text-pos-ink' : 'text-neg-ink'" [herdarCor]="true" />
    </div>
  `,
  host: { class: 'flex items-center gap-2 rounded-box bg-white/90 p-3' },
})
export class NbStatPill {
  readonly tipo = input.required<TipoLancamento>();
  readonly centavos = input.required<number>();
  readonly oculto = input(false);
}
