import { Component, computed, input } from '@angular/core';
import { checarSenha } from '../../../core/calculos/senha';
import { NbIcon } from '../../atoms/icon/icon';

/** Molécula: checks ao vivo da força da senha (R-01.2, U-01.2). */
@Component({
  selector: 'nb-password-checks',
  imports: [NbIcon],
  template: `
    <div class="mb-2 grid grid-cols-3 gap-1.5" aria-hidden="true">
      @for (ok of barras(); track $index) {
        <span class="h-1.5 rounded-full" [class]="ok ? 'bg-brand' : 'bg-line'"></span>
      }
    </div>
    <ul class="flex flex-wrap gap-2" aria-live="polite">
      @for (item of itens(); track item.rotulo) {
        <li class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
          [class]="item.ok ? 'bg-brand-light text-brand-ink' : 'bg-line text-ink/75'" [attr.data-ok]="item.ok">
          <nb-icon [nome]="item.ok ? 'circle-check' : 'circle'" [tamanho]="14" />
          {{ item.rotulo }}<span class="sr-only">{{ item.ok ? ': ok' : ': pendente' }}</span>
        </li>
      }
    </ul>
  `,
  host: { class: 'block' },
})
export class NbPasswordChecks {
  readonly senha = input.required<string>();
  private readonly check = computed(() => checarSenha(this.senha()));
  protected readonly itens = computed(() => [
    { rotulo: '8+ caracteres', ok: this.check().oitoMais },
    { rotulo: '1 número', ok: this.check().numero },
    { rotulo: '1 símbolo', ok: this.check().simbolo },
  ]);
  protected readonly barras = computed(() => {
    const n = this.itens().filter((i) => i.ok).length;
    return [n >= 1, n >= 2, n >= 3];
  });
}
