import { renderizar } from '../../../../testing/renderizar';
import { NbProfileHeader } from './profile-header';

describe('NbProfileHeader (R-05.1)', () => {
  it('mostra iniciais, nome, e-mail e desde quando', async () => {
    const r = await renderizar(NbProfileHeader, { nome: 'Larissa Santos', email: 'lari@exemplo.com', desde: 'out/2026' });
    expect(r.texto()).toBe('LS Larissa Santos lari@exemplo.com No NuBanko desde out/2026');
  });
});
