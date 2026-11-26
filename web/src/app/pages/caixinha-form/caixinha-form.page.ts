import { Component, inject } from '@angular/core';
import { NbSkeleton } from '../../ui/atoms/skeleton/skeleton';
import { NbCaixinhaForm } from '../../ui/organisms/caixinha-form/caixinha-form';
import { NbDetailTemplate } from '../../ui/templates/detail-template/detail-template';
import { CaixinhaFormFacade } from './caixinha-form.facade';

/** Página nova/editar caixinha: uma tela, 4 decisões (U-04.1). */
@Component({
  selector: 'nb-caixinha-form-page',
  imports: [NbCaixinhaForm, NbDetailTemplate, NbSkeleton],
  providers: [CaixinhaFormFacade],
  template: `
    <nb-detail-template sobretitulo="Caixinhas" [titulo]="f.editando() ? 'Editar caixinha' : 'Nova caixinha'"
      [voltarPara]="f.voltarPara()" [rotuloVoltar]="f.editando() ? 'a caixinha' : 'Caixinhas'">
      <p class="mb-6 text-center text-muted">Defina seu objetivo e acompanhe sua evolução.</p>
      @if (f.pronto()) {
        <nb-caixinha-form [inicial]="f.inicial()" [saldoCentavos]="f.saldoCentavos()" [hoje]="f.hoje"
          [salvando]="f.salvando()" [erro]="f.erro()" (salvar)="f.salvar($event)" />
      } @else {
        <nb-skeleton forma="h-96 w-full rounded-card" />
      }
    </nb-detail-template>
  `,
})
export class CaixinhaFormPage {
  protected readonly f = inject(CaixinhaFormFacade);
}
