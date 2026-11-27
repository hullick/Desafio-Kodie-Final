import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { cadastrarPelaApi } from './apoio';

/** U-00: sem violações graves de acessibilidade (axe, WCAG 2.1 A/AA) nas telas principais. */
const publicas = ['/entrar', '/cadastro', '/esqueci-senha', '/nova-senha', '/privacidade'];
const logadas = ['/inicio', '/lancamentos', '/caixinhas', '/caixinhas/nova', '/perfil', '/perfil/dados', '/perfil/senha', '/perfil/excluir'];

async function semViolacoesGraves(page: import('@playwright/test').Page) {
  await page.waitForLoadState('networkidle');
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const graves = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(graves.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
}

for (const url of publicas) {
  test(`acessibilidade ${url}`, async ({ page }) => {
    await page.goto(url);
    await semViolacoesGraves(page);
  });
}

test('acessibilidade das telas logadas', async ({ page }) => {
  await cadastrarPelaApi(page);
  for (const url of logadas) {
    await test.step(url, async () => {
      await page.goto(url);
      await semViolacoesGraves(page);
    });
  }
});
