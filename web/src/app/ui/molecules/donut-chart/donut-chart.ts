import { Component, computed, input } from '@angular/core';
import { formatPercentualFixo } from '../../../core/formatacao/numero';

export interface FatiaDonut {
  readonly rotulo: string;
  readonly valor: number;
  readonly cor: string;
  readonly percentual: number;
}

const RAIO = 15.9155; // circunferência = 100: dasharray em "percentual"

/**
 * Molécula: rosca SVG acessível (R-03.4, U-03.3). Círculos com dasharray, sem arcos:
 * 100% renderiza o anel completo. O texto alternativo lista rótulos e percentuais.
 */
@Component({
  selector: 'nb-donut-chart',
  template: `
    <svg viewBox="0 0 42 42" class="size-full -rotate-90" aria-hidden="true">
      <circle cx="21" cy="21" [attr.r]="raio" fill="none" stroke="var(--color-line)" stroke-width="6" />
      @for (s of segmentos(); track s.rotulo) {
        <circle data-fatia cx="21" cy="21" [attr.r]="raio" fill="none" [attr.stroke]="s.cor" stroke-width="6"
          [attr.stroke-dasharray]="s.traco + ' ' + (100 - s.traco)" [attr.stroke-dashoffset]="s.offset" />
      }
    </svg>
    <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
      <span class="text-[10px] font-bold uppercase tracking-widest text-muted">{{ tituloCentro() }}</span>
      <span class="font-display text-xl font-extrabold tabular">{{ valorCentro() }}</span>
      <span class="text-xs text-muted">{{ legendaCentro() }}</span>
    </div>
  `,
  host: { class: 'relative block size-44', role: 'img', '[attr.aria-label]': 'alternativo()' },
})
export class NbDonutChart {
  readonly fatias = input.required<readonly FatiaDonut[]>();
  readonly tituloCentro = input('Total');
  readonly valorCentro = input('');
  readonly legendaCentro = input('');
  readonly rotulo = input('Gastos por categoria');
  protected readonly raio = RAIO;

  protected readonly segmentos = computed(() => {
    let acumulado = 0;
    return this.fatias().map((f) => {
      const seg = { rotulo: f.rotulo, cor: f.cor, traco: f.percentual, offset: -acumulado };
      acumulado += f.percentual;
      return seg;
    });
  });

  protected readonly alternativo = computed(() =>
    `${this.rotulo()}: ${this.fatias().map((f) => `${f.rotulo} ${formatPercentualFixo(f.percentual)}`).join(', ')}`);
}
