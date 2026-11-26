import { Component, computed, input } from '@angular/core';
import { iniciais } from '../../../core/formatacao/texto';

/** Átomo: avatar com iniciais (sem foto na v1, ver divergências). */
@Component({
  selector: 'nb-avatar',
  template: `{{ letras() }}`,
  host: {
    role: 'img',
    '[attr.aria-label]': 'nome()',
    '[class]': 'classes()',
  },
})
export class NbAvatar {
  readonly nome = input.required<string>();
  readonly tamanho = input<'md' | 'xl'>('md');
  protected readonly letras = computed(() => iniciais(this.nome()));
  protected readonly classes = computed(() =>
    `inline-flex items-center justify-center rounded-full font-display font-bold bg-brand-light text-brand-ink ${
      this.tamanho() === 'xl' ? 'size-24 text-3xl shadow-n3' : 'size-10 text-sm'}`,
  );
}
