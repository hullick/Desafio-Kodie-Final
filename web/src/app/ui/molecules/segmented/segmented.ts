import { Component, input, model } from '@angular/core';
import { OpcaoVM } from '../../modelos';

/** Molécula: seletor segmentado (Gasto | Entrada). */
@Component({
  selector: 'nb-segmented',
  template: `
    @for (o of opcoes(); track o.valor) {
      <button type="button" class="min-h-11 flex-1 rounded-full px-5 text-[15px] font-semibold transition"
        [class]="o.valor === valor() ? 'bg-brand text-ink shadow-n1' : 'text-ink/70'"
        [attr.aria-pressed]="o.valor === valor()" (click)="valor.set(o.valor)">{{ o.rotulo }}</button>
    }
  `,
  host: { role: 'group', '[attr.aria-label]': 'rotulo()', class: 'inline-flex gap-1 rounded-full bg-canvas p-1' },
})
export class NbSegmented<T extends string> {
  readonly opcoes = input.required<readonly OpcaoVM<T>[]>();
  readonly rotulo = input.required<string>();
  readonly valor = model.required<T>();
}
