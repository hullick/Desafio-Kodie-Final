import { Component, inject } from '@angular/core';
import { NbExcluirContaForm } from '../../ui/organisms/excluir-conta-form/excluir-conta-form';
import { NbDetailTemplate } from '../../ui/templates/detail-template/detail-template';
import { ExcluirContaFacade } from './excluir-conta.facade';

/** Página "Excluir minha conta" (R-05.6, U-05.2). */
@Component({
  selector: 'nb-excluir-conta-page',
  imports: [NbDetailTemplate, NbExcluirContaForm],
  providers: [ExcluirContaFacade],
  template: `
    <nb-detail-template titulo="Excluir minha conta" voltarPara="/perfil" rotuloVoltar="Perfil">
      <nb-excluir-conta-form [carregando]="f.carregando()" [erro]="f.erro()" (excluir)="f.excluir($event)" />
    </nb-detail-template>
  `,
})
export class ExcluirContaPage {
  protected readonly f = inject(ExcluirContaFacade);
}
