import { Component, input } from '@angular/core';
import { NbIcon } from '../../atoms/icon/icon';

/** Molécula: aviso flutuante de confirmação (U-00.7). */
@Component({
  selector: 'nb-toast',
  imports: [NbIcon],
  template: `<nb-icon nome="circle-check" class="text-brand" [tamanho]="22" /><span>{{ mensagem() }}</span>`,
  host: {
    role: 'status',
    class: 'inline-flex items-center gap-2 rounded-full bg-inverse px-5 py-3 text-[15px] font-semibold text-white shadow-n2 bg-[#2a313d]',
  },
})
export class NbToast {
  readonly mensagem = input.required<string>();
}
