import { Component, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconeNome } from '../../../core/dominio/icones';
import { NbIcon } from '../../atoms/icon/icon';
import { NbIconButton } from '../../atoms/icon-button/icon-button';

interface Aba {
  readonly rota: string;
  readonly rotulo: string;
  readonly icone: IconeNome;
}

const ESQUERDA: readonly Aba[] = [
  { rota: '/inicio', rotulo: 'Início', icone: 'house' },
  { rota: '/caixinhas', rotulo: 'Caixinhas', icone: 'piggy-bank' },
];
const DIREITA: readonly Aba[] = [{ rota: '/perfil', rotulo: 'Perfil', icone: 'user' }];

/** Organismo: navegação inferior com o "+" central na zona do polegar (R-02.1, U-00.4). */
@Component({
  selector: 'nb-bottom-nav',
  imports: [NbIcon, NbIconButton, NgTemplateOutlet, RouterLink, RouterLinkActive],
  template: `
    <ng-template #aba let-a>
      <a [routerLink]="a.rota" routerLinkActive="text-brand-ink" ariaCurrentWhenActive="page"
        class="flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold text-ink/70">
        <nb-icon [nome]="a.icone" [tamanho]="22" />{{ a.rotulo }}
      </a>
    </ng-template>
    <nav aria-label="Navegação principal" class="mx-auto grid max-w-md grid-cols-5 items-end px-2 pb-[env(safe-area-inset-bottom)]">
      @for (a of esquerda; track a.rota) { <ng-container *ngTemplateOutlet="aba; context: { $implicit: a }" /> }
      <div class="flex justify-center">
        <button nb-icon-button variante="fab" icone="plus" rotulo="Novo lançamento" class="-translate-y-5"
          (click)="novoLancamento.emit()"></button>
      </div>
      <span aria-hidden="true"></span>
      @for (a of direita; track a.rota) { <ng-container *ngTemplateOutlet="aba; context: { $implicit: a }" /> }
    </nav>
  `,
  host: { class: 'block border-t border-line bg-surface/95 backdrop-blur' },
})
export class NbBottomNav {
  readonly novoLancamento = output<void>();
  protected readonly esquerda = ESQUERDA;
  protected readonly direita = DIREITA;
}
