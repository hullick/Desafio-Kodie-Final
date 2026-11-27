import { expect, test } from '@playwright/test';
import { cadastrarPelaApi, entrarPelaTela, novaConta } from './apoio';

test.describe('Spec 05: perfil, senha e exclusão da conta', () => {
  test('R-05.2 editar o nome reflete na saudação', async ({ page }) => {
    await cadastrarPelaApi(page, novaConta('Larissa'));
    await page.goto('/perfil/dados');
    const nome = page.getByLabel('Como prefere ser chamado(a)?');
    await expect(nome).toHaveValue('Larissa');
    await nome.fill('Lari');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page).toHaveURL(/\/perfil$/);
    await page.goto('/inicio');
    await expect(page.getByRole('heading', { name: 'Olá, Lari' })).toBeVisible();
  });

  test('R-05.3 alterar senha: a atual errada é recusada; com a certa, só a nova vale', async ({ page }) => {
    const c = await cadastrarPelaApi(page);
    await page.goto('/perfil');
    await page.getByRole('link', { name: /Alterar senha/ }).click();
    await page.getByLabel('Senha atual').fill('Errada123!');
    await page.getByLabel('Nova senha', { exact: true }).fill('Nova1234!');
    await page.getByLabel('Confirmar nova senha').fill('Nova1234!');
    await page.getByRole('button', { name: 'Alterar senha' }).click();
    await expect(page.getByText('Senha atual incorreta.')).toBeVisible();

    await page.getByLabel('Senha atual').fill(c.senha);
    await page.getByRole('button', { name: 'Alterar senha' }).click();
    await expect(page).toHaveURL(/\/perfil$/);
    await expect(page.getByRole('status').getByText('Senha alterada')).toBeVisible();

    await page.getByRole('button', { name: /Sair/ }).click();
    await entrarPelaTela(page, c.email, c.senha);
    await expect(page.getByText('E-mail ou senha incorretos.')).toBeVisible();
    await entrarPelaTela(page, c.email, 'Nova1234!');
    await expect(page).toHaveURL(/\/inicio$/);
  });

  test('R-05.6 excluir a conta: só com EXCLUIR e a senha; depois não entra mais', async ({ page }) => {
    const c = await cadastrarPelaApi(page);
    await page.goto('/perfil');
    await page.getByRole('link', { name: /Excluir minha conta/ }).click();
    const excluir = page.getByRole('button', { name: 'Excluir minha conta' });
    await page.getByLabel('Para confirmar, digite EXCLUIR').fill('excluir');
    await page.getByLabel('Sua senha').fill(c.senha);
    await expect(excluir).toBeDisabled(); // U-05.2
    await page.getByLabel('Para confirmar, digite EXCLUIR').fill('EXCLUIR');
    await page.getByLabel('Sua senha').fill('Errada123!');
    await excluir.click();
    await expect(page.getByText('Senha atual incorreta.')).toBeVisible();

    await page.getByLabel('Sua senha').fill(c.senha);
    await excluir.click();
    await expect(page).toHaveURL(/\/entrar\?aviso=conta-excluida/);
    await expect(page.getByText('Sua conta e seus dados foram apagados.')).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/entrar/); // voltar não mostra a conta
    await entrarPelaTela(page, c.email, c.senha);
    await expect(page.getByText('E-mail ou senha incorretos.')).toBeVisible();
  });
});
