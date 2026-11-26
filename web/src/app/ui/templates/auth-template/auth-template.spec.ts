import { renderizar } from '../../../../testing/renderizar';
import { NbAuthTemplate } from './auth-template';

describe('NbAuthTemplate (R-01.11)', () => {
  it('mostra título e só o texto de segurança verdadeiro', async () => {
    const r = await renderizar(NbAuthTemplate, { titulo: 'Entrar', subtitulo: 'Bem-vinda de volta' });
    expect(r.q('h1').textContent).toBe('Entrar');
    expect(r.texto()).toContain('Senha protegida e conexão segura (HTTPS)');
    expect(r.texto()).not.toMatch(/ponta a ponta|256/);
  });
});
