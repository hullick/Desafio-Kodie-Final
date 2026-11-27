import { Component, input } from '@angular/core';

/** Átomo: bloco de carregamento (decorativo). */
@Component({
  selector: 'nb-skeleton',
  template: '',
  host: {
    'aria-hidden': 'true',
    '[class]': '"block animate-pulse bg-line " + forma()',
  },
})
export class NbSkeleton {
  readonly forma = input('h-4 w-full rounded-full');
}
