import { Directive } from '@angular/core';

/** Átomo: checkbox nativo com a cor da marca. Use dentro de um <label> para alvo ≥ 44px. */
@Directive({
  selector: 'input[type=checkbox][nbCheckbox]',
  host: { class: 'size-6 shrink-0 cursor-pointer rounded-md accent-[var(--color-brand-ink)]' },
})
export class NbCheckbox {}
