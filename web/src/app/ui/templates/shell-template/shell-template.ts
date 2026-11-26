import { Component } from '@angular/core';

/**
 * Template: esqueleto das abas logadas. Topo fixo, conteúdo rolável com espaço para a
 * navegação inferior, navegação na zona do polegar e camada de sobreposição (sheets, toast).
 * Slots: [topo], conteúdo padrão, [navegacao], [sobreposicao].
 */
@Component({
  selector: 'nb-shell-template',
  template: `
    <a href="#conteudo" class="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2">
      Pular para o conteúdo
    </a>
    <header class="sticky top-0 z-20 bg-canvas/90 backdrop-blur"><div class="mx-auto max-w-md"><ng-content select="[topo]" /></div></header>
    <main id="conteudo" tabindex="-1" class="mx-auto w-full max-w-md flex-1 px-5 pb-32 pt-2 outline-none"><ng-content /></main>
    <div class="fixed inset-x-0 bottom-0 z-30"><ng-content select="[navegacao]" /></div>
    <ng-content select="[sobreposicao]" />
  `,
  host: { class: 'flex min-h-dvh flex-col bg-canvas text-ink' },
})
export class NbShellTemplate {}
