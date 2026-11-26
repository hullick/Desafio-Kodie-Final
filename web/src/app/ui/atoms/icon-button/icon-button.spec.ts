import { Component } from '@angular/core';
import { renderizar } from '../../../../testing/renderizar';
import { NbIconButton } from './icon-button';

@Component({
  imports: [NbIconButton],
  template: `<button nb-icon-button icone="plus" rotulo="Novo lançamento" variante="fab"></button>`,
})
class Hospedeiro {}

describe('NbIconButton', () => {
  it('tem nome acessível e tamanho de alvo de toque', async () => {
    const r = await renderizar(Hospedeiro);
    const b = r.q('button');
    expect(b.getAttribute('aria-label')).toBe('Novo lançamento');
    expect(b.className).toContain('size-16');
    expect(r.q('svg').getAttribute('width')).toBe('28');
  });
});
