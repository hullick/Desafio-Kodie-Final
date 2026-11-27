import { renderizar } from '../../../../testing/renderizar';
import { NbPasswordInput } from './password-input';

describe('NbPasswordInput (U-01.3)', () => {
  it('alterna visibilidade com aria-pressed e emite valor e blur', async () => {
    const r = await renderizar(NbPasswordInput, { autocomplete: 'new-password' });
    let tocou = false;
    r.instancia.tocado.subscribe(() => (tocou = true));
    const input = r.q<HTMLInputElement>('input');
    expect(input.type).toBe('password');
    expect(input.getAttribute('autocomplete')).toBe('new-password');

    input.value = 'abc';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    expect(r.instancia.valor()).toBe('abc');
    expect(tocou).toBe(true);

    const botao = r.q('button');
    expect(botao.getAttribute('aria-label')).toBe('Mostrar senha');
    botao.click();
    await r.fixture.whenStable();
    expect(input.type).toBe('text');
    expect(botao.getAttribute('aria-pressed')).toBe('true');
    expect(botao.getAttribute('aria-label')).toBe('Ocultar senha');
  });
});
