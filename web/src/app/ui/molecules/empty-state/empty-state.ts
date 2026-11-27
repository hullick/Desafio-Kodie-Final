import { Component, input } from '@angular/core';
import { IconeNome } from '../../../core/dominio/icones';
import { NbIconTile } from '../../atoms/icon-tile/icon-tile';

/** Molécula: estado vazio que indica a próxima ação (U-03.4, R-04.9). */
@Component({
  selector: 'nb-empty-state',
  imports: [NbIconTile],
  template: `
    <nb-icon-tile [icone]="icone()" tamanho="lg" />
    <p class="font-display text-lg font-bold">{{ titulo() }}</p>
    <p class="max-w-64 text-sm text-muted">{{ texto() }}</p>
    <ng-content />
  `,
  host: { class: 'flex flex-col items-center gap-2 py-6 text-center' },
})
export class NbEmptyState {
  readonly icone = input<IconeNome>('piggy-bank');
  readonly titulo = input.required<string>();
  readonly texto = input('');
}
