import { Component, input } from '@angular/core';
import { IconeNome } from '../../../core/dominio/icones';
import { NbIcon } from '../../atoms/icon/icon';

/** Molécula: opção circular de ícone com rótulo (escolha de ícone da caixinha). */
@Component({
  selector: 'button[nb-icon-option]',
  imports: [NbIcon],
  template: `
    <span class="flex size-16 items-center justify-center rounded-full transition"
      [class]="selecionado() ? 'bg-brand text-ink shadow-n3' : 'bg-surface text-ink shadow-n1'">
      <nb-icon [nome]="icone()" [tamanho]="26" />
    </span>
    <span class="text-xs font-semibold" [class]="selecionado() ? 'text-brand-ink' : 'text-muted'">{{ rotulo() }}</span>
  `,
  host: { type: 'button', class: 'flex shrink-0 flex-col items-center gap-1.5', '[attr.aria-pressed]': 'selecionado()' },
})
export class NbIconOption {
  readonly icone = input.required<IconeNome>();
  readonly rotulo = input.required<string>();
  readonly selecionado = input(false);
}
