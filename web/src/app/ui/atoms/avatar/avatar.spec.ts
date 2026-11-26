import { renderizar } from '../../../../testing/renderizar';
import { NbAvatar } from './avatar';

describe('NbAvatar', () => {
  it('mostra iniciais e nome acessível', async () => {
    const r = await renderizar(NbAvatar, { nome: 'Larissa Santos', tamanho: 'xl' });
    expect(r.texto()).toBe('LS');
    expect(r.el.getAttribute('aria-label')).toBe('Larissa Santos');
    expect(r.el.className).toContain('size-24');
  });
});
