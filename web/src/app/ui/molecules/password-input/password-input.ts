import { Component, input, model, output, signal } from '@angular/core';
import { NbIconButton } from '../../atoms/icon-button/icon-button';
import { NbInput } from '../../atoms/input/input';

/** Molécula: campo de senha com "mostrar senha" (U-01.3). Use dentro de nb-form-field. */
@Component({
  selector: 'nb-password-input',
  imports: [NbInput, NbIconButton],
  template: `
    <input nbInput class="pr-14" [type]="visivel() ? 'text' : 'password'" [attr.autocomplete]="autocomplete()"
      [placeholder]="placeholder()" [value]="valor()" (input)="valor.set($any($event.target).value)" (blur)="tocado.emit()" />
    <button nb-icon-button type="button" class="absolute right-1 top-1/2 -translate-y-1/2"
      [icone]="visivel() ? 'eye-off' : 'eye'" [rotulo]="visivel() ? 'Ocultar senha' : 'Mostrar senha'"
      [attr.aria-pressed]="visivel()" (click)="visivel.set(!visivel())"></button>
  `,
  host: { class: 'relative block' },
})
export class NbPasswordInput {
  readonly valor = model('');
  readonly autocomplete = input<'current-password' | 'new-password'>('current-password');
  readonly placeholder = input('');
  readonly tocado = output<void>();
  protected readonly visivel = signal(false);
}
