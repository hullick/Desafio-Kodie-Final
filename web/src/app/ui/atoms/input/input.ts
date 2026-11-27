import { Directive, InjectionToken, Signal, computed, inject } from '@angular/core';

/** Contexto que um campo (molécula form-field) oferece ao input para ligar ids e ARIA. */
export interface ContextoCampo {
  readonly idCampo: Signal<string>;
  readonly idDescricao: Signal<string | null>;
  readonly invalido: Signal<boolean>;
}
export const CONTEXTO_CAMPO = new InjectionToken<ContextoCampo>('CONTEXTO_CAMPO');

/**
 * Átomo: estilo e acessibilidade de campos nativos.
 * Dentro de nb-form-field, recebe id, aria-describedby e aria-invalid automaticamente.
 */
@Directive({
  selector: 'input[nbInput], textarea[nbInput], select[nbInput]',
  host: {
    class:
      'w-full min-h-12 rounded-box bg-surface border border-line px-4 text-base text-ink placeholder:text-muted ' +
      'focus:outline-none focus:ring-2 focus:ring-brand aria-[invalid=true]:border-neg aria-[invalid=true]:ring-neg/40 ' +
      'disabled:opacity-60 read-only:bg-canvas',
    '[attr.id]': 'id()',
    '[attr.aria-describedby]': 'descricao()',
    '[attr.aria-invalid]': 'invalido()',
  },
})
export class NbInput {
  private readonly ctx = inject(CONTEXTO_CAMPO, { optional: true });
  protected readonly id = computed(() => this.ctx?.idCampo() ?? null);
  protected readonly descricao = computed(() => this.ctx?.idDescricao() ?? null);
  protected readonly invalido = computed(() => (this.ctx?.invalido() ? 'true' : null));
}
