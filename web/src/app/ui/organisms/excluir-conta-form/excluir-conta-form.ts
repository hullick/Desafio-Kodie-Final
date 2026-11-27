import { Component, computed, input, output, signal } from '@angular/core';
import { NbButton } from '../../atoms/button/button';
import { NbIcon } from '../../atoms/icon/icon';
import { NbInput } from '../../atoms/input/input';
import { NbFormField } from '../../molecules/form-field/form-field';
import { NbPasswordInput } from '../../molecules/password-input/password-input';

export const PALAVRA_EXCLUIR = 'EXCLUIR';

/**
 * Organismo: exclusão definitiva da conta (R-05.6). Explica o que acontece e só libera o botão
 * com a palavra EXCLUIR digitada exatamente (maiúsculas) e a senha preenchida (U-05.2).
 */
@Component({
  selector: 'nb-excluir-conta-form',
  imports: [NbButton, NbFormField, NbIcon, NbInput, NbPasswordInput],
  template: `
    <section class="rounded-card border-2 border-neg/40 bg-surface p-5" aria-labelledby="titulo-aviso-exclusao">
      <h2 id="titulo-aviso-exclusao" class="flex items-center gap-2 font-display text-lg font-bold text-neg-ink">
        <nb-icon nome="circle-alert" />Isso não pode ser desfeito
      </h2>
      <p class="mt-2 text-sm">Vamos apagar de vez sua conta e tudo o que está nela:</p>
      <ul class="mt-2 list-disc space-y-1 pl-5 text-sm">
        <li>seus lançamentos e caixinhas, com todo o histórico;</li>
        <li>seu nome, e-mail e senha;</li>
        <li>as sessões abertas em todos os aparelhos.</li>
      </ul>
    </section>
    <form class="mt-6 space-y-4" novalidate (submit)="$event.preventDefault(); enviar()">
      <nb-form-field [rotulo]="'Para confirmar, digite ' + palavra" dica="Em letras maiúsculas.">
        <input nbInput autocomplete="off" autocapitalize="characters" spellcheck="false"
          [value]="confirmacao()" (input)="confirmacao.set($any($event.target).value)" />
      </nb-form-field>
      <nb-form-field rotulo="Sua senha">
        <nb-password-input [(valor)]="senha" autocomplete="current-password" />
      </nb-form-field>
      <div aria-live="assertive">
        @if (erro(); as e) { <p class="flex items-center gap-1 text-sm text-neg-ink"><nb-icon nome="circle-alert" [tamanho]="16" />{{ e }}</p> }
      </div>
      <button nb-button type="submit" variante="perigo" [larguraTotal]="true" [disabled]="!valido() || carregando()">
        {{ carregando() ? 'Excluindo…' : 'Excluir minha conta' }}
      </button>
    </form>
  `,
  host: { class: 'block' },
})
export class NbExcluirContaForm {
  readonly carregando = input(false);
  readonly erro = input<string | null>(null);
  readonly excluir = output<string>();

  protected readonly palavra = PALAVRA_EXCLUIR;
  protected readonly confirmacao = signal('');
  protected readonly senha = signal('');
  protected readonly valido = computed(() => this.confirmacao().trim() === PALAVRA_EXCLUIR && this.senha().length > 0);

  protected enviar(): void {
    if (this.valido()) this.excluir.emit(this.senha());
  }
}
