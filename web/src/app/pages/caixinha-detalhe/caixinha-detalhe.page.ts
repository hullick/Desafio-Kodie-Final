import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NbButton } from '../../ui/atoms/button/button';
import { NbIcon } from '../../ui/atoms/icon/icon';
import { NbIconButton } from '../../ui/atoms/icon-button/icon-button';
import { NbSkeleton } from '../../ui/atoms/skeleton/skeleton';
import { NbEmptyState } from '../../ui/molecules/empty-state/empty-state';
import { NbCaixinhaHero } from '../../ui/organisms/caixinha-hero/caixinha-hero';
import { NbMovementHistory } from '../../ui/organisms/movement-history/movement-history';
import { NbDetailTemplate } from '../../ui/templates/detail-template/detail-template';
import { CaixinhaDetalheFacade } from './caixinha-detalhe.facade';

/** Página detalhe da caixinha (R-04.4). O menu ⋮ tem Editar e Excluir (R-04.7). */
@Component({
  selector: 'nb-caixinha-detalhe-page',
  imports: [NbButton, NbCaixinhaHero, NbDetailTemplate, NbEmptyState, NbIcon, NbIconButton, NbMovementHistory, NbSkeleton, RouterLink],
  providers: [CaixinhaDetalheFacade],
  template: `
    <nb-detail-template titulo="Detalhe da caixinha" voltarPara="/caixinhas" rotuloVoltar="Caixinhas">
      <div acoes class="relative">
        <button nb-icon-button icone="ellipsis-vertical" rotulo="Mais opções" [attr.aria-expanded]="menu()"
          aria-controls="menu-caixinha" (click)="menu.set(!menu()); confirmando.set(false)"></button>
        @if (menu()) {
          <div id="menu-caixinha" class="absolute right-0 top-12 z-10 w-56 rounded-box bg-surface p-2 shadow-n2">
            <a [routerLink]="f.linkEditar()" class="flex min-h-11 items-center gap-2 rounded-box px-3 hover:bg-canvas">
              <nb-icon nome="pencil-line" [tamanho]="18" />Editar
            </a>
            @if (confirmando()) {
              <button type="button" class="flex min-h-11 w-full items-center gap-2 rounded-box px-3 font-semibold text-neg-ink hover:bg-neg/10"
                (click)="f.excluir(); menu.set(false)"><nb-icon nome="trash-2" [tamanho]="18" />Excluir de vez</button>
            } @else {
              <button type="button" class="flex min-h-11 w-full items-center gap-2 rounded-box px-3 text-neg-ink hover:bg-neg/10"
                (click)="confirmando.set(true)"><nb-icon nome="trash-2" [tamanho]="18" />Excluir</button>
            }
          </div>
        }
      </div>

      @if (f.vm(); as vm) {
        <nb-caixinha-hero [caixinha]="vm.caixinha" [mesesRestantes]="vm.caixinha.calculo.mesesRestantes" />
        <div aria-live="assertive">
          @if (f.erro(); as e) { <p class="mt-3 rounded-box bg-neg/10 px-4 py-3 text-sm text-neg-ink">{{ e }}</p> }
        </div>
        <div class="mt-4 grid grid-cols-2 gap-3">
          <button nb-button (click)="f.guardar()"><nb-icon nome="plus" [tamanho]="18" />Guardar</button>
          <button nb-button variante="secundario" [disabled]="vm.caixinha.guardadoCentavos === 0" (click)="f.retirar()">
            <nb-icon nome="arrow-up" [tamanho]="18" />Retirar
          </button>
        </div>
        <nb-movement-history class="mt-8" [itens]="vm.movimentos" />
      } @else if (f.naoEncontrada()) {
        <nb-empty-state class="mt-8" icone="circle-alert" titulo="Caixinha não encontrada" texto="Ela pode ter sido excluída." />
      } @else {
        <nb-skeleton forma="h-96 w-full rounded-card" />
      }
    </nb-detail-template>
  `,
})
export class CaixinhaDetalhePage {
  protected readonly f = inject(CaixinhaDetalheFacade);
  protected readonly menu = signal(false);
  protected readonly confirmando = signal(false);
}
