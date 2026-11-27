import { afterAll, describe, expect, it, vi } from 'vitest';
import { BASE } from './apoio.ts';

// Produção hoje não tem SMTP: "Esqueci a senha" precisa estar desligado no servidor também.
describe('/api/auth sem SMTP_HOST', () => {
  afterAll(() => vi.unstubAllEnvs());

  it('pedir e aplicar redefinição de senha respondem 404', async () => {
    vi.stubEnv('SMTP_HOST', '');
    vi.resetModules();
    const { default: handler } = await import('../functions/auth.mts');
    for (const caminho of ['/request-password-reset', '/reset-password']) {
      const req = new Request(`${BASE}/api/auth${caminho}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'ninguem@exemplo.com', redirectTo: '/nova-senha', token: 'x', newPassword: 'Nova1234!' }),
      });
      const res = await handler(req);
      expect(res.status, caminho).toBe(404);
    }
  });
});
