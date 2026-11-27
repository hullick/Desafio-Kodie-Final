import { Component, inject } from '@angular/core';
import { NbSenhaForm } from '../../ui/organisms/senha-form/senha-form';
import { NbDetailTemplate } from '../../ui/templates/detail-template/detail-template';
import { AlterarSenhaFacade } from './alterar-senha.facade';

/** Página "Alterar senha" (R-05.3). */
@Component({
  selector: 'nb-alterar-senha-page',
  imports: [NbDetailTemplate, NbSenhaForm],
  providers: [AlterarSenhaFacade],
  template: `
    <nb-detail-template titulo="Alterar senha" voltarPara="/perfil" rotuloVoltar="Perfil">
      <p class="mb-5 text-sm text-muted">Por segurança, os outros aparelhos conectados vão precisar entrar de novo.</p>
      <nb-senha-form [pedirAtual]="true" [carregando]="f.carregando()" [erro]="f.erro()" rotuloBotao="Alterar senha"
        (salvar)="f.alterar($event.atual, $event.nova)" />
    </nb-detail-template>
  `,
})
export class AlterarSenhaPage {
  protected readonly f = inject(AlterarSenhaFacade);
}
