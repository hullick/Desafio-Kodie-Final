import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NbIconButton } from '../../atoms/icon-button/icon-button';

/**
 * Template: tela interna com voltar, título e ações à direita.
 * Slots: [acoes], conteúdo padrão.
 */
@Component({
  selector: 'nb-detail-template',
  imports: [NbIconButton, RouterLink],
  template: `
    <div class="grid grid-cols-[3rem_1fr_3rem] items-center gap-2 py-2">
      <a nb-icon-button variante="suave" icone="arrow-left" [rotulo]="'Voltar para ' + rotuloVoltar()" [routerLink]="voltarPara()"></a>
      <div class="text-center">
        @if (sobretitulo()) { <p class="text-xs font-bold uppercase tracking-widest text-brand-ink">{{ sobretitulo() }}</p> }
        <h1 class="font-display text-lg font-bold">{{ titulo() }}</h1>
      </div>
      <div class="flex justify-end"><ng-content select="[acoes]" /></div>
    </div>
    <div class="mt-2"><ng-content /></div>
  `,
  host: { class: 'block' },
})
export class NbDetailTemplate {
  readonly titulo = input.required<string>();
  readonly voltarPara = input.required<string>();
  readonly rotuloVoltar = input('a tela anterior');
  readonly sobretitulo = input('');
}
