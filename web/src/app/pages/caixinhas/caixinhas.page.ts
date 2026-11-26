import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NbButton } from '../../ui/atoms/button/button';
import { NbSkeleton } from '../../ui/atoms/skeleton/skeleton';
import { NbEmptyState } from '../../ui/molecules/empty-state/empty-state';
import { NbSectionHeader } from '../../ui/molecules/section-header/section-header';
import { NbCaixinhaCard } from '../../ui/organisms/caixinha-card/caixinha-card';
import { NbTotalSavedCard } from '../../ui/organisms/total-saved-card/total-saved-card';
import { CaixinhasFacade } from './caixinhas.facade';

/** Página Caixinhas (spec 04). "Guardar +" a um toque em cada card (U-04.3). */
@Component({
  selector: 'nb-caixinhas-page',
  imports: [NbButton, NbCaixinhaCard, NbEmptyState, NbSectionHeader, NbSkeleton, NbTotalSavedCard, RouterLink],
  providers: [CaixinhasFacade],
  template: `
    <h1 class="font-display text-2xl font-bold">Caixinhas</h1>
    <p class="text-sm text-muted">Suas metas e economias</p>

    @if (f.vm(); as vm) {
      @if (vm.vazio) {
        <nb-empty-state class="mt-10" icone="piggy-bank" titulo="Crie sua primeira caixinha."
          texto="Ex.: celular novo, viagem, reserva." />
        <a nb-button routerLink="/caixinhas/nova" [larguraTotal]="true" class="mt-4">Criar caixinha</a>
      } @else {
        <nb-total-saved-card class="mt-4" [totalCentavos]="vm.totalCentavos" [ativas]="vm.emAndamento.length" [oculto]="f.oculto()" />

        @if (vm.emAndamento.length) {
          <section class="mt-8" aria-labelledby="titulo-andamento">
            <nb-section-header id="titulo-andamento" titulo="Metas em andamento" [contador]="vm.emAndamento.length" />
            <div class="mt-3 space-y-4">
              @for (c of vm.emAndamento; track c.id) {
                <nb-caixinha-card [caixinha]="c" [oculto]="f.oculto()" (guardar)="f.guardar($event)" />
              }
            </div>
          </section>
        }
        @if (vm.atingidas.length) {
          <section class="mt-8" aria-labelledby="titulo-atingidas">
            <nb-section-header id="titulo-atingidas" titulo="Metas atingidas" [contador]="vm.atingidas.length" />
            <div class="mt-3 space-y-4">
              @for (c of vm.atingidas; track c.id) {
                <nb-caixinha-card [caixinha]="c" [oculto]="f.oculto()" (retirar)="f.retirar($event)" />
              }
            </div>
          </section>
        }
      }
    } @else if (f.falhou()) {
      <nb-empty-state class="mt-8" icone="circle-alert" titulo="Não foi possível carregar" texto="Verifique a conexão e tente de novo." />
    } @else {
      <div aria-busy="true" aria-label="Carregando" class="mt-4 space-y-4">
        <nb-skeleton forma="h-40 w-full rounded-card" />
        <nb-skeleton forma="h-52 w-full rounded-card" />
      </div>
    }
  `,
})
export class CaixinhasPage {
  protected readonly f = inject(CaixinhasFacade);
}
