import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconeNome } from '../../../core/dominio/icones';
import { NbSettingsItem } from '../../molecules/settings-item/settings-item';

export interface ItemConfiguracaoVM {
  readonly icone: IconeNome;
  readonly titulo: string;
  readonly subtitulo: string;
  readonly rota: string;
}

/** Organismo: grupo de itens de configuração com título de seção. */
@Component({
  selector: 'nb-settings-group',
  imports: [NbSettingsItem, RouterLink],
  template: `
    <h2 class="mb-2 px-1 text-xs font-bold uppercase tracking-widest text-muted">{{ titulo() }}</h2>
    <ul class="divide-y divide-line overflow-hidden rounded-card bg-surface shadow-n1">
      @for (i of itens(); track i.rota) {
        <li><a nb-settings-item [routerLink]="i.rota" [icone]="i.icone" [titulo]="i.titulo" [subtitulo]="i.subtitulo"></a></li>
      }
    </ul>
  `,
  host: { class: 'block' },
})
export class NbSettingsGroup {
  readonly titulo = input.required<string>();
  readonly itens = input.required<readonly ItemConfiguracaoVM[]>();
}
