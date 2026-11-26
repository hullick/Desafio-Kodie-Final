import type { Config } from '@netlify/functions';
import { pool } from '../lib/db.ts';
import { json } from '../lib/http.ts';

/** GET /api/saude: confirma que a function sobe e alcança o banco. Sem sessão. */
export default async (): Promise<Response> => {
  try {
    await pool.query('select 1');
    return json({ ok: true });
  } catch {
    return json({ ok: false, erro: 'banco_indisponivel' }, 503);
  }
};

export const config: Config = { path: '/api/saude', method: 'GET' };
