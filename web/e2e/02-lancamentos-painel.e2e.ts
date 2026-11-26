import { expect, test } from '@playwright/test';
import { cadastrarPelaApi, teclar } from './apoio';


test.describe('Specs 02 e 03: lançamentos e painel do mês', () => {
  test.beforeEach(async ({ page }) => {
    await cadastrarPelaApi(page);
    await page.goto('/inicio');
  });

  test('R-02.7/R-03.8 registrar entrada e gasto atualiza saldo, gastos e últimos lançamentos', async ({ page }) => {
    await expect(page.getByText('Nenhum gasto em')).toBeVisible(); // R-03.7

    await page.getByRole('button', { name: 'Novo lançamento' }).click();
    await page.getByRole('button', { name: 'Entrada', exact: true }).click();
    await teclar(page, 150000);
    await page.getByRole('button', { name: 'Salário/Bolsa' }).click();
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByRole('status').getByText('Entrada registrada')).toBeVisible();

    // U-02.1: "+", categoria e "Salvar" além dos dígitos.
    await page.getByRole('button', { name: 'Novo lançamento' }).click();
    await teclar(page, 3250);
    await page.getByRole('button', { name: 'Alimentação' }).click();
    await page.getByPlaceholder('Adicionar descrição (opcional)').fill('Almoço no bandejão');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByRole('status').getByText('Gasto registrado')).toBeVisible();

    await expect(page.getByText(/1\.467,50/).first()).toBeVisible(); // saldo = 1.500,00 − 32,50
    await expect(page.getByText('Almoço no bandejão')).toBeVisible();
    await expect(page.getByText('Nenhum gasto em')).toHaveCount(0);
  });

  test('R-02.4 Salvar só habilita com valor e categoria', async ({ page }) => {
    await page.getByRole('button', { name: 'Novo lançamento' }).click();
    const salvar = page.getByRole('button', { name: 'Salvar' });
    await expect(salvar).toBeDisabled();
    await teclar(page, 100);
    await expect(salvar).toBeDisabled();
    await page.getByRole('button', { name: 'Transporte' }).click();
    await expect(salvar).toBeEnabled();
  });

  test('R-02.9 editar e excluir um lançamento pela lista', async ({ page }) => {
    await page.getByRole('button', { name: 'Novo lançamento' }).click();
    await teclar(page, 990);
    await page.getByRole('button', { name: 'Lazer' }).click();
    await page.getByPlaceholder('Adicionar descrição (opcional)').fill('Cinema');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByRole('status').getByText('Gasto registrado')).toBeVisible();

    await page.getByText('Cinema').click();
    await page.getByPlaceholder('Adicionar descrição (opcional)').fill('Cinema com a turma');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Cinema com a turma')).toBeVisible();

    await page.getByText('Cinema com a turma').click();
    await page.getByRole('button', { name: 'Excluir', exact: true }).click();
    await page.getByRole('button', { name: 'Excluir de vez' }).click();
    await expect(page.getByText('Cinema com a turma')).toHaveCount(0);
    await expect(page.getByText('Nenhum gasto em')).toBeVisible();
  });
});
