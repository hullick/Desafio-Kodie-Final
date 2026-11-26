import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { Tecla, teclar } from '../../../core/calculos/teclado';
import { categoriasDe } from '../../../core/dominio/categorias';
import { CategoriaId, NovoLancamento, TipoLancamento } from '../../../core/dominio/tipos';
import { hojeISO } from '../../../core/tempo/mes';
import { NbButton } from '../../atoms/button/button';
import { NbIcon } from '../../atoms/icon/icon';
import { NbInput } from '../../atoms/input/input';
import { NbAmountDisplay } from '../../molecules/amount-display/amount-display';
import { NbCategoryChip } from '../../molecules/category-chip/category-chip';
import { NbDateChip } from '../../molecules/date-chip/date-chip';
import { NbKeypad } from '../../molecules/keypad/keypad';
import { NbSegmented } from '../../molecules/segmented/segmented';
import { OpcaoVM } from '../../modelos';

const TIPOS: readonly OpcaoVM<TipoLancamento>[] = [
  { valor: 'gasto', rotulo: 'Gasto' },
  { valor: 'entrada', rotulo: 'Entrada' },
];

/**
 * Organismo: formulário de novo/editar lançamento (R-02.2 a R-02.10).
 * Guarda só o estado da tela; quem grava é o facade, via `salvar`.
 */
@Component({
  selector: 'nb-lancamento-form',
  imports: [NbAmountDisplay, NbButton, NbCategoryChip, NbDateChip, NbIcon, NbInput, NbKeypad, NbSegmented],
  template: `
    <h2 class="text-center text-xs font-bold uppercase tracking-widest text-ink/80">{{ inicial() ? 'Editar lançamento' : 'Novo lançamento' }}</h2>
    <div class="mt-3 flex justify-center">
      <nb-segmented [opcoes]="tipos" rotulo="Tipo do lançamento" [valor]="tipo()" (valorChange)="trocarTipo($event)" />
    </div>
    <nb-amount-display class="my-5" [centavos]="centavos()" [tom]="tipo()" />

    <div role="group" aria-label="Categoria" class="grid grid-cols-4 gap-2">
      @for (c of categorias(); track c.id) {
        <button nb-category-chip [icone]="c.icone" [rotulo]="c.rotulo" [selecionado]="categoria() === c.id"
          (click)="categoria.set(c.id)"></button>
      }
    </div>

    <div class="mt-3 flex gap-2">
      <label class="relative flex-1">
        <span class="sr-only">Descrição (opcional)</span>
        <nb-icon nome="pencil-line" [tamanho]="18" class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input nbInput class="bg-canvas pl-11" maxlength="60" placeholder="Adicionar descrição (opcional)"
          [value]="descricao()" (input)="descricao.set($any($event.target).value)" />
      </label>
      <nb-date-chip [(data)]="data" rotuloAcessivel="Data do lançamento" />
    </div>

    <nb-keypad class="mt-3" [capturarTeclado]="true" (tecla)="aoTeclar($event)" />

    <div aria-live="assertive">
      @if (erro(); as e) { <p class="mt-2 flex items-center gap-1 text-sm text-neg-ink"><nb-icon nome="circle-alert" [tamanho]="16" />{{ e }}</p> }
    </div>
    <button nb-button [larguraTotal]="true" class="mt-3" [disabled]="!podeSalvar() || salvando()" (click)="enviar()">
      {{ salvando() ? 'Salvando…' : 'Salvar' }}
    </button>

    @if (inicial()) {
      @if (confirmandoExclusao()) {
        <div class="mt-2 flex gap-2" role="group" aria-label="Confirmar exclusão">
          <button nb-button variante="fantasma" class="flex-1" (click)="confirmandoExclusao.set(false)">Cancelar</button>
          <button nb-button variante="perigo" class="flex-1" (click)="excluir.emit()">Excluir de vez</button>
        </div>
      } @else {
        <button nb-button variante="perigo" [larguraTotal]="true" class="mt-2" (click)="confirmandoExclusao.set(true)">
          <nb-icon nome="trash-2" [tamanho]="18" />Excluir
        </button>
      }
    }
  `,
  host: { class: 'block' },
})
export class NbLancamentoForm {
  /** Lançamento em edição; `null` para criar. */
  readonly inicial = input<NovoLancamento | null>(null);
  readonly salvando = input(false);
  readonly erro = input<string | null>(null);
  readonly salvar = output<NovoLancamento>();
  readonly excluir = output<void>();

  protected readonly tipos = TIPOS;
  protected readonly tipo = linkedSignal<TipoLancamento>(() => this.inicial()?.tipo ?? 'gasto');
  protected readonly centavos = linkedSignal(() => this.inicial()?.valorCentavos ?? 0);
  protected readonly categoria = linkedSignal<CategoriaId | null>(() => this.inicial()?.categoria ?? null);
  protected readonly descricao = linkedSignal(() => this.inicial()?.descricao ?? '');
  protected readonly data = linkedSignal(() => this.inicial()?.data ?? hojeISO());
  protected readonly confirmandoExclusao = signal(false);

  protected readonly categorias = computed(() => categoriasDe(this.tipo()));
  protected readonly podeSalvar = computed(() => this.centavos() > 0 && this.categoria() !== null);

  protected trocarTipo(t: TipoLancamento): void {
    if (t === this.tipo()) return;
    this.tipo.set(t);
    this.categoria.set(null);
  }

  protected aoTeclar(t: Tecla): void {
    this.centavos.update((c) => teclar(c, t));
  }

  protected enviar(): void {
    const categoria = this.categoria();
    if (!this.podeSalvar() || !categoria) return;
    this.salvar.emit({
      tipo: this.tipo(),
      valorCentavos: this.centavos(),
      categoria,
      descricao: this.descricao().trim() || null,
      data: this.data(),
    });
  }
}
