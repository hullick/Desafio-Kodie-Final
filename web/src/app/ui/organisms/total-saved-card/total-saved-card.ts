import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NbButton } from '../../atoms/button/button';
import { NbIcon } from '../../atoms/icon/icon';
import { NbValor } from '../../atoms/valor/valor';

/** Organismo: "Total guardado" com o atalho para criar caixinha (R-04.1). Sem nível nem rendimento. */
@Component({
  selector: 'nb-total-saved-card',
  imports: [NbButton, NbIcon, NbValor, RouterLink],
  template: `
    <h2 class="flex items-center gap-2 text-sm font-semibold"><nb-icon nome="piggy-bank" [tamanho]="18" />Total guardado</h2>
    <nb-valor class="mt-1 block" tamanho="xl" [centavos]="totalCentavos()" [oculto]="oculto()" [herdarCor]="true" />
    <p class="mt-1 text-sm text-white/85">{{ ativas() }} {{ ativas() === 1 ? 'caixinha ativa' : 'caixinhas ativas' }}</p>
    <a nb-button variante="escuro" routerLink="/caixinhas/nova" class="mt-4 w-full"><nb-icon nome="plus" [tamanho]="18" />Nova caixinha</a>
  `,
  host: { class: 'block rounded-card bg-gradient-to-br from-brand-ink to-brand-dark p-5 text-white shadow-n3' },
})
export class NbTotalSavedCard {
  readonly totalCentavos = input.required<number>();
  readonly ativas = input.required<number>();
  readonly oculto = input(false);
}
