import type { Config } from '@netlify/functions';
import { auth } from '../lib/auth.ts';
import { exigirMesmaOrigem } from '../lib/http.ts';

/**
 * /api/auth/*: Better Auth (cadastro, login, sessão, saída, redefinição e troca de senha,
 * exclusão de conta). Não usa comUsuario: é quem cria a sessão. Contrato em docs/api/openapi.yaml.
 */
export default async (req: Request): Promise<Response> => {
  // R-00.7: o Better Auth só confere a origem quando já há cookie; aqui vale para toda escrita,
  // inclusive cadastro e login (evita login CSRF).
  try {
    exigirMesmaOrigem(req);
  } catch {
    return Response.json({ code: 'INVALID_ORIGIN', message: 'Invalid origin' }, { status: 403 });
  }
  return auth.handler(req);
};

export const config: Config = { path: '/api/auth/*' };
