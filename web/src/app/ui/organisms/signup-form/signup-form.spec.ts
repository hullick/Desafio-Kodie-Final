import { renderizar } from '../../../../testing/renderizar';
import { DadosCadastro, NbSignupForm } from './signup-form';

const digitar = (el: HTMLInputElement, v: string) => {
  el.value = v;
  el.dispatchEvent(new Event('input'));
};

describe('NbSignupForm (R-01.1 a R-01.3)', () => {
  it('só libera com tudo válido e aceite marcado', async () => {
    const r = await renderizar(NbSignupForm);
    const [nome, email] = r.qs<HTMLInputElement>('input[nbInput]');
    const [senha, conf] = r.qs<HTMLInputElement>('nb-password-input input');
    const botao = r.q<HTMLButtonElement>('button[type=submit]');
    digitar(nome, ' Lari ');
    digitar(email, 'lari@exemplo.com');
    digitar(senha, 'segredo1!');
    digitar(conf, 'segredo1!');
    await r.fixture.whenStable();
    expect(botao.disabled).toBe(true);

    const aceite = r.q<HTMLInputElement>('input[type=checkbox]');
    aceite.checked = true;
    aceite.dispatchEvent(new Event('change'));
    await r.fixture.whenStable();
    expect(botao.disabled).toBe(false);

    let dados: DadosCadastro | undefined;
    r.instancia.cadastrar.subscribe((d) => (dados = d));
    botao.click();
    expect(dados).toEqual({ nome: 'Lari', email: 'lari@exemplo.com', senha: 'segredo1!' });
  });

  it('confirmação diferente mostra erro ao sair do campo', async () => {
    const r = await renderizar(NbSignupForm);
    const [senha, conf] = r.qs<HTMLInputElement>('nb-password-input input');
    digitar(senha, 'segredo1!');
    digitar(conf, 'outra');
    conf.dispatchEvent(new Event('blur'));
    await r.fixture.whenStable();
    expect(r.texto()).toContain('As senhas não são iguais.');
  });
});
