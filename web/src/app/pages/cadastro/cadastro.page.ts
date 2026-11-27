import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NbSignupForm } from '../../ui/organisms/signup-form/signup-form';
import { NbAuthTemplate } from '../../ui/templates/auth-template/auth-template';
import { CadastroFacade } from './cadastro.facade';

/** Página Cadastro: uma tela, sem etapas (U-01.1). */
@Component({
  selector: 'nb-cadastro-page',
  imports: [NbAuthTemplate, NbSignupForm, RouterLink],
  providers: [CadastroFacade],
  template: `
    <nb-auth-template titulo="Criar sua conta" subtitulo="Leva menos de 1 minuto.">
      <nb-signup-form [carregando]="f.carregando()" [erro]="f.erro()" (cadastrar)="f.cadastrar($event)" />
      <p rodape class="text-muted">Já tem uma conta?
        <a routerLink="/entrar" class="inline-flex min-h-11 items-center font-bold text-brand-ink">Entrar</a>
      </p>
    </nb-auth-template>
  `,
})
export class CadastroPage {
  protected readonly f = inject(CadastroFacade);
}
