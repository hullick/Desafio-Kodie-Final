import { renderizar } from '../../../../testing/renderizar';
import { NbKeypad } from './keypad';

describe('NbKeypad (R-02.3)', () => {
  it('emite teclas clicadas e tem 12 botões', async () => {
    const r = await renderizar(NbKeypad);
    const recebidas: string[] = [];
    r.instancia.tecla.subscribe((t) => recebidas.push(t));
    const botoes = r.qs('button');
    expect(botoes).toHaveLength(12);
    botoes[0].click();
    botoes[9].click();
    r.q('[aria-label="Apagar"]').click();
    expect(recebidas).toEqual(['1', '00', 'apagar']);
  });

  it('captura teclado físico só quando ativo e fora de campos de texto', async () => {
    const r = await renderizar(NbKeypad);
    const recebidas: string[] = [];
    r.instancia.tecla.subscribe((t) => recebidas.push(t));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: '5' }));
    await r.definir({ capturarTeclado: true });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: '5' }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: '7', bubbles: true }));
    input.remove();
    expect(recebidas).toEqual(['5', 'apagar']);
  });
});
