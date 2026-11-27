import { Component, input } from '@angular/core';

/** Átomo: logotipo "NuBanko." com o ponto em turquesa (resumo, identidade visual). */
@Component({
  selector: 'nb-logo',
  template: `<span class="font-display font-extrabold tracking-tight text-ink" [class]="tamanho() === 'lg' ? 'text-4xl' : 'text-xl'"
    >NuBanko<span class="text-brand">.</span></span
  >`,
  host: { role: 'img', 'aria-label': 'NuBanko' },
})
export class NbLogo {
  readonly tamanho = input<'md' | 'lg'>('md');
}
