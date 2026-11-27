import { Component, input, output } from '@angular/core';
import { NbIconButton } from '../../atoms/icon-button/icon-button';
import { NbValor } from '../../atoms/valor/valor';
import { NbStatPill } from '../../molecules/stat-pill/stat-pill';

/** Organismo: card do saldo do mês com entradas, gastos e o olho (R-03.2, R-03.3, U-03.2). */
@Component({
  selector: 'nb-balance-card',
  imports: [NbIconButton, NbStatPill, NbValor],
  template: `
    <div class="flex items-center justify-between">
      <h2 class="text-xs font-bold uppercase tracking-widest text-ink/75">Saldo do mês</h2>
      <button nb-icon-button variante="vidro" [icone]="oculto() ? 'eye-off' : 'eye'"
        [rotulo]="oculto() ? 'Mostrar valores' : 'Esconder valores'" [attr.aria-pressed]="oculto()"
        (click)="alternarOculto.emit()"></button>
    </div>
    <nb-valor class="mt-2 block" tamanho="saldo" [centavos]="saldo()" [oculto]="oculto()" [destacarNegativo]="true" />
    <div class="mt-5 grid grid-cols-2 gap-3">
      <nb-stat-pill tipo="entrada" [centavos]="entradas()" [oculto]="oculto()" />
      <nb-stat-pill tipo="gasto" [centavos]="gastos()" [oculto]="oculto()" />
    </div>
  `,
  host: {
    class: 'block rounded-card bg-gradient-to-br from-brand to-brand-dark p-5 text-ink shadow-n3',
    '[attr.aria-busy]': 'carregando()',
  },
})
export class NbBalanceCard {
  readonly saldo = input.required<number>();
  readonly entradas = input.required<number>();
  readonly gastos = input.required<number>();
  readonly oculto = input(false);
  readonly carregando = input(false);
  readonly alternarOculto = output<void>();
}
