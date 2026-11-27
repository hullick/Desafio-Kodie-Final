import { Component, signal } from '@angular/core';
import { renderizar } from '../../../../testing/renderizar';
import { NbCategoryChip } from './category-chip';

@Component({
  imports: [NbCategoryChip],
  template: `<button nb-category-chip icone="utensils" rotulo="Alimentação" [selecionado]="sel()"></button>`,
})
class Hospedeiro { sel = signal(false); }

describe('NbCategoryChip (U-02.4)', () => {
  it('reflete a seleção em aria-pressed e estilo', async () => {
    const r = await renderizar(Hospedeiro);
    const b = r.q('button');
    expect(b.getAttribute('aria-pressed')).toBe('false');
    expect(b.getAttribute('type')).toBe('button');
    r.instancia.sel.set(true);
    await r.fixture.whenStable();
    expect(b.getAttribute('aria-pressed')).toBe('true');
    expect(b.className).toContain('bg-brand');
  });
});
