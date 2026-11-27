import { provideRouter } from '@angular/router';
import { renderizar } from '../../../../testing/renderizar';
import { NbAppHeader } from './app-header';

describe('NbAppHeader', () => {
  it('liga logo ao início e avatar ao perfil, sem sino', async () => {
    const r = await renderizar(NbAppHeader, { nome: 'Larissa Santos' }, [provideRouter([])]);
    const [inicio, perfil] = r.qs<HTMLAnchorElement>('a');
    expect(inicio.getAttribute('href')).toBe('/inicio');
    expect(perfil.getAttribute('href')).toBe('/perfil');
    expect(perfil.getAttribute('aria-label')).toBe('Perfil de Larissa Santos');
    expect(r.texto()).toContain('LS');
    expect(r.el.querySelector('[aria-label*="otifica"]')).toBeNull();
  });
});
