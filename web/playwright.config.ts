import { defineConfig, devices } from '@playwright/test';

/**
 * E2E contra o app real do docker compose (netlify dev + API + Postgres + Mailpit).
 * Antes: NUBANKO_RATE_LIMIT=desligado docker compose up -d   (a suíte cria várias contas do mesmo IP)
 * Rodar: npm run e2e   (dentro de web/)
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  // O ng serve de desenvolvimento (via netlify dev) fica lento com muitos navegadores em paralelo.
  workers: 2,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: process.env['E2E_URL'] ?? 'http://localhost:8888',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: '360x740', use: { ...devices['Desktop Chrome'], viewport: { width: 360, height: 740 }, isMobile: false } },
    { name: '390x844', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } } },
  ],
});
