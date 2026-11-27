import { Component, computed, input, output, signal } from '@angular/core';
import { emailValido } from '../../../core/calculos/senha';
import { NbButton } from '../../atoms/button/button';
import { NbIcon } from '../../atoms/icon/icon';
import { NbInput } from '../../atoms/input/input';
import { NbFormField } from '../../molecules/form-field/form-field';

/** Organismo: pede só o e-mail ("Esqueci a senha", R-01.8). */
@Component({
  selector: 'nb-email-form',
  imports: [NbButton, NbFormField, NbIcon, NbInput],
  template: `
    <form class="space-y-4" novalidate (submit)="$event.preventDefault(); enviar()">
      <nb-form-field rotulo="E-mail da sua conta" [erro]="erroEmail()">
        <input nbInput type="email" autocomplete="email" inputmode="email" placeholder="seuemail@exemplo.com"
          [value]="email()" (input)="email.set($any($event.target).value)" (blur)="tocado.set(true)" />
      </nb-form-field>
      <div aria-live="assertive">
        @if (erro(); as e) { <p class="flex items-center gap-1 text-sm text-neg-ink"><nb-icon nome="circle-alert" [tamanho]="16" />{{ e }}</p> }
      </div>
      <button nb-button type="submit" [larguraTotal]="true" [disabled]="!valido() || carregando()">
        {{ carregando() ? 'Enviando…' : rotuloBotao() }}
      </button>
    </form>
  `,
  host: { class: 'block' },
})
export class NbEmailForm {
  readonly carregando = input(false);
  readonly erro = input<string | null>(null);
  readonly rotuloBotao = input('Enviar link');
  readonly enviarEmail = output<string>();

  protected readonly email = signal('');
  protected readonly tocado = signal(false);
  protected readonly valido = computed(() => emailValido(this.email()));
  protected readonly erroEmail = computed(() =>
    this.tocado() && !this.valido() ? 'Digite um e-mail válido, como nome@exemplo.com.' : null);

  protected enviar(): void {
    if (this.valido()) this.enviarEmail.emit(this.email().trim());
  }
}
