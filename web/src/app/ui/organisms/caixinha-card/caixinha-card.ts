import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatBRL } from '../../../core/formatacao/dinheiro';
import { formatPercentual } from '../../../core/formatacao/numero';
import { NbBadge } from '../../atoms/badge/badge';
import { NbButton } from '../../atoms/button/button';
import { NbIcon } from '../../atoms/icon/icon';
import { NbIconTile } from '../../atoms/icon-tile/icon-tile';
import { NbProgressBar } from '../../atoms/progress-bar/progress-bar';
import { NbValor } from '../../atoms/valor/valor';
import { NbGoalSuggestion } from '../../molecules/goal-suggestion/goal-suggestion';
import { CaixinhaCardVM } from '../../modelos';

/**
 * Organismo: card de caixinha. `resumo` é a versão do painel (R-03.5); `completo` é a da lista,
 * com prazo e "Guardar +" a um toque (R-04.2, U-04.3). O nome é o link para o detalhe.
 */
@Component({
  selector: 'nb-caixinha-card',
  imports: [NbBadge, NbButton, NbGoalSuggestion, NbIcon, NbIconTile, NbProgressBar, NbValor, RouterLink],
  template: `
    <div class="flex items-center gap-3">
      <nb-icon-tile [icone]="c().icone" [tamanho]="variante() === 'resumo' ? 'md' : 'lg'"
        [fundo]="atingida() ? 'var(--color-gold)' : 'var(--color-brand-light)'"
        [cor]="atingida() ? 'var(--color-gold-ink)' : 'var(--color-brand-ink)'" />
      <div class="min-w-0 flex-1">
        @if (atingida()) { <nb-badge variante="ouro">Meta atingida</nb-badge> }
        <a [routerLink]="['/caixinhas', c().id]" class="block truncate font-display text-lg font-bold hover:underline">{{ c().nome }}</a>
        @if (variante() === 'resumo') { <p class="text-sm text-muted">Meta: {{ meta() }}</p> }
      </div>
      @if (variante() === 'resumo') { <nb-badge [variante]="atingida() ? 'ouro' : 'marca'">{{ pct() }}</nb-badge> }
    </div>

    @if (variante() === 'completo') {
      <div class="mt-4 flex items-baseline justify-between text-sm">
        <span><nb-valor [centavos]="c().guardadoCentavos" tamanho="sm" [oculto]="oculto()" class="font-semibold" />
          <span class="text-muted"> de {{ meta() }}</span></span>
        <span class="font-bold text-brand-ink">{{ pct() }}</span>
      </div>
    }
    <nb-progress-bar class="mt-2" [valor]="c().progresso" [variante]="atingida() ? 'ouro' : 'marca'"
      [rotulo]="'Progresso de ' + c().nome" />

    @if (variante() === 'resumo') {
      <div class="mt-3 flex items-center justify-between text-sm">
        <span class="text-muted">Guardado</span>
        <nb-valor [centavos]="c().guardadoCentavos" tamanho="sm" [oculto]="oculto()" class="font-bold" />
      </div>
    } @else {
      <p class="mt-3 flex items-center gap-1.5 text-sm text-muted">
        <nb-icon nome="calendar" [tamanho]="16" />Prazo: até {{ c().prazoRotulo }}
      </p>
      @switch (c().estado) {
        @case ('ativa') {
          @if (c().sugeridoCentavos; as s) {
            <nb-goal-suggestion class="mt-3" [sugeridoCentavos]="s" [nomeCaixinha]="c().nome" (guardar)="guardar.emit(c().id)" />
          }
        }
        @case ('prazo_encerrado') {
          <div class="mt-3 flex items-center justify-between gap-2 rounded-box bg-canvas px-3 py-2">
            <p class="text-sm">Prazo encerrado. Faltam {{ faltam() }}.</p>
            <button nb-button variante="secundario" tamanho="sm" [attr.aria-label]="'Guardar em ' + c().nome"
              (click)="guardar.emit(c().id)">Guardar +</button>
          </div>
        }
        @case ('atingida') {
          <button nb-button variante="ouro" [larguraTotal]="true" class="mt-3" (click)="retirar.emit(c().id)">
            <nb-icon nome="wallet" [tamanho]="18" />Retirar
          </button>
        }
      }
    }
  `,
  host: {
    '[class]': `"block rounded-card p-5 shadow-n1 " + (atingida() && variante() === 'completo' ? "bg-gradient-to-br from-[#FFF8E6] to-surface" : "bg-surface")`,
  },
})
export class NbCaixinhaCard {
  readonly caixinha = input.required<CaixinhaCardVM>();
  readonly variante = input<'resumo' | 'completo'>('completo');
  readonly oculto = input(false);
  readonly guardar = output<string>();
  readonly retirar = output<string>();

  protected readonly c = this.caixinha;
  protected readonly atingida = computed(() => this.c().estado === 'atingida');
  protected readonly pct = computed(() => formatPercentual(this.c().percentual));
  protected readonly meta = computed(() => formatBRL(this.c().metaCentavos));
  protected readonly faltam = computed(() => formatBRL(this.c().faltamCentavos));
}
