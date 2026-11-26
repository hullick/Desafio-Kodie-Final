import { Component, computed, input } from '@angular/core';

/** Átomo: anel de progresso SVG com conteúdo central projetado. */
@Component({
  selector: 'nb-progress-ring',
  template: `
    <svg [attr.width]="tamanho()" [attr.height]="tamanho()" [attr.viewBox]="'0 0 ' + tamanho() + ' ' + tamanho()" class="-rotate-90">
      <circle [attr.cx]="centro()" [attr.cy]="centro()" [attr.r]="raio()" fill="none" stroke="var(--color-line)" [attr.stroke-width]="espessura()" />
      <circle data-progresso [attr.cx]="centro()" [attr.cy]="centro()" [attr.r]="raio()" fill="none"
        [attr.stroke]="variante() === 'ouro' ? 'var(--color-gold)' : 'var(--color-brand)'"
        [attr.stroke-width]="espessura()" stroke-linecap="round"
        [attr.stroke-dasharray]="circunferencia()" [attr.stroke-dashoffset]="deslocamento()"
        class="transition-[stroke-dashoffset] duration-700" />
    </svg>
    <div class="absolute inset-0 flex flex-col items-center justify-center text-center"><ng-content /></div>
  `,
  host: {
    class: 'relative inline-flex',
    role: 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    '[attr.aria-valuenow]': 'pct()',
    '[attr.aria-label]': 'rotulo()',
  },
})
export class NbProgressRing {
  readonly valor = input.required<number>();
  readonly rotulo = input.required<string>();
  readonly tamanho = input(176);
  readonly espessura = input(14);
  readonly variante = input<'marca' | 'ouro'>('marca');

  protected readonly centro = computed(() => this.tamanho() / 2);
  protected readonly raio = computed(() => (this.tamanho() - this.espessura()) / 2);
  protected readonly circunferencia = computed(() => 2 * Math.PI * this.raio());
  protected readonly pct = computed(() => Math.round(Math.min(1, Math.max(0, this.valor())) * 100));
  protected readonly deslocamento = computed(() => this.circunferencia() * (1 - this.pct() / 100));
}
