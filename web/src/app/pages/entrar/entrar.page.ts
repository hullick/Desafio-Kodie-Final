import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NbLoginForm } from '../../ui/organisms/login-form/login-form';
import { NbAuthTemplate } from '../../ui/templates/auth-template/auth-template';
import { environment } from '../../../environments/environment';
import { EntrarFacade } from './entrar.facade';

/** Página Entrar (spec 01). */
@Component({
  selector: 'nb-entrar-page',
  imports: [NbAuthTemplate, NbLoginForm, RouterLink],
  providers: [EntrarFacade],
  template: `
    <nb-auth-template titulo="Entrar" subtitulo="Que bom ver você de novo.">
      @if (f.aviso(); as aviso) {
        <p role="status" class="mb-4 rounded-box bg-brand-light px-4 py-3 text-sm font-semibold text-brand-ink">{{ aviso }}</p>
      }
      <nb-login-form [carregando]="f.carregando()" [erro]="f.erro()" (entrar)="f.entrar($event)" />
      @if (recuperacaoSenha) {
        <a routerLink="/esqueci-senha" class="mt-2 flex min-h-11 items-center justify-center text-sm font-bold text-brand-ink">Esqueci a senha</a>
      }
      <p rodape class="text-muted">Ainda não tem conta?
        <a routerLink="/cadastro" class="inline-flex min-h-11 items-center font-bold text-brand-ink">Criar conta</a>
      </p>
    </nb-auth-template>
  `,
})
export class EntrarPage {
  protected readonly f = inject(EntrarFacade);
  /** Sem SMTP em produção, o link não aparece (environment.prod.ts). */
  protected readonly recuperacaoSenha = environment.recuperacaoSenha;
}
