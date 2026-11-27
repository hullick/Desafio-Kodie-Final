import { Component, signal } from '@angular/core';
import { renderizar } from '../../../../testing/renderizar';
import { NbInput } from '../../atoms/input/input';
import { NbFormField } from './form-field';

@Component({
  imports: [NbFormField, NbInput],
  template: `<nb-form-field rotulo="E-mail" id="email" [erro]="erro()" dica="Use seu melhor e-mail">
    <a campo-acao href="#">Ajuda</a><input nbInput type="email" />
  </nb-form-field>`,
})
class Hospedeiro {
  erro = signal<string | null>(null);
}

describe('NbFormField (U-00.6)', () => {
  it('liga rótulo, dica e erro ao input', async () => {
    const r = await renderizar(Hospedeiro);
    const input = r.q('input');
    expect(r.q('label').getAttribute('for')).toBe('email');
    expect(input.id).toBe('email');
    expect(input.getAttribute('aria-describedby')).toBe('email-desc');
    expect(r.q('#email-desc').textContent).toContain('Use seu melhor e-mail');
    expect(r.q('a').textContent).toBe('Ajuda');

    r.instancia.erro.set('Informe um e-mail válido');
    await r.fixture.whenStable();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(r.q('#email-desc').textContent).toContain('Informe um e-mail válido');
  });
});
