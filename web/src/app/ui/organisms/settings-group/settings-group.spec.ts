import { provideRouter } from '@angular/router';
import { renderizar } from '../../../../testing/renderizar';
import { NbSettingsGroup } from './settings-group';

describe('NbSettingsGroup', () => {
  it('renderiza links para cada item', async () => {
    const r = await renderizar(NbSettingsGroup, {
      titulo: 'Sua conta',
      itens: [{ icone: 'id-card', titulo: 'Seus dados', subtitulo: 'Nome e e-mail', rota: '/perfil/dados' }],
    }, [provideRouter([])]);
    expect(r.q('a').getAttribute('href')).toBe('/perfil/dados');
    expect(r.texto()).toBe('Sua conta Seus dados Nome e e-mail');
  });
});
