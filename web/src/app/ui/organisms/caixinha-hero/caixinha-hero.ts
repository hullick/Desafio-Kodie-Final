import { Component, computed, input } from '@angular/core';
import { formatBRL } from '../../../core/formatacao/dinheiro';
import { formatPercentual } from '../../../core/formatacao/numero';
import { NbBadge } from '../../atoms/badge/badge';
import { NbIconTile } from '../../atoms/icon-tile/icon-tile';
import { NbProgressRing } from '../../atoms/progress-ring/progress-ring';
import { NbValor } from '../../atoms/valor/valor';
import { NbInfoTile } from '../../molecules/info-tile/info-tile';
import { CaixinhaCardVM } from '../../modelos';

const ESTADO: Record<CaixinhaCardVM['estado'], string> = {
  ativa: 'Meta ativa',
  atingida: 'Meta atingida',
  prazo_encerrado: 'Prazo encerrado',
};

/** Organismo: topo do detalhe da caixinha com anel, saldo, "Faltam" e os cards de prazo e meta mensal (R-04.4). */
@Component({
  selector: 'nb-caixinha-hero',
  imports: [NbBadge, NbIconTile, NbInfoTile, NbProgressRing, NbValor],
  template: `
    <div class="flex flex-col items-center text-center">
      <nb-icon-tile [icone]="c().icone" tamanho="xl" />
      <h2 class="mt-3 font-display text-2xl font-bold">{{ c().nome }}</h2>
      <nb-badge class="mt-2" [variante]="c().estado === 'atingida' ? 'ouro' : 'marca'">{{ estado() }} • {{ pct() }} concluída</nb-badge>
    </div>

    <div class="mt-5 flex flex-col items-center rounded-card bg-surface p-6 shadow-n1">
      <nb-progress-ring [valor]="c().progresso" [rotulo]="'Progresso de ' + c().nome" [variante]="c().estado === 'atingida' ? 'ouro' : 'marca'">
        <span class="font-display text-4xl font-extrabold tabular">{{ pct() }}</span>
        <span class="text-xs font-bold uppercase tracking-widest text-muted">concluído</span>
      </nb-progress-ring>
      <p class="mt-4 text-sm text-muted">Saldo acumulado</p>
      <p class="flex items-baseline gap-2">
        <nb-valor [centavos]="c().guardadoCentavos" tamanho="xl" />
        <span class="text-sm text-muted">de {{ meta() }}</span>
      </p>
      @if (c().faltamCentavos > 0) {
        <p class="mt-2 rounded-full bg-canvas px-3 py-1 text-sm">Faltam <strong class="text-brand-ink">{{ faltam() }}</strong> para a meta</p>
      }
    </div>

    <div class="mt-4 grid grid-cols-2 gap-3">
      <nb-info-tile icone="calendar" rotulo="Prazo final" [valor]="c().prazoRotulo" [detalhe]="detalhePrazo()" />
      <nb-info-tile icone="banknote" rotulo="Meta mensal" [valor]="mensal()" [detalhe]="c().sugeridoCentavos ? 'por mês sugerido' : ''" />
    </div>
  `,
  host: { class: 'block' },
})
export class NbCaixinhaHero {
  readonly caixinha = input.required<CaixinhaCardVM>();
  readonly mesesRestantes = input.required<number>();

  protected readonly c = this.caixinha;
  protected readonly estado = computed(() => ESTADO[this.c().estado]);
  protected readonly pct = computed(() => formatPercentual(this.c().percentual));
  protected readonly meta = computed(() => formatBRL(this.c().metaCentavos));
  protected readonly faltam = computed(() => formatBRL(this.c().faltamCentavos));
  protected readonly mensal = computed(() => {
    const s = this.c().sugeridoCentavos;
    return s ? formatBRL(s) : this.c().estado === 'atingida' ? 'Concluída' : '—';
  });
  protected readonly detalhePrazo = computed(() => {
    const n = this.mesesRestantes();
    return n === 0 ? 'Prazo encerrado' : n === 1 ? 'Falta 1 mês' : `Faltam ${n} meses`;
  });
}
