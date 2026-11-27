import { Component } from '@angular/core';
import { renderizar } from '../../../../testing/renderizar';
import { NbSettingsItem } from './settings-item';

@Component({
  imports: [NbSettingsItem],
  template: `<button nb-settings-item icone="log-out" titulo="Sair" subtitulo="Desconectar" [perigo]="true"></button>
    <a nb-settings-item icone="lock" titulo="Privacidade" href="#"></a>`,
})
class Hospedeiro {}

describe('NbSettingsItem', () => {
  it('mostra título, subtítulo e estilo de perigo', async () => {
    const r = await renderizar(Hospedeiro);
    expect(r.q('button').textContent).toContain('Desconectar');
    expect(r.q('button .text-neg-ink').textContent).toBe('Sair');
    expect(r.q('a').textContent).toContain('Privacidade');
  });
});
