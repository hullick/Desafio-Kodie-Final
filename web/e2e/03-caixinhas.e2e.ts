import { expect, test } from '@playwright/test';
import { cadastrarPelaApi, novaConta, teclar } from './apoio';

test.describe('Spec 04: caixinhas', () => {
  test('criar, guardar, barrar retirada acima do saldo, retirar e excluir', async ({ page }) => {
    await cadastrarPelaApi(page);
    await page.goto('/caixinhas/nova');
    await page.getByRole('button', { name: 'Viagem' }).click();
    await page.getByLabel('Nome do objetivo').fill('Viagem pra praia');
    await page.getByRole('button', { name: '+ R$ 1.000' }).click();
    await expect(page.getByRole('region', { name: 'Plano sugerido' })).not.toContainText('Informe o valor'); // U-04.2
    await page.getByRole('button', { name: 'Criar caixinha' }).click();
    await expect(page).toHaveURL(/\/caixinhas\/[0-9a-f-]{36}$/);
    await expect(page.getByText('Viagem pra praia').first()).toBeVisible();

    await page.getByRole('button', { name: 'Guardar', exact: true }).click();
    await teclar(page, 20000);
    await page.getByRole('dialog').getByRole('button', { name: 'Guardar', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await page.getByRole('button', { name: 'Retirar', exact: true }).click();
    await teclar(page, 30000);
    const retirar = page.getByRole('dialog').getByRole('button', { name: 'Retirar', exact: true });
    await expect(retirar).toBeDisabled(); // U-04.4: o front já bloqueia acima do saldo...
    await expect(page.getByRole('dialog')).toContainText('Você tem R$');
    await page.keyboard.press('Escape'); // U-02.6
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await page.getByRole('button', { name: 'Retirar', exact: true }).click();
    await teclar(page, 20000);
    await page.getByRole('dialog').getByRole('button', { name: 'Retirar', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await page.getByRole('button', { name: 'Mais opções' }).click();
    await page.getByRole('menuitem', { name: 'Excluir' }).or(page.getByRole('button', { name: 'Excluir' })).first().click();
    await page.getByRole('button', { name: /Excluir de vez/ }).click();
    await expect(page).toHaveURL(/\/caixinhas$/);
    await expect(page.getByText('Viagem pra praia')).toHaveCount(0);
  });

  test('R-00.1 outra pessoa não vê nem abre a caixinha (404 = não encontrada)', async ({ browser }) => {
    const ctxA = await browser.newContext();
    const a = await ctxA.newPage();
    await cadastrarPelaApi(a, novaConta('Ana'));
    await a.goto('/caixinhas/nova');
    await a.getByLabel('Nome do objetivo').fill('Segredo da Ana');
    await a.getByRole('button', { name: '+ R$ 500' }).click();
    await a.getByRole('button', { name: 'Criar caixinha' }).click();
    await expect(a).toHaveURL(/\/caixinhas\/[0-9a-f-]{36}$/);
    const urlDaAna = a.url();

    const ctxB = await browser.newContext();
    const b = await ctxB.newPage();
    await cadastrarPelaApi(b, novaConta('Bia'));
    await b.goto('/caixinhas');
    await expect(b.getByText('Segredo da Ana')).toHaveCount(0);
    await b.goto(new URL(urlDaAna).pathname);
    await expect(b.getByText('Caixinha não encontrada')).toBeVisible();
    await expect(b.getByText('Segredo da Ana')).toHaveCount(0);

    const id = new URL(urlDaAna).pathname.split('/').pop();
    const api = await b.request.get(`/api/caixinhas/${id}`);
    expect(api.status()).toBe(404);
    await ctxA.close();
    await ctxB.close();
  });
});
