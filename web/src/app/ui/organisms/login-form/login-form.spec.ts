import { renderizar } from '../../../../testing/renderizar';
import { Credenciais, NbLoginForm } from './login-form';

const digitar = (el: HTMLInputElement, v: string) => {
  el.value = v;
  el.dispatchEvent(new Event('input'));
};

describe('NbLoginForm', () => {
  it('usa type=email e autocomplete e envia as credenciais (U-01.3)', async () => {
    const r = await renderizar(NbLoginForm);
    const email = r.q<HTMLInputElement>('input[type=email]');
    expect(email.getAttribute('autocomplete')).toBe('email');
    let cred: Credenciais | undefined;
    r.instancia.entrar.subscribe((c) => (cred = c));
    digitar(email, 'lari@exemplo.com ');
    digitar(r.q<HTMLInputElement>('nb-password-input input'), 'segredo1!');
    await r.fixture.whenStable();
    r.q<HTMLButtonElement>('button[type=submit]').click();
    expect(cred).toEqual({ email: 'lari@exemplo.com', senha: 'segredo1!' });
  });

  it('erro de e-mail só aparece ao sair do campo (U-01.4)', async () => {
    const r = await renderizar(NbLoginForm);
    const email = r.q<HTMLInputElement>('input[type=email]');
    digitar(email, 'lari@');
    await r.fixture.whenStable();
    expect(r.texto()).not.toContain('e-mail válido');
    email.dispatchEvent(new Event('blur'));
    await r.fixture.whenStable();
    expect(r.texto()).toContain('Digite um e-mail válido');
    expect(email.getAttribute('aria-invalid')).toBe('true');
  });
});
