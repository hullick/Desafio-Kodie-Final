import { renderizar } from '../../../../testing/renderizar';
import { NbToast } from './toast';

describe('NbToast', () => {
  it('é uma região de status', async () => {
    const r = await renderizar(NbToast, { mensagem: 'Gasto registrado' });
    expect(r.el.getAttribute('role')).toBe('status');
    expect(r.texto()).toBe('Gasto registrado');
  });
});
