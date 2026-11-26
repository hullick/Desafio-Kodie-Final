import { Component, computed, input, model } from '@angular/core';
import { hojeISO, rotuloDia } from '../../../core/tempo/mes';
import { NbIcon } from '../../atoms/icon/icon';

/**
 * Molécula: chip de data ("Hoje"). Um input date nativo e transparente cobre o chip,
 * então o toque abre o seletor do sistema. `max` impede datas futuras (R-02.6).
 */
@Component({
  selector: 'nb-date-chip',
  imports: [NbIcon],
  template: `
    <nb-icon nome="calendar" [tamanho]="18" class="text-brand-ink" />
    <span class="text-[15px] font-semibold">{{ rotulo() }}</span>
    <input type="date" class="absolute inset-0 cursor-pointer opacity-0" [attr.aria-label]="rotuloAcessivel()"
      [max]="max()" [value]="data()" (change)="aoMudar($any($event.target).value)" />
  `,
  host: { class: 'relative inline-flex min-h-12 items-center gap-2 rounded-box bg-canvas px-4' },
})
export class NbDateChip {
  readonly data = model.required<string>();
  readonly max = input(hojeISO());
  readonly rotuloAcessivel = input('Data');
  protected readonly rotulo = computed(() => rotuloDia(this.data(), hojeISO()));

  protected aoMudar(valor: string): void {
    if (valor && valor <= this.max()) this.data.set(valor);
  }
}
