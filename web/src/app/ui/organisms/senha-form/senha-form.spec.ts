import { renderizar } from '../../../../testing/renderizar';
import { NbSenhaForm, TrocaDeSenha } from './senha-form';

const digitar = (el: HTMLInputElement, v: string) => {
  el.value = v;
  el.dispatchEvent(new Event('input'));
};

describe('NbSenhaForm (R-01.2, R-01.8, R-05.3)', () => {
  it('redefinição: nova senha forte e confirmada libera o botão', async () => {
    const r = await renderizar(NbSenhaForm);
    const [nova, confirmar] = r.qs<HTMLInputElement>('nb-password-input input');
    expect(r.qs('nb-password-input')).toHaveLength(2);
    expect(nova.getAttribute('autocomplete')).toBe('new-password');
    const botao = r.q<HTMLButtonElement>('button[type=submit]');
    let dados: TrocaDeSenha | undefined;
    r.instancia.salvar.subscribe((d) => (dados = d));

    digitar(nova, 'fraca');
    digitar(confirmar, 'fraca');
    await r.fixture.whenStable();
    expect(botao.disabled).toBe(true);

    digitar(nova, 'Nova123!');
    digitar(confirmar, 'Nova123?');
    await r.fixture.whenStable();
    expect(botao.disabled).toBe(true);
    confirmar.dispatchEvent(new Event('blur'));
    await r.fixture.whenStable();
    expect(r.texto()).toContain('As senhas não são iguais.');

    digitar(confirmar, 'Nova123!');
    await r.fixture.whenStable();
    botao.click();
    expect(dados).toEqual({ atual: '', nova: 'Nova123!' });
  });

  it('alterar senha: pede a atual antes', async () => {
    const r = await renderizar(NbSenhaForm, { pedirAtual: true, rotuloBotao: 'Alterar senha', erro: 'Senha atual incorreta.' });
    const [atual, nova, confirmar] = r.qs<HTMLInputElement>('nb-password-input input');
    expect(atual.getAttribute('autocomplete')).toBe('current-password');
    expect(r.texto()).toContain('Senha atual incorreta.');
    const botao = r.q<HTMLButtonElement>('button[type=submit]');
    expect(botao.textContent).toContain('Alterar senha');
    let dados: TrocaDeSenha | undefined;
    r.instancia.salvar.subscribe((d) => (dados = d));
    digitar(nova, 'Nova123!');
    digitar(confirmar, 'Nova123!');
    atual.dispatchEvent(new Event('blur'));
    nova.dispatchEvent(new Event('blur'));
    await r.fixture.whenStable();
    expect(botao.disabled).toBe(true);
    expect(r.texto()).toContain('Digite sua senha atual.');
    digitar(atual, 'Atual1!');
    await r.fixture.whenStable();
    botao.click();
    expect(dados).toEqual({ atual: 'Atual1!', nova: 'Nova123!' });
  });

  it('mostra a regra ao sair do campo e "Salvando…" enquanto salva', async () => {
    const r = await renderizar(NbSenhaForm, { carregando: true });
    const [nova] = r.qs<HTMLInputElement>('nb-password-input input');
    digitar(nova, 'abc');
    nova.dispatchEvent(new Event('blur'));
    await r.fixture.whenStable();
    expect(r.texto()).toContain('A senha precisa de 8 caracteres');
    expect(r.texto()).toContain('Salvando…');
  });
});
