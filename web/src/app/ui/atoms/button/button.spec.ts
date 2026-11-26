import { Component } from '@angular/core';
import { renderizar } from '../../../../testing/renderizar';
import { NbButton } from './button';

@Component({
  imports: [NbButton],
  template: `
    <button nb-button id="a">Salvar</button>
    <button nb-button id="b" variante="perigo" tamanho="sm" [larguraTotal]="true" disabled>Excluir</button>
  `,
})
class Hospedeiro {}

describe('NbButton', () => {
  it('mantém o elemento nativo com classes de variante', async () => {
    const r = await renderizar(Hospedeiro);
    const a = r.q<HTMLButtonElement>('#a');
    expect(a.textContent).toContain('Salvar');
    expect(a.className).toContain('bg-brand');
    expect(a.className).toContain('min-h-12');
    const b = r.q<HTMLButtonElement>('#b');
    expect(b.className).toContain('text-neg-ink');
    expect(b.className).toContain('min-h-11');
    expect(b.className).toContain('w-full');
    expect(b.disabled).toBe(true);
  });
});
