import { expect, test } from '@playwright/test';
import { SENHA, cadastrarPelaApi, entrarPelaTela, novaConta, ultimoEmail } from './apoio';

test.describe('Spec 01: cadastro, login e rotas protegidas', () => {
  test('R-01.1 cadastro pela tela já entra e mostra "Olá, {nome}"', async ({ page }) => {
    const c = novaConta('Marina');
    await page.goto('/cadastro');
    const criar = page.getByRole('button', { name: 'Criar conta' });
    await page.getByLabel('Como prefere ser chamado(a)?').fill(c.nome);
    await page.getByLabel('E-mail').fill(c.email);
    await page.getByLabel('Criar senha').fill(c.senha);
    await page.getByLabel('Confirmar senha').fill(c.senha);
    await expect(criar).toBeDisabled(); // R-01.3: sem aceite, não cria
    await page.getByRole('checkbox').check();
    await criar.click();
    await expect(page).toHaveURL(/\/inicio$/);
    await expect(page.getByRole('heading', { name: 'Olá, Marina' })).toBeVisible();
  });

  test('R-01.4 e-mail já cadastrado mostra como seguir', async ({ page }) => {
    const c = await cadastrarPelaApi(page);
    await page.context().clearCookies();
    await page.goto('/cadastro');
    await page.getByLabel('Como prefere ser chamado(a)?').fill('Outra');
    await page.getByLabel('E-mail').fill(c.email);
    await page.getByLabel('Criar senha').fill(SENHA);
    await page.getByLabel('Confirmar senha').fill(SENHA);
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Criar conta' }).click();
    await expect(page.getByText('Já existe uma conta com esse e-mail')).toBeVisible();
    await expect(page).toHaveURL(/\/cadastro$/);
  });

  test('R-01.7 senha errada mostra mensagem neutra', async ({ page }) => {
    const c = await cadastrarPelaApi(page);
    await page.context().clearCookies();
    await entrarPelaTela(page, c.email, 'Errada123!');
    await expect(page.getByText('E-mail ou senha incorretos.')).toBeVisible();
  });

  test('R-01.9 rota protegida vai ao login e volta para ela depois', async ({ page }) => {
    const c = await cadastrarPelaApi(page);
    await page.context().clearCookies();
    await page.goto('/caixinhas');
    await expect(page).toHaveURL(/\/entrar\?voltar=%2Fcaixinhas/);
    await page.getByLabel('E-mail').fill(c.email);
    await page.getByLabel('Senha', { exact: true }).fill(c.senha);
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expect(page).toHaveURL(/\/caixinhas$/);
  });

  test('R-01.6 sessão persiste após recarregar; sair volta ao login e fecha as rotas', async ({ page }) => {
    await cadastrarPelaApi(page, novaConta('Davi'));
    await page.goto('/inicio');
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Olá, Davi' })).toBeVisible();
    await page.goto('/perfil');
    await page.getByRole('button', { name: /Sair/ }).click();
    await expect(page).toHaveURL(/\/entrar$/);
    await page.goto('/inicio');
    await expect(page).toHaveURL(/\/entrar\?voltar=%2Finicio/);
  });

  test('login e cadastro têm link um para o outro, visível sem rolar', async ({ page }) => {
    await page.goto('/entrar');
    const criar = page.getByRole('link', { name: 'Criar conta' });
    await expect(criar).toBeInViewport();
    await criar.click();
    await expect(page).toHaveURL(/\/cadastro$/);
    const entrar = page.getByRole('link', { name: 'Entrar', exact: true });
    await expect(entrar).toBeInViewport();
    await entrar.click();
    await expect(page).toHaveURL(/\/entrar$/);
  });

  test('ao abrir o site sem sessão, cai no login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/entrar/);
    await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible();
  });

  test('com sessão ativa, login e cadastro vão direto para o início', async ({ page }) => {
    await cadastrarPelaApi(page, novaConta('Nina'));
    for (const rota of ['/entrar', '/cadastro']) {
      await page.goto(rota);
      await expect(page).toHaveURL(/\/inicio$/);
      await expect(page.getByText('Olá, Nina')).toBeVisible();
    }
  });

  test('o cookie de sessão é HttpOnly e o token não fica acessível ao JavaScript', async ({ page }) => {
    await cadastrarPelaApi(page);
    const cookie = (await page.context().cookies()).find((k) => k.name.includes('session_token'));
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe('Lax');
    await page.goto('/inicio');
    expect(await page.evaluate(() => document.cookie)).not.toContain('session_token');
  });
});

test.describe('Spec 01: recuperação de senha (R-01.8)', () => {
  test('esqueci a senha → e-mail → nova senha → entra com a nova', async ({ page, request }) => {
    const c = await cadastrarPelaApi(page);
    await page.context().clearCookies();
    await page.goto('/entrar');
    await page.getByRole('link', { name: 'Esqueci a senha' }).click();
    await page.getByLabel('E-mail da sua conta').fill(c.email);
    await page.getByRole('button', { name: 'Enviar link' }).click();
    await expect(page.getByText('Confira seu e-mail')).toBeVisible();

    const email = await ultimoEmail(request, c.email);
    const link = email.match(/https?:\/\/\S+reset-password\/\S+/)![0];
    await page.goto(link);
    await expect(page).toHaveURL(/\/nova-senha\?token=/);
    await page.getByLabel('Nova senha', { exact: true }).fill('Nova1234!');
    await page.getByLabel('Confirmar nova senha').fill('Nova1234!');
    await page.getByRole('button', { name: 'Salvar nova senha' }).click();
    await expect(page).toHaveURL(/\/entrar\?aviso=senha-redefinida/);
    await expect(page.getByText('Senha redefinida. Entre com a nova senha.')).toBeVisible();

    await entrarPelaTela(page, c.email, 'Nova1234!');
    await expect(page).toHaveURL(/\/inicio$/);

    // O mesmo link não vale duas vezes.
    await page.context().clearCookies();
    await page.goto(link);
    await expect(page.getByText('Link inválido ou expirado')).toBeVisible();
  });

  test('pedido para e-mail sem conta dá a mesma confirmação', async ({ page }) => {
    await page.goto('/esqueci-senha');
    await page.getByLabel('E-mail da sua conta').fill(novaConta().email);
    await page.getByRole('button', { name: 'Enviar link' }).click();
    await expect(page.getByText('Confira seu e-mail')).toBeVisible();
  });

  test('nova senha sem token oferece pedir outro link', async ({ page }) => {
    await page.goto('/nova-senha');
    await expect(page.getByText('Link inválido ou expirado')).toBeVisible();
    await page.getByRole('link', { name: 'Pedir novo link' }).click();
    await expect(page).toHaveURL(/\/esqueci-senha$/);
  });
});
