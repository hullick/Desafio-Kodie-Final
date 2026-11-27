import { Component, signal } from '@angular/core';
import { renderizar } from '../../../../testing/renderizar';
import { CONTEXTO_CAMPO, NbInput } from './input';

@Component({ imports: [NbInput], template: `<input nbInput id="solto" />` })
class Solto {}

const invalido = signal(true);
@Component({
  imports: [NbInput],
  template: `<input nbInput />`,
  providers: [{
    provide: CONTEXTO_CAMPO,
    useValue: { idCampo: signal('campo-1'), idDescricao: signal('campo-1-erro'), invalido },
  }],
})
class ComContexto {}

describe('NbInput', () => {
  it('estiliza sem contexto e preserva o id do autor', async () => {
    const r = await renderizar(Solto);
    const i = r.q('input');
    expect(i.className).toContain('min-h-12');
    expect(i.getAttribute('aria-invalid')).toBeNull();
  });

  it('liga id e ARIA a partir do campo', async () => {
    const r = await renderizar(ComContexto);
    const i = r.q('input');
    expect(i.id).toBe('campo-1');
    expect(i.getAttribute('aria-describedby')).toBe('campo-1-erro');
    expect(i.getAttribute('aria-invalid')).toBe('true');
    invalido.set(false);
    await r.fixture.whenStable();
    expect(i.getAttribute('aria-invalid')).toBeNull();
  });
});
