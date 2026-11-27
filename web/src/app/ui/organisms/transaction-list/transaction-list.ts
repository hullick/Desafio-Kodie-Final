import { Component, input, output } from '@angular/core';
import { NbCard } from '../../atoms/card/card';
import { NbEmptyState } from '../../molecules/empty-state/empty-state';
import { NbTransactionItem } from '../../molecules/transaction-item/transaction-item';
import { GrupoTransacoesVM } from '../../modelos';

/** Organismo: lançamentos agrupados por dia; tocar num item abre a edição (R-02.8, U-02.5). */
@Component({
  selector: 'nb-transaction-list',
  imports: [NbCard, NbEmptyState, NbTransactionItem],
  template: `
    <nb-card padding="md">
      @for (g of grupos(); track g.rotulo) {
        @if (g.rotulo) { <h3 class="px-2 pb-1 pt-3 text-xs font-bold uppercase tracking-widest text-muted">{{ g.rotulo }}</h3> }
        <ul>
          @for (i of g.itens; track i.id) {
            <li><button nb-transaction-item [item]="i" [oculto]="oculto()" [attr.aria-label]="'Editar ' + i.titulo"
              (click)="editar.emit(i.id)"></button></li>
          }
        </ul>
      } @empty {
        <nb-empty-state icone="receipt-text" [titulo]="textoVazio()" texto="Toque no + para registrar." />
      }
    </nb-card>
  `,
  host: { class: 'block' },
})
export class NbTransactionList {
  readonly grupos = input.required<readonly GrupoTransacoesVM[]>();
  readonly oculto = input(false);
  readonly textoVazio = input('Nenhum lançamento neste mês.');
  readonly editar = output<string>();
}
