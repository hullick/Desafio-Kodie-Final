import { auth } from './auth.ts';

export type ObterSessao = (req: Request) => Promise<{ usuarioId: string } | null>;

/** Sessão do Better Auth a partir do cookie da requisição, ou null sem sessão válida. */
export const obterSessao: ObterSessao = async (req) => {
  const s = await auth.api.getSession({ headers: req.headers });
  return s ? { usuarioId: s.user.id } : null;
};
