import { afterEach, describe, expect, it, vi } from 'vitest';
import { urlDoSite } from './site.ts';

describe('urlDoSite', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('usa BETTER_AUTH_URL quando definida', () => {
    vi.stubEnv('BETTER_AUTH_URL', 'https://nubanko.app');
    vi.stubEnv('DEPLOY_PRIME_URL', 'https://deploy-preview-3--nubanko.netlify.app');
    expect(urlDoSite()).toBe('https://nubanko.app');
  });

  it('sem BETTER_AUTH_URL, usa o endereço do próprio deploy (preview)', () => {
    vi.stubEnv('BETTER_AUTH_URL', '');
    vi.stubEnv('DEPLOY_PRIME_URL', 'https://deploy-preview-3--nubanko.netlify.app');
    vi.stubEnv('URL', 'https://nubanko.netlify.app');
    expect(urlDoSite()).toBe('https://deploy-preview-3--nubanko.netlify.app');
  });

  it('cai na URL principal do site', () => {
    vi.stubEnv('BETTER_AUTH_URL', '');
    vi.stubEnv('DEPLOY_PRIME_URL', '');
    vi.stubEnv('URL', 'https://nubanko.netlify.app');
    expect(urlDoSite()).toBe('https://nubanko.netlify.app');
  });

  it('sem nenhuma, falha alto em vez de aceitar qualquer origem', () => {
    vi.stubEnv('BETTER_AUTH_URL', '');
    vi.stubEnv('DEPLOY_PRIME_URL', '');
    vi.stubEnv('URL', '');
    expect(() => urlDoSite()).toThrow('BETTER_AUTH_URL não definida');
  });
});
