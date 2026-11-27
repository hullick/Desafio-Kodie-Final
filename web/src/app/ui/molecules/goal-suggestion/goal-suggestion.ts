import { Component, input, output } from '@angular/core';
import { NbIcon } from '../../atoms/icon/icon';
import { NbValor } from '../../atoms/valor/valor';

/** Molécula: "Guarde R$ X/mês para atingir" + atalho Guardar (R-04.2, U-04.3). */
@Component({
  selector: 'nb-goal-suggestion',
  imports: [NbIcon, NbValor],
  template: `
    <nb-icon nome="lightbulb" [tamanho]="18" class="text-gold-ink" />
    <p class="flex-1 text-sm text-ink">
      Guarde <nb-valor [centavos]="sugeridoCentavos()" tamanho="sm" class="text-brand-ink" [herdarCor]="true" />/mês para atingir
    </p>
    <button type="button" class="min-h-11 rounded-full bg-brand-light px-4 text-sm font-bold text-brand-ink"
      [attr.aria-label]="'Guardar em ' + nomeCaixinha()" (click)="guardar.emit()">Guardar +</button>
  `,
  host: { class: 'flex items-center gap-2 rounded-box bg-canvas px-3 py-2' },
})
export class NbGoalSuggestion {
  readonly sugeridoCentavos = input.required<number>();
  readonly nomeCaixinha = input.required<string>();
  readonly guardar = output<void>();
}
