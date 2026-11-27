import { Component, computed, input, output, signal } from '@angular/core';
import { checarSenha } from '../../../core/calculos/senha';
import { NbButton } from '../../atoms/button/button';
import { NbIcon } from '../../atoms/icon/icon';
import { NbFormField } from '../../molecules/form-field/form-field';
import { NbPasswordChecks } from '../../molecules/password-checks/password-checks';
import { NbPasswordInput } from '../../molecules/password-input/password-input';

export interface TrocaDeSenha {
  /** Só quando `pedirAtual` (alterar senha logado). */
  readonly atual: string;
  readonly nova: string;
}

type Campo = 'atual' | 'nova' | 'confirmacao';

/**
 * Organismo: nova senha com a regra R-01.2 ao vivo e confirmação. Com `pedirAtual`, pede
 * também a senha atual (alterar senha, R-05.3); sem ele, serve para a redefinição (R-01.8).
 */
@Component({
  selector: 'nb-senha-form',
  imports: [NbButton, NbFormField, NbIcon, NbPasswordChecks, NbPasswordInput],
  template: `
    <form class="space-y-4" novalidate (submit)="$event.preventDefault(); enviar()">
      @if (pedirAtual()) {
        <nb-form-field rotulo="Senha atual" [erro]="erros().atual">
          <nb-password-input [(valor)]="atual" autocomplete="current-password" (tocado)="tocar('atual')" />
        </nb-form-field>
      }
      <nb-form-field rotulo="Nova senha" [erro]="erros().nova">
        <nb-password-input [(valor)]="nova" autocomplete="new-password" placeholder="Mínimo de 8 caracteres" (tocado)="tocar('nova')" />
      </nb-form-field>
      <nb-password-checks [senha]="nova()" />
      <nb-form-field rotulo="Confirmar nova senha" [erro]="erros().confirmacao">
        <nb-password-input [(valor)]="confirmacao" autocomplete="new-password" placeholder="Repita a nova senha" (tocado)="tocar('confirmacao')" />
      </nb-form-field>
      <div aria-live="assertive">
        @if (erro(); as e) { <p class="flex items-center gap-1 text-sm text-neg-ink"><nb-icon nome="circle-alert" [tamanho]="16" />{{ e }}</p> }
      </div>
      <button nb-button type="submit" [larguraTotal]="true" [disabled]="!valido() || carregando()">
        {{ carregando() ? 'Salvando…' : rotuloBotao() }}
      </button>
    </form>
  `,
  host: { class: 'block' },
})
export class NbSenhaForm {
  readonly pedirAtual = input(false);
  readonly carregando = input(false);
  readonly erro = input<string | null>(null);
  readonly rotuloBotao = input('Salvar nova senha');
  readonly salvar = output<TrocaDeSenha>();

  protected readonly atual = signal('');
  protected readonly nova = signal('');
  protected readonly confirmacao = signal('');
  private readonly tocados = signal<ReadonlySet<Campo>>(new Set());

  private readonly validos = computed(() => ({
    atual: !this.pedirAtual() || this.atual().length > 0,
    nova: checarSenha(this.nova()).valida,
    confirmacao: this.confirmacao().length > 0 && this.confirmacao() === this.nova(),
  }));

  protected readonly erros = computed(() => {
    const v = this.validos();
    const t = this.tocados();
    const se = (c: Campo, msg: string) => (t.has(c) && !v[c] ? msg : null);
    return {
      atual: se('atual', 'Digite sua senha atual.'),
      nova: se('nova', 'A senha precisa de 8 caracteres, 1 número e 1 símbolo.'),
      confirmacao: se('confirmacao', 'As senhas não são iguais.'),
    };
  });

  protected readonly valido = computed(() => Object.values(this.validos()).every(Boolean));

  protected tocar(c: Campo): void {
    this.tocados.update((s) => new Set(s).add(c));
  }

  protected enviar(): void {
    if (this.valido()) this.salvar.emit({ atual: this.pedirAtual() ? this.atual() : '', nova: this.nova() });
  }
}
