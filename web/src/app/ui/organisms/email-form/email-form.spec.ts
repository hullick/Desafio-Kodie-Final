import { renderizar } from '../../../../testing/renderizar';
import { NbEmailForm } from './email-form';

const digitar = (el: HTMLInputElement, v: string) => {
  el.value = v;
  el.dispatchEvent(new Event('input'));
};

describe('NbEmailForm (R-01.8)', () => {
  it('só envia e-mail válido, aparado', async () => {
    const r = await renderizar(NbEmailForm);
    const email = r.q<HTMLInputElement>('input[type=email]');
    const botao = r.q<HTMLButtonElement>('button[type=submit]');
    expect(email.getAttribute('autocomplete')).toBe('email');
    expect(botao.disabled).toBe(true);
    let enviado: string | undefined;
    r.instancia.enviarEmail.subscribe((e) => (enviado = e));
    digitar(email, ' lari@exemplo.com ');
    await r.fixture.whenStable();
    botao.click();
    expect(enviado).toBe('lari@exemplo.com');
  });

  it('erro só ao sair do campo; erro da tela e carregando aparecem', async () => {
    const r = await renderizar(NbEmailForm, { erro: 'Muitas tentativas.', carregando: true });
    const email = r.q<HTMLInputElement>('input[type=email]');
    digitar(email, 'lari@');
    await r.fixture.whenStable();
    expect(r.texto()).not.toContain('e-mail válido');
    email.dispatchEvent(new Event('blur'));
    await r.fixture.whenStable();
    expect(r.texto()).toContain('Digite um e-mail válido');
    expect(r.texto()).toContain('Muitas tentativas.');
    expect(r.texto()).toContain('Enviando…');
  });
});
