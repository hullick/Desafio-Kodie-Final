import { renderizar } from '../../../../testing/renderizar';
import { NbExcluirContaForm } from './excluir-conta-form';

const digitar = (el: HTMLInputElement, v: string) => {
  el.value = v;
  el.dispatchEvent(new Event('input'));
};

describe('NbExcluirContaForm (R-05.6, U-05.2)', () => {
  it('explica que é irreversível e só libera com EXCLUIR exato e a senha', async () => {
    const r = await renderizar(NbExcluirContaForm);
    expect(r.texto()).toContain('Isso não pode ser desfeito');
    expect(r.texto()).toContain('lançamentos e caixinhas');
    const palavra = r.q<HTMLInputElement>('input[nbInput]:not([type=password])');
    const senha = r.q<HTMLInputElement>('nb-password-input input');
    const botao = r.q<HTMLButtonElement>('button[type=submit]');
    let excluiu: string | undefined;
    r.instancia.excluir.subscribe((s) => (excluiu = s));

    digitar(palavra, 'excluir');
    digitar(senha, 'Senha123!');
    await r.fixture.whenStable();
    expect(botao.disabled).toBe(true);

    digitar(palavra, 'EXCLUIR');
    digitar(senha, '');
    await r.fixture.whenStable();
    expect(botao.disabled).toBe(true);

    digitar(senha, 'Senha123!');
    await r.fixture.whenStable();
    expect(botao.disabled).toBe(false);
    expect(botao.className).toMatch(/neg/);
    botao.click();
    expect(excluiu).toBe('Senha123!');
  });

  it('mostra o erro da tela e "Excluindo…"', async () => {
    const r = await renderizar(NbExcluirContaForm, { erro: 'Senha atual incorreta.', carregando: true });
    expect(r.texto()).toContain('Senha atual incorreta.');
    expect(r.texto()).toContain('Excluindo…');
  });
});
