import { randomUUID } from 'node:crypto';
import type { Context } from '@netlify/functions';
import pg from 'pg';
import authHandler from '../functions/auth.mts';

/** Apoio dos testes de integração: contas reais pelo Better Auth e chamadas aos handlers. */

export const BASE = process.env['BETTER_AUTH_URL']!;
export const SENHA = 'Senha123!';
const DOMINIO = 'teste.nubanko.dev';

type HandlerFn = (req: Request, ctx: Context) => Promise<Response> | Response;

export interface Conta {
  id: string;
  email: string;
  nome: string;
  cookie: string;
}

/** "a=1; b=2" a partir dos Set-Cookie de uma resposta. */
export function cookieDe(res: Response): string {
  return res.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ');
}

export async function chamarAuth(
  caminho: string, corpo?: unknown, cookie?: string, metodo = 'POST', origem = BASE,
): Promise<Response> {
  const headers: Record<string, string> = { origin: origem };
  if (corpo !== undefined) headers['content-type'] = 'application/json';
  if (cookie) headers['cookie'] = cookie;
  return authHandler(new Request(`${BASE}/api/auth${caminho}`, {
    method: metodo, headers, body: corpo === undefined ? undefined : JSON.stringify(corpo),
  }));
}

export function emailNovo(): string {
  return `t-${randomUUID()}@${DOMINIO}`;
}

export async function cadastrar(nome = 'Lari Teste'): Promise<Conta> {
  const email = emailNovo();
  const res = await chamarAuth('/sign-up/email', { name: nome, email, password: SENHA, aceiteVersao: '2026-11' });
  if (res.status !== 200) throw new Error(`cadastro falhou: ${res.status} ${await res.text()}`);
  const corpo = (await res.json()) as { user: { id: string } };
  return { id: corpo.user.id, email, nome, cookie: cookieDe(res) };
}

export interface Chamada {
  conta?: Conta;
  corpo?: unknown;
  params?: Record<string, string>;
  origem?: string;
  tipo?: string;
}

/** Chama o handler de uma function como o Netlify faria. */
export async function chamar(handler: HandlerFn, metodo: string, caminho: string, c: Chamada = {}): Promise<Response> {
  const headers: Record<string, string> = {};
  if (c.conta) headers['cookie'] = c.conta.cookie;
  if (c.origem) headers['origin'] = c.origem;
  if (c.corpo !== undefined) headers['content-type'] = c.tipo ?? 'application/json';
  const req = new Request(`${BASE}${caminho}`, {
    method: metodo,
    headers,
    body: c.corpo === undefined ? undefined : typeof c.corpo === 'string' ? c.corpo : JSON.stringify(c.corpo),
  });
  return handler(req, { params: c.params ?? {} } as unknown as Context);
}

/** Pool como nubanko_auth (vê o schema auth) para conferir e limpar o que os testes criaram. */
export const poolAuth = new pg.Pool({ connectionString: process.env['DATABASE_URL_AUTH'], options: '-c search_path=auth', max: 2 });

/** Lê linhas cruas de uma tabela de domínio como o próprio dono (RLS), para conferir a cifra. */
export async function linhasCruas<T extends pg.QueryResultRow>(conta: Conta, sql: string, params: unknown[] = []): Promise<T[]> {
  const pool = new pg.Pool({ connectionString: process.env['DATABASE_URL'], max: 1 });
  const c = await pool.connect();
  try {
    await c.query('begin');
    await c.query("select set_config('app.user_id', $1, true)", [conta.id]);
    const r = await c.query<T>(sql, params);
    await c.query('rollback');
    return r.rows;
  } finally {
    c.release();
    await pool.end();
  }
}

export async function limparContas(): Promise<void> {
  await poolAuth.query(`delete from "user" where email like $1`, [`%@${DOMINIO}`]);
}

export async function ultimoEmail(para: string): Promise<{ texto: string } | null> {
  const mail = `http://${process.env['SMTP_HOST'] ?? 'mail'}:8025`;
  const busca = await fetch(`${mail}/api/v1/search?query=${encodeURIComponent(`to:"${para}"`)}`);
  const { messages } = (await busca.json()) as { messages: { ID: string }[] };
  if (!messages?.length) return null;
  const msg = await fetch(`${mail}/api/v1/message/${messages[0].ID}`);
  const { Text } = (await msg.json()) as { Text: string };
  return { texto: Text };
}

export const hoje = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());

export function diasAntes(n: number): string {
  const d = new Date(`${hoje()}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

export function diasDepois(n: number): string {
  return diasAntes(-n);
}
