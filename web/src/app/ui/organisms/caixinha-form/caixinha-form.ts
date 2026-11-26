import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { calcularMeta } from '../../../core/calculos/meta';
import { ICONES_CAIXINHA } from '../../../core/dominio/icones-caixinha';
import { DadosCaixinha, IconeCaixinha } from '../../../core/dominio/tipos';
import { formatBRL } from '../../../core/formatacao/dinheiro';
import { Mes, mesAtual, somarMeses } from '../../../core/tempo/mes';
import { NbButton } from '../../atoms/button/button';
import { NbIcon } from '../../atoms/icon/icon';
import { NbInput } from '../../atoms/input/input';
import { NbProgressBar } from '../../atoms/progress-bar/progress-bar';
import { NbFormField } from '../../molecules/form-field/form-field';
import { NbIconOption } from '../../molecules/icon-option/icon-option';
import { NbMoneyInput } from '../../molecules/money-input/money-input';
import { NbMonthSelect } from '../../molecules/month-select/month-select';
import { NbQuickAmounts } from '../../molecules/quick-amounts/quick-amounts';

const MAX_NOME = 40;

/**
 * Organismo: criar/editar caixinha em uma tela com 4 decisões (R-04.3, U-04.1).
 * O sugerido por mês aparece ao vivo antes de criar (U-04.2).
 */
@Component({
  selector: 'nb-caixinha-form',
  imports: [NbButton, NbFormField, NbIcon, NbIconOption, NbInput, NbMoneyInput, NbMonthSelect, NbProgressBar, NbQuickAmounts],
  template: `
    <fieldset>
      <legend class="mb-3 text-sm font-semibold">Escolha um ícone para sua caixinha</legend>
      <div class="-mx-5 flex gap-4 overflow-x-auto px-5 pb-2">
        @for (o of icones; track o.id) {
          <button nb-icon-option [icone]="o.icone" [rotulo]="o.rotulo" [selecionado]="icone() === o.id" (click)="icone.set(o.id)"></button>
        }
      </div>
    </fieldset>

    <nb-form-field class="mt-5" rotulo="Nome do objetivo" [erro]="erroNome()">
      <input nbInput [attr.maxlength]="maxNome" placeholder="Ex.: Celular novo" autocomplete="off"
        [value]="nome()" (input)="nome.set($any($event.target).value)" (blur)="nomeTocado.set(true)" />
    </nb-form-field>

    <nb-form-field class="mt-5" rotulo="Quanto você deseja juntar?">
      <nb-money-input [(centavos)]="meta" />
    </nb-form-field>
    <nb-quick-amounts class="mt-3" (somar)="meta.set(meta() + $event)" />

    <nb-form-field class="mt-5" rotulo="Prazo para realizar">
      <nb-month-select [(valor)]="prazo" [de]="hoje()" [ate]="limite()" />
    </nb-form-field>

    <section class="mt-6 rounded-card bg-brand-light/60 p-5" aria-live="polite" aria-label="Plano sugerido">
      <h2 class="flex items-center gap-2 font-display text-lg font-bold"><nb-icon nome="lightbulb" class="text-brand-ink" />Plano sugerido</h2>
      @if (sugestao(); as s) {
        <p class="mt-2 flex items-baseline justify-between gap-2">
          <span class="text-sm">Guardar por mês</span>
          <span class="font-display text-xl font-extrabold text-brand-ink tabular">{{ s.valor }}/mês</span>
        </p>
        <nb-progress-bar class="mt-2" [valor]="s.progresso" rotulo="Quanto já foi guardado" />
        <p class="mt-2 text-sm text-muted">Guardando esse valor por {{ s.meses }} {{ s.meses === 1 ? 'mês' : 'meses' }}, você chega lá.</p>
      } @else {
        <p class="mt-2 text-sm text-muted">Informe o valor para ver quanto guardar por mês.</p>
      }
    </section>

    <button nb-button [larguraTotal]="true" class="mt-6" [disabled]="!valido() || salvando()" (click)="enviar()">
      {{ salvando() ? 'Salvando…' : inicial() ? 'Salvar alterações' : 'Criar caixinha' }}
    </button>
    <div aria-live="assertive">
      @if (erro(); as e) { <p class="mt-2 text-center text-sm text-neg-ink">{{ e }}</p> }
    </div>
  `,
  host: { class: 'block' },
})
export class NbCaixinhaForm {
  readonly inicial = input<DadosCaixinha | null>(null);
  /** Saldo atual, para o sugerido ao editar. Zero ao criar. */
  readonly saldoCentavos = input(0);
  readonly hoje = input<Mes>(mesAtual());
  readonly salvando = input(false);
  readonly erro = input<string | null>(null);
  readonly salvar = output<DadosCaixinha>();

  protected readonly icones = ICONES_CAIXINHA;
  protected readonly maxNome = MAX_NOME;
  protected readonly icone = linkedSignal<IconeCaixinha>(() => this.inicial()?.icone ?? 'aparelho');
  protected readonly nome = linkedSignal(() => this.inicial()?.nome ?? '');
  protected readonly meta = linkedSignal(() => this.inicial()?.metaCentavos ?? 0);
  protected readonly prazo = linkedSignal<Mes>(() => this.inicial()?.prazo ?? somarMeses(this.hoje(), 6));
  protected readonly nomeTocado = signal(false);

  protected readonly limite = computed(() => somarMeses(this.hoje(), 120));
  private readonly nomeOk = computed(() => this.nome().trim().length > 0);
  protected readonly erroNome = computed(() => (this.nomeTocado() && !this.nomeOk() ? 'Dê um nome para a caixinha.' : null));
  protected readonly valido = computed(() => this.nomeOk() && this.meta() > 0);

  protected readonly sugestao = computed(() => {
    if (this.meta() <= 0) return null;
    const c = calcularMeta({ metaCentavos: this.meta(), saldoCentavos: this.saldoCentavos(), prazo: this.prazo() }, this.hoje());
    if (c.sugeridoMensalCentavos === null) return null;
    return { valor: formatBRL(c.sugeridoMensalCentavos), meses: c.mesesRestantes, progresso: c.progresso };
  });

  protected enviar(): void {
    if (!this.valido()) return;
    this.salvar.emit({ nome: this.nome().trim(), icone: this.icone(), metaCentavos: this.meta(), prazo: this.prazo() });
  }
}
