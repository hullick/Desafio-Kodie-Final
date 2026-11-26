import { Component, computed, input, output, signal } from '@angular/core';
import { Tecla, teclar } from '../../../core/calculos/teclado';
import { NovoMovimento, TipoMovimento } from '../../../core/dominio/tipos';
import { formatBRL } from '../../../core/formatacao/dinheiro';
import { hojeISO } from '../../../core/tempo/mes';
import { NbButton } from '../../atoms/button/button';
import { NbIcon } from '../../atoms/icon/icon';
import { NbAmountDisplay } from '../../molecules/amount-display/amount-display';
import { NbDateChip } from '../../molecules/date-chip/date-chip';
import { NbKeypad } from '../../molecules/keypad/keypad';

/** Organismo: guardar ou retirar de uma caixinha (R-04.5, U-04.4). */
@Component({
  selector: 'nb-movimento-form',
  imports: [NbAmountDisplay, NbButton, NbDateChip, NbIcon, NbKeypad],
  template: `
    <h2 class="text-center font-display text-lg font-bold">{{ titulo() }}</h2>
    <p class="text-center text-sm text-muted">Você tem {{ saldo() }} nesta caixinha</p>
    <nb-amount-display class="my-5" [centavos]="centavos()" />
    <div class="flex justify-center"><nb-date-chip [(data)]="data" rotuloAcessivel="Data do movimento" /></div>
    <nb-keypad class="mt-3" [capturarTeclado]="true" (tecla)="aoTeclar($event)" />
    <div aria-live="assertive">
      @if (mensagem(); as e) { <p class="mt-2 flex items-center gap-1 text-sm text-neg-ink"><nb-icon nome="circle-alert" [tamanho]="16" />{{ e }}</p> }
    </div>
    <button nb-button [larguraTotal]="true" class="mt-3" [disabled]="!podeSalvar() || salvando()" (click)="enviar()">
      {{ salvando() ? 'Salvando…' : tipo() === 'guardar' ? 'Guardar' : 'Retirar' }}
    </button>
  `,
  host: { class: 'block' },
})
export class NbMovimentoForm {
  readonly tipo = input.required<TipoMovimento>();
  readonly nomeCaixinha = input.required<string>();
  readonly saldoCentavos = input.required<number>();
  readonly salvando = input(false);
  readonly erro = input<string | null>(null);
  readonly salvar = output<NovoMovimento>();

  protected readonly centavos = signal(0);
  protected readonly data = signal(hojeISO());
  protected readonly saldo = computed(() => formatBRL(this.saldoCentavos()));
  protected readonly titulo = computed(() =>
    this.tipo() === 'guardar' ? `Guardar em ${this.nomeCaixinha()}` : `Retirar de ${this.nomeCaixinha()}`);
  private readonly excede = computed(() => this.tipo() === 'retirar' && this.centavos() > this.saldoCentavos());
  protected readonly podeSalvar = computed(() => this.centavos() > 0 && !this.excede());
  protected readonly mensagem = computed(() =>
    this.excede() ? `Você tem ${this.saldo()} nesta caixinha. Retire até esse valor.` : this.erro());

  protected aoTeclar(t: Tecla): void {
    this.centavos.update((c) => teclar(c, t));
  }

  protected enviar(): void {
    if (this.podeSalvar()) this.salvar.emit({ tipo: this.tipo(), valorCentavos: this.centavos(), data: this.data() });
  }
}
