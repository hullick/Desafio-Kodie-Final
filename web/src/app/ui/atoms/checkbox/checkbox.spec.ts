import { Component } from '@angular/core';
import { renderizar } from '../../../../testing/renderizar';
import { NbCheckbox } from './checkbox';

@Component({ imports: [NbCheckbox], template: `<input type="checkbox" nbCheckbox />` })
class Hospedeiro {}

describe('NbCheckbox', () => {
  it('aplica tamanho e cor', async () => {
    const r = await renderizar(Hospedeiro);
    expect(r.q('input').className).toContain('size-6');
  });
});
