import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NbAvatar } from '../../atoms/avatar/avatar';
import { NbLogo } from '../../atoms/logo/logo';

/** Organismo: topo do app com logo e atalho para o perfil. Sem sino: notificações fora do escopo. */
@Component({
  selector: 'nb-app-header',
  imports: [NbAvatar, NbLogo, RouterLink],
  template: `
    <a routerLink="/inicio" class="inline-flex min-h-11 items-center rounded-full"><nb-logo /></a>
    <a routerLink="/perfil" class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full"
      [attr.aria-label]="'Perfil de ' + nome()">
      <nb-avatar [nome]="nome()" aria-hidden="true" />
    </a>
  `,
  host: { class: 'flex items-center justify-between px-5 py-2' },
})
export class NbAppHeader {
  readonly nome = input.required<string>();
}
