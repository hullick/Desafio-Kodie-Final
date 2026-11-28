import { Page, expect, test } from '@playwright/test';
import { cadastrarPelaApi, novaConta } from './apoio';

/**
 * Navegação inferior (R-02.1, U-00.4): só Início e Caixinhas, com o "+" no centro.
 * O Perfil sai do menu e fica no avatar do topo.
 */

const menu = (page: Page) => page.getByRole('navigation', { name: 'Navegação principal' });

test.describe('Navegação inferior', () => {
  test.beforeEach(async ({ page }) => {
    await cadastrarPelaApi(page, novaConta('Larissa Santos'));
    await page.goto('/inicio');
  });

  test('o menu tem só Início, "+" e Caixinhas, nessa ordem, sem Perfil', async ({ page }) => {
    const nav = menu(page);
    await expect(nav.getByRole('link')).toHaveText(['Início', 'Caixinhas']);
    await expect(nav.getByRole('button')).toHaveCount(1);
    await expect(nav.getByRole('button')).toHaveAccessibleName('Novo lançamento');
    await expect(nav.getByText('Perfil')).toHaveCount(0);

    // Ordem visual: Início à esquerda, "+" no centro da tela, Caixinhas à direita.
    const caixa = async (l: ReturnType<Page['locator']>) => (await l.boundingBox())!;
    const inicio = await caixa(nav.getByRole('link', { name: 'Início' }));
    const mais = await caixa(nav.getByRole('button', { name: 'Novo lançamento' }));
    const caixinhas = await caixa(nav.getByRole('link', { name: 'Caixinhas' }));
    expect(inicio.x).toBeLessThan(mais.x);
    expect(mais.x).toBeLessThan(caixinhas.x);
    const largura = page.viewportSize()!.width;
    expect(Math.abs(mais.x + mais.width / 2 - largura / 2)).toBeLessThanOrEqual(2);
  });

  test('U-00.4 alvos de toque com 44px ou mais e o "+" nos 40% inferiores da tela', async ({ page }) => {
    const nav = menu(page);
    const alvos = [nav.getByRole('link', { name: 'Início' }), nav.getByRole('link', { name: 'Caixinhas' }),
      nav.getByRole('button', { name: 'Novo lançamento' })];
    for (const alvo of alvos) {
      const b = (await alvo.boundingBox())!;
      expect(b.width, await alvo.textContent() ?? '').toBeGreaterThanOrEqual(44);
      expect(b.height).toBeGreaterThanOrEqual(44);
    }
    const mais = (await alvos[2].boundingBox())!;
    expect(mais.y).toBeGreaterThanOrEqual(page.viewportSize()!.height * 0.6);
  });

  test('trocar de aba pelo menu muda a rota e marca a aba atual', async ({ page }) => {
    const nav = menu(page);
    await expect(nav.getByRole('link', { name: 'Início' })).toHaveAttribute('aria-current', 'page');

    await nav.getByRole('link', { name: 'Caixinhas' }).click();
    await expect(page).toHaveURL(/\/caixinhas$/);
    await expect(nav.getByRole('link', { name: 'Caixinhas' })).toHaveAttribute('aria-current', 'page');
    await expect(nav.getByRole('link', { name: 'Início' })).not.toHaveAttribute('aria-current', 'page');
    // A aba atual se distingue à vista (cor e barra), não só para o leitor de tela.
    const visual = (nome: string) => nav.getByRole('link', { name: nome }).evaluate((el) => ({
      cor: getComputedStyle(el).color, barra: getComputedStyle(el, '::after').content,
    }));
    const [atual, outra] = [await visual('Caixinhas'), await visual('Início')];
    expect(atual.cor).not.toBe(outra.cor);
    expect(atual.barra).not.toBe('none');
    expect(outra.barra).toBe('none');

    await nav.getByRole('link', { name: 'Início' }).click();
    await expect(page).toHaveURL(/\/inicio$/);
    await expect(page.getByRole('heading', { name: /Olá, Larissa/ })).toBeVisible();
  });

  test('R-02.1 o "+" abre o novo lançamento também na aba Caixinhas', async ({ page }) => {
    await menu(page).getByRole('link', { name: 'Caixinhas' }).click();
    await expect(page).toHaveURL(/\/caixinhas$/);
    await menu(page).getByRole('button', { name: 'Novo lançamento' }).click();
    const sheet = page.getByRole('dialog', { name: 'Novo lançamento' });
    await expect(sheet).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(sheet).toHaveCount(0);
  });

  test('o Perfil abre pelo avatar do topo, sem nenhuma aba marcada', async ({ page }) => {
    await page.getByRole('link', { name: 'Perfil de Larissa Santos' }).click();
    await expect(page).toHaveURL(/\/perfil$/);
    await expect(page.getByText(/No NuBanko desde/)).toBeVisible();
    await expect(menu(page).locator('[aria-current="page"]')).toHaveCount(0);
  });

  test('o menu continua à vista e navegável por teclado depois de rolar a página', async ({ page }) => {
    await page.mouse.wheel(0, 2000);
    await expect(menu(page)).toBeInViewport();
    const caixinhas = menu(page).getByRole('link', { name: 'Caixinhas' });
    await caixinhas.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/caixinhas$/);
  });
});
