import { Component, computed, input } from '@angular/core';
import { NbIcon } from '../../atoms/icon/icon';
import { CONTEXTO_CAMPO, ContextoCampo } from '../../atoms/input/input';

let seq = 0;

/**
 * Molécula: rótulo + campo + erro/dica.
 * Liga automaticamente id, aria-describedby e aria-invalid no input projetado (U-00.6).
 * Slot opcional `[campo-acao]` à direita do rótulo (ex.: "Esqueci a senha").
 */
@Component({
  selector: 'nb-form-field',
  imports: [NbIcon],
  providers: [{ provide: CONTEXTO_CAMPO, useExisting: NbFormField }],
  template: `
    <div class="mb-2 flex items-baseline justify-between gap-2">
      <label [attr.for]="idCampo()" class="text-sm font-semibold text-ink">{{ rotulo() }}</label>
      <ng-content select="[campo-acao]" />
    </div>
    <div class="relative"><ng-content /></div>
    <div aria-live="polite">
      @if (erro(); as e) {
        <p [id]="idCampo() + '-desc'" class="mt-1.5 flex items-center gap-1 text-sm text-neg-ink">
          <nb-icon nome="circle-alert" [tamanho]="16" />{{ e }}
        </p>
      } @else if (dica(); as d) {
        <p [id]="idCampo() + '-desc'" class="mt-1.5 text-sm text-muted">{{ d }}</p>
      }
    </div>
  `,
  host: { class: 'block' },
})
export class NbFormField implements ContextoCampo {
  readonly rotulo = input.required<string>();
  readonly erro = input<string | null>(null);
  readonly dica = input<string | null>(null);
  readonly id = input(`campo-${++seq}`);

  readonly idCampo = computed(() => this.id());
  readonly invalido = computed(() => !!this.erro());
  readonly idDescricao = computed(() => (this.erro() || this.dica() ? `${this.id()}-desc` : null));
}
