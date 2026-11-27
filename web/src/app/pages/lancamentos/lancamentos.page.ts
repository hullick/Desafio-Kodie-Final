import { Component, inject } from '@angular/core';
import { NbSkeleton } from '../../ui/atoms/skeleton/skeleton';
import { NbMonthSwitcher } from '../../ui/molecules/month-switcher/month-switcher';
import { NbTransactionList } from '../../ui/organisms/transaction-list/transaction-list';
import { NbDetailTemplate } from '../../ui/templates/detail-template/detail-template';
import { LancamentosFacade } from './lancamentos.facade';

/** Página "Ver todos": lançamentos do mês por dia; tocar edita (R-02.8, U-02.5). */
@Component({
  selector: 'nb-lancamentos-page',
  imports: [NbDetailTemplate, NbMonthSwitcher, NbSkeleton, NbTransactionList],
  providers: [LancamentosFacade],
  template: `
    <nb-detail-template titulo="Lançamentos" voltarPara="/inicio" rotuloVoltar="Início">
      <div class="flex justify-center">
        <nb-month-switcher [rotulo]="f.mes.rotulo()" [podeAvancar]="f.mes.podeAvancar()"
          (anterior)="f.mes.anterior()" (proximo)="f.mes.proximo()" />
      </div>
      @if (f.grupos(); as grupos) {
        <nb-transaction-list class="mt-4" [attr.aria-busy]="f.carregando()" [grupos]="grupos" [oculto]="f.oculto()"
          [textoVazio]="'Nenhum lançamento em ' + f.mes.nome() + '.'" (editar)="f.editar($event)" />
      } @else {
        <nb-skeleton class="mt-4" forma="h-96 w-full rounded-card" />
      }
    </nb-detail-template>
  `,
})
export class LancamentosPage {
  protected readonly f = inject(LancamentosFacade);
}
