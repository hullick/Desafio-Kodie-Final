import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NbShellTemplate } from './shell-template';

@Component({
  imports: [NbShellTemplate],
  template: `<nb-shell-template><p topo>T</p><p>C</p><p navegacao>N</p><p sobreposicao>S</p></nb-shell-template>`,
})
class Host {}

describe('NbShellTemplate', () => {
  it('distribui os slots em header, main e navegação', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('header')?.textContent).toBe('T');
    expect(el.querySelector('main')?.textContent).toBe('C');
    expect(el.querySelector('.fixed')?.textContent).toBe('N');
    expect(el.querySelector('a[href="#conteudo"]')).not.toBeNull();
  });
});
