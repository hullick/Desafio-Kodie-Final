import { Component, computed, input, model } from '@angular/core';
import { Mes, compararMes, mesesInclusivos, rotuloMes, somarMeses } from '../../../core/tempo/mes';
import { NbInput } from '../../atoms/input/input';

const chave = (m: Mes) => `${m.ano}-${m.mes}`;

/** Molécula: seletor de mês/ano entre `de` e `ate` (prazo da caixinha, R-04.3). */
@Component({
  selector: 'nb-month-select',
  imports: [NbInput],
  template: `
    <select nbInput (change)="aoMudar($any($event.target).value)">
      @for (o of opcoes(); track o.chave) {
        <option [value]="o.chave" [selected]="o.chave === selecionada()">{{ o.rotulo }}</option>
      }
    </select>
  `,
  host: { class: 'block' },
})
export class NbMonthSelect {
  readonly valor = model.required<Mes>();
  readonly de = input.required<Mes>();
  readonly ate = input.required<Mes>();

  protected readonly opcoes = computed(() => {
    const n = mesesInclusivos(this.de(), this.ate());
    return Array.from({ length: n }, (_, i) => {
      const m = somarMeses(this.de(), i);
      return { chave: chave(m), rotulo: rotuloMes(m), mes: m };
    });
  });
  protected readonly selecionada = computed(() => chave(this.valor()));

  protected aoMudar(k: string): void {
    const achado = this.opcoes().find((o) => o.chave === k);
    if (achado && compararMes(achado.mes, this.valor()) !== 0) this.valor.set(achado.mes);
  }
}
