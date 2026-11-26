import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NbToast } from '../../ui/molecules/toast/toast';
import { NbAppHeader } from '../../ui/organisms/app-header/app-header';
import { NbBottomNav } from '../../ui/organisms/bottom-nav/bottom-nav';
import { NbBottomSheet } from '../../ui/organisms/bottom-sheet/bottom-sheet';
import { NbLancamentoForm } from '../../ui/organisms/lancamento-form/lancamento-form';
import { NbMovimentoForm } from '../../ui/organisms/movimento-form/movimento-form';
import { NbShellTemplate } from '../../ui/templates/shell-template/shell-template';
import { LancamentoSheetFacade } from './lancamento-sheet.facade';
import { MovimentoSheetFacade } from './movimento-sheet.facade';
import { ShellFacade } from './shell.facade';

/** Página-casca das abas logadas. Os sheets ficam aqui para abrir de qualquer aba (R-02.1). */
@Component({
  selector: 'nb-shell-page',
  imports: [NbAppHeader, NbBottomNav, NbBottomSheet, NbLancamentoForm, NbMovimentoForm, NbShellTemplate, NbToast, RouterOutlet],
  providers: [ShellFacade, LancamentoSheetFacade, MovimentoSheetFacade],
  template: `
    <nb-shell-template>
      <nb-app-header topo [nome]="shell.nome()" />
      <router-outlet />
      <nb-bottom-nav navegacao (novoLancamento)="shell.novoLancamento()" />

      <div sobreposicao>
        @if (lanc.aberto()) {
          <nb-bottom-sheet [rotulo]="lanc.emEdicao() ? 'Editar lançamento' : 'Novo lançamento'" (fechar)="lanc.fechar()">
            @if (lanc.pronto()) {
              <nb-lancamento-form [inicial]="lanc.inicial()" [salvando]="lanc.salvando()" [erro]="lanc.erro()"
                (salvar)="lanc.salvar($event)" (excluir)="lanc.excluir()" />
            }
          </nb-bottom-sheet>
        }
        @if (mov.pedido(); as p) {
          @if (mov.caixinha(); as c) {
            <nb-bottom-sheet [rotulo]="p.tipo === 'guardar' ? 'Guardar' : 'Retirar'" (fechar)="mov.fechar()">
              <nb-movimento-form [tipo]="p.tipo" [nomeCaixinha]="c.nome" [saldoCentavos]="c.saldoCentavos"
                [salvando]="mov.salvando()" [erro]="mov.erro()" (salvar)="mov.salvar($event)" />
            </nb-bottom-sheet>
          }
        }
        <div class="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center">
          @if (shell.toast(); as t) { <nb-toast [mensagem]="t.mensagem" /> }
        </div>
      </div>
    </nb-shell-template>
  `,
})
export class ShellPage {
  protected readonly shell = inject(ShellFacade);
  protected readonly lanc = inject(LancamentoSheetFacade);
  protected readonly mov = inject(MovimentoSheetFacade);
}
