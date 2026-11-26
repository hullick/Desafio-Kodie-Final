import { Component, input } from '@angular/core';
import { NbIconTile } from '../../atoms/icon-tile/icon-tile';
import { NbValor } from '../../atoms/valor/valor';
import { TransacaoItemVM } from '../../modelos';

/** Molécula: linha de lançamento, inteira clicável para editar (R-02.8, U-02.5). */
@Component({
  selector: 'button[nb-transaction-item]',
  imports: [NbIconTile, NbValor],
  template: `
    <nb-icon-tile [icone]="item().icone" [fundo]="item().fundo" [cor]="item().cor" />
    <span class="min-w-0 flex-1 text-left">
      <span class="block truncate text-[15px] font-semibold">{{ item().titulo }}</span>
      <span class="block truncate text-xs text-muted">{{ item().subtitulo }}</span>
    </span>
    <nb-valor [centavos]="item().centavos" [sinal]="item().tipo" [oculto]="oculto()" />
  `,
  host: {
    type: 'button',
    class: 'flex w-full min-h-16 items-center gap-3 rounded-box px-2 py-2 transition hover:bg-canvas active:scale-[0.99]',
  },
})
export class NbTransactionItem {
  readonly item = input.required<TransacaoItemVM>();
  readonly oculto = input(false);
}
