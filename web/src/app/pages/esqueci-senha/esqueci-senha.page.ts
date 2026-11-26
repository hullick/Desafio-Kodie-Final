import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NbButton } from '../../ui/atoms/button/button';
import { NbEmptyState } from '../../ui/molecules/empty-state/empty-state';
import { NbEmailForm } from '../../ui/organisms/email-form/email-form';
import { NbAuthTemplate } from '../../ui/templates/auth-template/auth-template';
import { EsqueciSenhaFacade } from './esqueci-senha.facade';

/** Página "Esqueci a senha" (R-01.8). */
@Component({
  selector: 'nb-esqueci-senha-page',
  imports: [NbAuthTemplate, NbButton, NbEmailForm, NbEmptyState, RouterLink],
  providers: [EsqueciSenhaFacade],
  template: `
    <nb-auth-template titulo="Esqueci a senha" subtitulo="Enviamos um link para você criar uma nova.">
      @if (f.enviadoPara(); as email) {
        <div role="status">
          <nb-empty-state icone="mail" titulo="Confira seu e-mail"
            [texto]="'Se houver uma conta com ' + email + ', enviamos um link para criar uma nova senha. Ele vale por 1 hora.'" />
        </div>
        <button nb-button type="button" variante="secundario" [larguraTotal]="true" class="mt-4" (click)="f.outroEmail()">
          Usar outro e-mail
        </button>
      } @else {
        <nb-email-form [carregando]="f.carregando()" [erro]="f.erro()" (enviarEmail)="f.enviar($event)" />
      }
      <p rodape class="text-muted">Lembrou a senha?
        <a routerLink="/entrar" class="inline-flex min-h-11 items-center font-bold text-brand-ink">Entrar</a>
      </p>
    </nb-auth-template>
  `,
})
export class EsqueciSenhaPage {
  protected readonly f = inject(EsqueciSenhaFacade);
}
