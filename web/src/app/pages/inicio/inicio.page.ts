import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NbSkeleton } from '../../ui/atoms/skeleton/skeleton';
import { NbEmptyState } from '../../ui/molecules/empty-state/empty-state';
import { NbMonthSwitcher } from '../../ui/molecules/month-switcher/month-switcher';
import { NbSectionHeader } from '../../ui/molecules/section-header/section-header';
import { NbBalanceCard } from '../../ui/organisms/balance-card/balance-card';
import { NbCaixinhaCard } from '../../ui/organisms/caixinha-card/caixinha-card';
import { NbCategoryBreakdown } from '../../ui/organisms/category-breakdown/category-breakdown';
import { NbTransactionList } from '../../ui/organisms/transaction-list/transaction-list';
import { InicioFacade } from './inicio.facade';

/** Página Início (painel do mês). Só composição: os dados vêm prontos do InicioFacade. */
@Component({
  selector: 'nb-inicio-page',
  imports: [NbBalanceCard, NbCaixinhaCard, NbCategoryBreakdown, NbEmptyState, NbMonthSwitcher, NbSectionHeader, NbSkeleton,
    NbTransactionList, RouterLink],
  providers: [InicioFacade],
  template: `
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="font-display text-2xl font-bold">Olá, {{ f.vm()?.nome }}</h1>
        <p class="text-sm text-muted">Seu resumo financeiro</p>
      </div>
      <nb-month-switcher [rotulo]="f.mes.rotulo()" [podeAvancar]="f.mes.podeAvancar()"
        (anterior)="f.mes.anterior()" (proximo)="f.mes.proximo()" />
    </div>

    @if (f.vm(); as vm) {
      <div [attr.aria-busy]="f.carregando()" class="transition-opacity" [class.opacity-60]="f.carregando()">
        <nb-balance-card class="mt-4" [saldo]="vm.saldo" [entradas]="vm.entradas" [gastos]="vm.gastos"
          [oculto]="f.oculto()" [carregando]="f.carregando()" (alternarOculto)="f.alternarOculto()" />

        <nb-category-breakdown class="mt-8" [fatias]="vm.fatias" [totalCentavos]="vm.gastos" [nomeMes]="f.mes.nome()" [oculto]="f.oculto()" />

        <section class="mt-8" aria-labelledby="titulo-caixinhas">
          <nb-section-header id="titulo-caixinhas" titulo="Suas caixinhas">
            <a routerLink="/caixinhas/nova" class="inline-flex min-h-11 items-center text-sm font-bold text-brand-ink">Criar nova +</a>
          </nb-section-header>
          <div class="mt-3 space-y-3">
            @for (c of vm.caixinhas; track c.id) {
              <nb-caixinha-card variante="resumo" [caixinha]="c" [oculto]="f.oculto()" />
            } @empty {
              <nb-empty-state titulo="Nenhuma caixinha ativa" texto="Crie uma para juntar dinheiro para um objetivo." />
            }
          </div>
        </section>

        <section class="mt-8" aria-labelledby="titulo-ultimos">
          <nb-section-header id="titulo-ultimos" titulo="Últimos lançamentos">
            <a routerLink="/lancamentos" [queryParams]="f.linkVerTodos()" class="inline-flex min-h-11 items-center text-sm font-bold text-brand-ink">Ver todos</a>
          </nb-section-header>
          <nb-transaction-list class="mt-3" [grupos]="vm.ultimos" [oculto]="f.oculto()"
            [textoVazio]="'Nenhum lançamento em ' + f.mes.nome() + '.'" (editar)="f.editar($event)" />
        </section>
      </div>
    } @else if (f.falhou()) {
      <nb-empty-state class="mt-8" icone="circle-alert" titulo="Não foi possível carregar" texto="Verifique a conexão e tente de novo." />
    } @else {
      <div aria-busy="true" aria-label="Carregando" class="mt-4 space-y-4">
        <nb-skeleton forma="h-44 w-full rounded-card" />
        <nb-skeleton forma="h-80 w-full rounded-card" />
      </div>
    }
  `,
})
export class InicioPage {
  protected readonly f = inject(InicioFacade);
}
