import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NbLoginForm } from '../../ui/organisms/login-form/login-form';
import { NbAuthTemplate } from '../../ui/templates/auth-template/auth-template';
import { EntrarFacade } from './entrar.facade';

/** Página Entrar (spec 01). */
@Component({
  selector: 'nb-entrar-page',
  imports: [NbAuthTemplate, NbLoginForm, RouterLink],
  providers: [EntrarFacade],
  template: `
    <nb-auth-template titulo="Entrar" subtitulo="Que bom ver você de novo.">
      <nb-login-form [carregando]="f.carregando()" [erro]="f.erro()" (entrar)="f.entrar($event)" />
      <p rodape class="text-muted">Ainda não tem conta?
        <a routerLink="/cadastro" class="inline-flex min-h-11 items-center font-bold text-brand-ink">Criar conta</a>
      </p>
    </nb-auth-template>
  `,
})
export class EntrarPage {
  protected readonly f = inject(EntrarFacade);
}
