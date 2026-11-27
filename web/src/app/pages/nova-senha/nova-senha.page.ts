import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NbButton } from '../../ui/atoms/button/button';
import { NbEmptyState } from '../../ui/molecules/empty-state/empty-state';
import { NbSenhaForm } from '../../ui/organisms/senha-form/senha-form';
import { NbAuthTemplate } from '../../ui/templates/auth-template/auth-template';
import { NovaSenhaFacade } from './nova-senha.facade';

/** Página "Nova senha" (R-01.8): aberta pelo link do e-mail. */
@Component({
  selector: 'nb-nova-senha-page',
  imports: [NbAuthTemplate, NbButton, NbEmptyState, NbSenhaForm, RouterLink],
  providers: [NovaSenhaFacade],
  template: `
    <nb-auth-template titulo="Criar nova senha" subtitulo="Depois é só entrar com ela.">
      @if (f.linkInvalido()) {
        <div role="alert">
          <nb-empty-state icone="circle-alert" titulo="Link inválido ou expirado"
            texto="O link vale por 1 hora e só pode ser usado uma vez. Peça um novo." />
        </div>
        <a nb-button routerLink="/esqueci-senha" [larguraTotal]="true" class="mt-4">Pedir novo link</a>
      } @else {
        <nb-senha-form [carregando]="f.carregando()" [erro]="f.erro()" rotuloBotao="Salvar nova senha"
          (salvar)="f.salvar($event.nova)" />
      }
      <p rodape class="text-muted">
        <a routerLink="/entrar" class="inline-flex min-h-11 items-center font-bold text-brand-ink">Voltar para o login</a>
      </p>
    </nb-auth-template>
  `,
})
export class NovaSenhaPage {
  protected readonly f = inject(NovaSenhaFacade);
}
