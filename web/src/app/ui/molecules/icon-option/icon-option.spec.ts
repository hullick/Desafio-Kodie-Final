import { Component } from '@angular/core';
import { renderizar } from '../../../../testing/renderizar';
import { NbIconOption } from './icon-option';

@Component({
  imports: [NbIconOption],
  template: `<button nb-icon-option icone="plane" rotulo="Viagem" [selecionado]="true"></button>`,
})
class Hospedeiro {}

describe('NbIconOption', () => {
  it('reflete seleção', async () => {
    const r = await renderizar(Hospedeiro);
    expect(r.q('button').getAttribute('aria-pressed')).toBe('true');
    expect(r.q('button').textContent).toContain('Viagem');
  });
});
