import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NbButton } from '../../ui/atoms/button/button';
import { NbEmptyState } from '../../ui/molecules/empty-state/empty-state';
import { NbSignupForm } from '../../ui/organisms/signup-form/signup-form';
import { NbAuthTemplate } from '../../ui/templates/auth-template/auth-template';
import { CadastroFacade } from './cadastro.facade';

/** Página Cadastro: uma tela, sem etapas (U-01.1). */
@Component({
  selector: 'nb-cadastro-page',
  imports: [NbAuthTemplate, NbButton, NbEmptyState, NbSignupForm, RouterLink],
  providers: [CadastroFacade],
  template: `
    <nb-auth-template titulo="Criar sua conta" subtitulo="Leva menos de 1 minuto.">
      @if (f.enviadoPara(); as email) {
        <div role="status">
          <nb-empty-state icone="mail" titulo="Confira seu e-mail"
            [texto]="'Se ' + email + ' puder ser usado, você vai receber um link para confirmar a conta.'" />
        </div>
        <a nb-button routerLink="/entrar" [larguraTotal]="true" class="mt-4">Ir para o login</a>
      } @else {
        <nb-signup-form [carregando]="f.carregando()" [erro]="f.erro()" (cadastrar)="f.cadastrar($event)" />
      }
      <p rodape class="text-muted">Já tem uma conta?
        <a routerLink="/entrar" class="inline-flex min-h-11 items-center font-bold text-brand-ink">Entrar</a>
      </p>
    </nb-auth-template>
  `,
})
export class CadastroPage {
  protected readonly f = inject(CadastroFacade);
}
