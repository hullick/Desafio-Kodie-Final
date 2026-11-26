import { randomUUID } from 'node:crypto';
import { betterAuth } from 'better-auth';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import pg from 'pg';
import { checarSenha, nomeValido } from '../../web/src/app/core/calculos/senha.ts';
import { cifrar } from './cripto.ts';
import { emailRedefinicao, enviarEmail } from './email.ts';

/**
 * Better Auth em /api/auth/* (spec 01, ADR 0001). Faz hash de senha (scrypt), sessão em cookie
 * HttpOnly, redefinição de senha por e-mail, troca de senha, exclusão de conta e rate limit.
 * Conecta como nubanko_auth, o único papel com acesso ao schema auth.
 *
 * Decisões do time aplicadas aqui:
 * - Sem confirmação de e-mail: o cadastro já entra na conta (autoSignIn).
 * - O nome da pessoa nunca fica em claro: o hook de criação gera o id, cifra o nome com a chave
 *   desse id e a trigger criar_perfil o move para perfis.nome_cifrado.
 */

export const POLITICA_VERSAO = '2026-11';

const url = process.env['DATABASE_URL_AUTH'];
if (!url) throw new Error('DATABASE_URL_AUTH não definida');
const baseURL = process.env['BETTER_AUTH_URL'];
if (!baseURL) throw new Error('BETTER_AUTH_URL não definida');

const erro = (status: 'BAD_REQUEST', code: string, message: string) => new APIError(status, { code, message });

/** Rotas que recebem senha nova e o campo onde ela vem. */
const SENHA_NOVA: Record<string, string> = {
  '/sign-up/email': 'password',
  '/reset-password': 'newPassword',
  '/change-password': 'newPassword',
};

/** Rotas cuja resposta traz o token da sessão no corpo (ele fica só no cookie). */
const ROTAS_COM_TOKEN = new Set(['/sign-up/email', '/sign-in/email', '/change-password']);

export const auth = betterAuth({
  appName: 'NuBanko',
  baseURL,
  basePath: '/api/auth',
  secret: process.env['BETTER_AUTH_SECRET'],
  trustedOrigins: [new URL(baseURL).origin],
  telemetry: { enabled: false },
  database: new pg.Pool({ connectionString: url, options: '-c search_path=auth', max: 3 }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url: link }) => {
      const m = emailRedefinicao(link);
      await enviarEmail({ para: user.email, ...m });
    },
  },

  user: {
    additionalFields: {
      aceiteVersao: { type: 'string', required: true, input: true, returned: false },
    },
    deleteUser: { enabled: true },
  },

  // Só o que o app usa fica exposto.
  disabledPaths: [
    '/update-user', '/change-email', '/send-verification-email', '/verify-email',
    '/sign-in/social', '/link-social', '/unlink-account', '/list-accounts', '/get-access-token',
    '/refresh-token', '/account-info', '/set-password', '/delete-user/callback',
  ],

  rateLimit: {
    enabled: process.env['NUBANKO_RATE_LIMIT'] !== 'desligado',
    storage: 'database',
    window: 60,
    max: 100,
    customRules: {
      '/sign-in/email': { window: 60, max: 5 },
      '/sign-up/email': { window: 60, max: 3 },
      '/request-password-reset': { window: 60, max: 3 },
      '/change-password': { window: 60, max: 5 },
      '/delete-user': { window: 60, max: 5 },
    },
  },

  advanced: {
    // Explícito: o Better Auth desliga essas checagens sozinho quando NODE_ENV=test,
    // e os testes precisam exercitar as mesmas proteções da produção.
    disableOriginCheck: false,
    disableCSRFCheck: false,
    cookiePrefix: 'nubanko',
    useSecureCookies: baseURL.startsWith('https://'),
    defaultCookieAttributes: { sameSite: 'lax', httpOnly: true },
    ipAddress: { ipAddressHeaders: ['x-nf-client-connection-ip', 'x-forwarded-for'] },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      const campo = SENHA_NOVA[ctx.path];
      if (campo) {
        const senha = (ctx.body as Record<string, unknown> | undefined)?.[campo];
        if (typeof senha !== 'string' || !checarSenha(senha).valida) {
          throw erro('BAD_REQUEST', 'SENHA_FRACA', 'A senha precisa de 8+ caracteres, 1 número e 1 símbolo.');
        }
      }
      if (ctx.path === '/sign-up/email') {
        const corpo = ctx.body as Record<string, unknown>;
        if (corpo['aceiteVersao'] !== POLITICA_VERSAO) {
          throw erro('BAD_REQUEST', 'ACEITE_OBRIGATORIO', 'É preciso aceitar a versão atual dos Termos e da Política.');
        }
        if (typeof corpo['name'] !== 'string' || !nomeValido(corpo['name'])) {
          throw erro('BAD_REQUEST', 'NOME_INVALIDO', 'O nome precisa ter de 2 a 40 caracteres.');
        }
        if (typeof corpo['email'] === 'string') corpo['email'] = corpo['email'].trim().toLowerCase();
      }
      if (ctx.path === '/sign-in/email' || ctx.path === '/request-password-reset') {
        const corpo = ctx.body as Record<string, unknown>;
        if (typeof corpo?.['email'] === 'string') corpo['email'] = corpo['email'].trim().toLowerCase();
      }
    }),
    // Cadastro, login e troca de senha: (1) o token da sessão sai do corpo JSON, para existir só no cookie
    // HttpOnly, fora do alcance de JavaScript; (2) o cadastro traria o nome cifrado (o valor
    // antes da trigger), então devolve vazio como as outras rotas. O nome vem de GET /api/perfil.
    after: createAuthMiddleware(async (ctx) => {
      if (!ROTAS_COM_TOKEN.has(ctx.path)) return;
      const r = ctx.context.returned as { token?: unknown; user?: Record<string, unknown> } | undefined;
      if (!r || typeof r !== 'object' || !r.user) return;
      const { token: _token, ...resto } = r;
      return ctx.json({ ...resto, user: { ...r.user, name: '' } });
    }),
  },

  databaseHooks: {
    // (o nome cifrado é movido para perfis e esvaziado em auth.user pela trigger criar_perfil)
    user: {
      create: {
        before: async (user) => {
          const id = randomUUID();
          return { data: { ...user, id, name: cifrar(id, `perfis.nome:${id}`, user.name.trim()) } };
        },
      },
    },
  },
});
