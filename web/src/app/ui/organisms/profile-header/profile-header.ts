import { Component, input } from '@angular/core';
import { NbAvatar } from '../../atoms/avatar/avatar';

/** Organismo: topo do perfil com iniciais, nome, e-mail e data real do cadastro (R-05.1). */
@Component({
  selector: 'nb-profile-header',
  imports: [NbAvatar],
  template: `
    <nb-avatar [nome]="nome()" tamanho="xl" aria-hidden="true" />
    <h1 class="mt-4 font-display text-2xl font-bold">{{ nome() }}</h1>
    <p class="text-sm text-muted">{{ email() }}</p>
    <p class="mt-2 rounded-full bg-brand-light px-3 py-1 text-sm font-semibold text-brand-ink">No NuBanko desde {{ desde() }}</p>
  `,
  host: { class: 'flex flex-col items-center text-center' },
})
export class NbProfileHeader {
  readonly nome = input.required<string>();
  readonly email = input.required<string>();
  readonly desde = input.required<string>();
}
