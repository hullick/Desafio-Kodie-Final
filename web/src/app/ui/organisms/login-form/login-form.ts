import { Component, computed, input, output, signal } from '@angular/core';
import { emailValido } from '../../../core/calculos/senha';
import { NbButton } from '../../atoms/button/button';
import { NbIcon } from '../../atoms/icon/icon';
import { NbInput } from '../../atoms/input/input';
import { NbFormField } from '../../molecules/form-field/form-field';
import { NbPasswordInput } from '../../molecules/password-input/password-input';

export interface Credenciais {
  readonly email: string;
  readonly senha: string;
}

/** Organismo: login por e-mail e senha (R-01.6, R-01.7, U-01.3, U-01.4). */
@Component({
  selector: 'nb-login-form',
  imports: [NbButton, NbFormField, NbIcon, NbInput, NbPasswordInput],
  template: `
    <form class="space-y-4" novalidate (submit)="$event.preventDefault(); enviar()">
      <nb-form-field rotulo="E-mail" [erro]="erroEmail()">
        <input nbInput type="email" autocomplete="email" inputmode="email" placeholder="seuemail@exemplo.com"
          [value]="email()" (input)="email.set($any($event.target).value)" (blur)="emailTocado.set(true)" />
      </nb-form-field>
      <nb-form-field rotulo="Senha">
        <nb-password-input [(valor)]="senha" autocomplete="current-password" />
      </nb-form-field>
      <div aria-live="assertive">
        @if (erro(); as e) { <p class="flex items-center gap-1 text-sm text-neg-ink"><nb-icon nome="circle-alert" [tamanho]="16" />{{ e }}</p> }
      </div>
      <button nb-button type="submit" [larguraTotal]="true" [disabled]="!valido() || carregando()">
        {{ carregando() ? 'Entrando…' : 'Entrar' }}
      </button>
    </form>
  `,
  host: { class: 'block' },
})
export class NbLoginForm {
  readonly carregando = input(false);
  readonly erro = input<string | null>(null);
  readonly entrar = output<Credenciais>();

  protected readonly email = signal('');
  protected readonly senha = signal('');
  protected readonly emailTocado = signal(false);
  protected readonly erroEmail = computed(() =>
    this.emailTocado() && !emailValido(this.email()) ? 'Digite um e-mail válido, como nome@exemplo.com.' : null);
  protected readonly valido = computed(() => emailValido(this.email()) && this.senha().length > 0);

  protected enviar(): void {
    if (this.valido()) this.entrar.emit({ email: this.email().trim(), senha: this.senha() });
  }
}
