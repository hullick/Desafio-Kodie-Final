import { Component, input } from '@angular/core';
import { IconeNome } from '../../../core/dominio/icones';
import { NbIcon } from '../../atoms/icon/icon';
import { NbIconTile } from '../../atoms/icon-tile/icon-tile';

/** Molécula: item de menu de configurações (Perfil). */
@Component({
  selector: 'a[nb-settings-item], button[nb-settings-item]',
  imports: [NbIcon, NbIconTile],
  template: `
    <nb-icon-tile [icone]="icone()" [fundo]="perigo() ? '#FDEEEE' : 'var(--color-canvas)'"
      [cor]="perigo() ? 'var(--color-neg-ink)' : 'var(--color-ink)'" />
    <span class="min-w-0 flex-1 text-left">
      <span class="block text-[15px] font-semibold" [class.text-neg-ink]="perigo()">{{ titulo() }}</span>
      @if (subtitulo()) { <span class="block text-xs text-muted">{{ subtitulo() }}</span> }
    </span>
    <nb-icon nome="chevron-right" class="text-muted" />
  `,
  host: { class: 'flex w-full min-h-16 items-center gap-3 px-4 py-3 transition hover:bg-canvas' },
})
export class NbSettingsItem {
  readonly icone = input.required<IconeNome>();
  readonly titulo = input.required<string>();
  readonly subtitulo = input<string | null>(null);
  readonly perigo = input(false);
}
