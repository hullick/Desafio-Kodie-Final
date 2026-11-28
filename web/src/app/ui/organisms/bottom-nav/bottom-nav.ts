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

const INICIO: Aba = { rota: '/inicio', rotulo: 'Início', icone: 'house' };
const CAIXINHAS: Aba = { rota: '/caixinhas', rotulo: 'Caixinhas', icone: 'piggy-bank' };

/**
 * Organismo: navegação inferior com o "+" central na zona do polegar (R-02.1, U-00.4).
 * Só Início e Caixinhas: o Perfil fica no avatar do topo (nb-app-header).
 */
@Component({
  selector: 'nb-bottom-nav',
  imports: [NbIcon, NbIconButton, NgTemplateOutlet, RouterLink, RouterLinkActive],
  template: `
    <ng-template #aba let-a>
      <!-- A aba atual vem do aria-current (não de routerLinkActive + classe, que perdia para text-ink/70 na
           ordem do CSS): cor da marca e uma barra no topo, para não depender só da cor (WCAG 1.4.1). -->
      <a [routerLink]="a.rota" routerLinkActive ariaCurrentWhenActive="page"
        class="relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold text-ink/70
          aria-[current=page]:font-bold aria-[current=page]:text-brand-ink
          aria-[current=page]:after:absolute aria-[current=page]:after:top-0 aria-[current=page]:after:h-1
          aria-[current=page]:after:w-8 aria-[current=page]:after:rounded-b-full aria-[current=page]:after:bg-brand-ink">
        <nb-icon [nome]="a.icone" [tamanho]="22" />{{ a.rotulo }}
      </a>
    </ng-template>
    <nav aria-label="Navegação principal" class="mx-auto grid max-w-md grid-cols-3 items-end px-2 pb-[env(safe-area-inset-bottom)]">
      <ng-container *ngTemplateOutlet="aba; context: { $implicit: inicio }" />
      <div class="flex justify-center">
        <button nb-icon-button variante="fab" icone="plus" rotulo="Novo lançamento" class="-translate-y-5"
          (click)="novoLancamento.emit()"></button>
      </div>
      <ng-container *ngTemplateOutlet="aba; context: { $implicit: caixinhas }" />
    </nav>
  `,
  host: { class: 'block border-t border-line bg-surface/95 backdrop-blur' },
})
export class NbBottomNav {
  readonly novoLancamento = output<void>();
  protected readonly inicio = INICIO;
  protected readonly caixinhas = CAIXINHAS;
}
