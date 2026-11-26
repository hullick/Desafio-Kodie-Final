import { Component, input } from '@angular/core';
import { NbIcon } from '../../atoms/icon/icon';
import { NbLogo } from '../../atoms/logo/logo';

/**
 * Template: telas de entrada (login, cadastro). Logo, título, formulário e rodapé.
 * Slots: conteúdo padrão (formulário), [rodape].
 */
@Component({
  selector: 'nb-auth-template',
  imports: [NbIcon, NbLogo],
  template: `
    <div class="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-6">
      <div class="flex justify-center"><nb-logo tamanho="lg" /></div>
      <h1 class="mt-8 font-display text-3xl font-extrabold tracking-tight">{{ titulo() }}</h1>
      @if (subtitulo()) { <p class="mt-2 text-muted">{{ subtitulo() }}</p> }
      <div class="mt-6"><ng-content /></div>
      <p class="mt-4 flex items-center justify-center gap-1.5 text-sm text-muted">
        <nb-icon nome="shield-check" [tamanho]="16" class="text-brand-ink" />Senha protegida e conexão segura (HTTPS)
      </p>
      <div class="mt-auto pt-8 text-center"><ng-content select="[rodape]" /></div>
    </div>
  `,
  host: { class: 'block bg-canvas text-ink' },
})
export class NbAuthTemplate {
  readonly titulo = input.required<string>();
  readonly subtitulo = input('');
}
