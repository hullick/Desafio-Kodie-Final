import { Component, computed, input, output, signal } from '@angular/core';
import { checarSenha, emailValido, nomeValido } from '../../../core/calculos/senha';
import { NbButton } from '../../atoms/button/button';
import { NbCheckbox } from '../../atoms/checkbox/checkbox';
import { NbIcon } from '../../atoms/icon/icon';
import { NbInput } from '../../atoms/input/input';
import { NbFormField } from '../../molecules/form-field/form-field';
import { NbPasswordChecks } from '../../molecules/password-checks/password-checks';
import { NbPasswordInput } from '../../molecules/password-input/password-input';

export interface DadosCadastro {
  readonly nome: string;
  readonly email: string;
  readonly senha: string;
}

type Campo = 'nome' | 'email' | 'senha' | 'confirmacao';

/** Organismo: cadastro em uma tela, 4 campos e 1 aceite (R-01.1 a R-01.3, U-01.1 a U-01.4). */
@Component({
  selector: 'nb-signup-form',
  imports: [NbButton, NbCheckbox, NbFormField, NbIcon, NbInput, NbPasswordChecks, NbPasswordInput],
  template: `
    <form class="space-y-4" novalidate (submit)="$event.preventDefault(); enviar()">
      <nb-form-field rotulo="Como prefere ser chamado(a)?" [erro]="erros().nome">
        <input nbInput autocomplete="given-name" maxlength="40" placeholder="Seu nome"
          [value]="nome()" (input)="nome.set($any($event.target).value)" (blur)="tocar('nome')" />
      </nb-form-field>
      <nb-form-field rotulo="E-mail" [erro]="erros().email">
        <input nbInput type="email" autocomplete="email" inputmode="email" placeholder="seuemail@exemplo.com"
          [value]="email()" (input)="email.set($any($event.target).value)" (blur)="tocar('email')" />
      </nb-form-field>
      <nb-form-field rotulo="Criar senha" [erro]="erros().senha">
        <nb-password-input [(valor)]="senha" autocomplete="new-password" placeholder="Mínimo de 8 caracteres" (tocado)="tocar('senha')" />
      </nb-form-field>
      <nb-password-checks [senha]="senha()" />
      <nb-form-field rotulo="Confirmar senha" [erro]="erros().confirmacao">
        <nb-password-input [(valor)]="confirmacao" autocomplete="new-password" placeholder="Repita a mesma senha" (tocado)="tocar('confirmacao')" />
      </nb-form-field>
      <label class="flex items-start gap-3 text-sm">
        <input type="checkbox" nbCheckbox [checked]="aceite()" (change)="aceite.set($any($event.target).checked)" />
        <span>Li e concordo com os <a href="/privacidade" target="_blank" class="font-semibold text-brand-ink underline">Termos de Uso</a>
          e a <a href="/privacidade" target="_blank" class="font-semibold text-brand-ink underline">Política de Privacidade</a> do NuBanko.</span>
      </label>
      <div aria-live="assertive">
        @if (erro(); as e) { <p class="flex items-center gap-1 text-sm text-neg-ink"><nb-icon nome="circle-alert" [tamanho]="16" />{{ e }}</p> }
      </div>
      <button nb-button type="submit" [larguraTotal]="true" [disabled]="!valido() || carregando()">
        {{ carregando() ? 'Criando conta…' : 'Criar conta' }}
      </button>
    </form>
  `,
  host: { class: 'block' },
})
export class NbSignupForm {
  readonly carregando = input(false);
  readonly erro = input<string | null>(null);
  readonly cadastrar = output<DadosCadastro>();

  protected readonly nome = signal('');
  protected readonly email = signal('');
  protected readonly senha = signal('');
  protected readonly confirmacao = signal('');
  protected readonly aceite = signal(false);
  private readonly tocados = signal<ReadonlySet<Campo>>(new Set());

  private readonly validos = computed(() => ({
    nome: nomeValido(this.nome()),
    email: emailValido(this.email()),
    senha: checarSenha(this.senha()).valida,
    confirmacao: this.confirmacao().length > 0 && this.confirmacao() === this.senha(),
  }));

  protected readonly erros = computed(() => {
    const v = this.validos();
    const t = this.tocados();
    const se = (c: Campo, msg: string) => (t.has(c) && !v[c] ? msg : null);
    return {
      nome: se('nome', 'Use de 2 a 40 caracteres.'),
      email: se('email', 'Digite um e-mail válido, como nome@exemplo.com.'),
      senha: se('senha', 'A senha precisa de 8 caracteres, 1 número e 1 símbolo.'),
      confirmacao: se('confirmacao', 'As senhas não são iguais.'),
    };
  });

  protected readonly valido = computed(() => Object.values(this.validos()).every(Boolean) && this.aceite());

  protected tocar(c: Campo): void {
    this.tocados.update((s) => new Set(s).add(c));
  }

  protected enviar(): void {
    if (this.valido()) this.cadastrar.emit({ nome: this.nome().trim(), email: this.email().trim(), senha: this.senha() });
  }
}
