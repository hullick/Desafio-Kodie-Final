import { APIRequestContext, Page, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';

/** Apoio da suíte E2E: contas reais, e-mail pelo Mailpit e atalhos de tela. */

export const BASE = process.env['E2E_URL'] ?? 'http://localhost:8888';
export const SENHA = 'Senha123!';
export const MAILPIT = process.env['E2E_MAILPIT'] ?? 'http://localhost:8025';
const DOMINIO = 'e2e.nubanko.dev';

export interface Conta {
  nome: string;
  email: string;
  senha: string;
}

export const novaConta = (nome = 'Lari'): Conta => ({ nome, email: `e2e-${randomUUID()}@${DOMINIO}`, senha: SENHA });

/** Cria a conta pela API, no contexto da página: o cookie de sessão fica no navegador. */
export async function cadastrarPelaApi(page: Page, conta = novaConta()): Promise<Conta> {
  const r = await page.request.post('/api/auth/sign-up/email', {
    headers: { origin: BASE },
    data: { name: conta.nome, email: conta.email, password: conta.senha, aceiteVersao: '2026-11' },
  });
  expect(r.status(), await r.text()).toBe(200);
  return conta;
}

export async function entrarPelaTela(page: Page, email: string, senha: string): Promise<void> {
  await page.goto('/entrar');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(senha);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
}

/** Digita um valor (em centavos) no teclado numérico próprio. */
export async function teclar(page: Page, centavos: number): Promise<void> {
  const teclado = page.getByLabel('Teclado numérico');
  for (const d of String(centavos)) await teclado.getByRole('button', { name: d, exact: true }).click();
}

/** Último e-mail recebido pelo endereço, esperando até ele chegar. */
export async function ultimoEmail(request: APIRequestContext, para: string): Promise<string> {
  let texto = '';
  await expect.poll(async () => {
    const busca = await request.get(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${para}"`)}`);
    const { messages } = (await busca.json()) as { messages: { ID: string }[] };
    if (!messages?.length) return false;
    const msg = await request.get(`${MAILPIT}/api/v1/message/${messages[0].ID}`);
    texto = ((await msg.json()) as { Text: string }).Text;
    return true;
  }, { timeout: 10_000 }).toBe(true);
  return texto;
}
