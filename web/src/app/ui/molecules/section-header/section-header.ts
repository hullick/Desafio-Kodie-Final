import { Component, input } from '@angular/core';

/** Molécula: título de seção + contador opcional + ação projetada à direita. */
@Component({
  selector: 'nb-section-header',
  template: `
    <h2 class="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
      {{ titulo() }}
      @if (contador() !== null) {
        <span class="rounded-full bg-line px-2 py-0.5 text-xs font-semibold text-muted">{{ contador() }}</span>
      }
    </h2>
    <ng-content />
  `,
  host: { class: 'flex items-center justify-between gap-2' },
})
export class NbSectionHeader {
  readonly titulo = input.required<string>();
  readonly contador = input<number | null>(null);
}
