import { renderizar } from '../../../../testing/renderizar';
import { NbSkeleton } from './skeleton';

describe('NbSkeleton', () => {
  it('é decorativo', async () => {
    const r = await renderizar(NbSkeleton, { forma: 'h-8 w-20' });
    expect(r.el.getAttribute('aria-hidden')).toBe('true');
    expect(r.el.className).toContain('h-8');
  });
});
