import { renderizar } from '../../../../testing/renderizar';
import { NbPasswordChecks } from './password-checks';

describe('NbPasswordChecks (U-01.2)', () => {
  it('atualiza os checks a cada mudança', async () => {
    const r = await renderizar(NbPasswordChecks, { senha: '' });
    const oks = () => r.qs('li').map((li) => li.getAttribute('data-ok'));
    expect(oks()).toEqual(['false', 'false', 'false']);
    await r.definir({ senha: 'abcdefg1' });
    expect(oks()).toEqual(['true', 'true', 'false']);
    await r.definir({ senha: 'abcdefg1!' });
    expect(oks()).toEqual(['true', 'true', 'true']);
    expect(r.qs('.bg-brand').length).toBe(3);
  });
});
