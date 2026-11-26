import pg from 'pg';

/**
 * Pool de conexões, criado uma vez por instância da function e reaproveitado
 * entre invocações "quentes". Conecta como nubanko_app (sem BYPASSRLS).
 * Em produção, DATABASE_URL é a URL *pooled* do Netlify DB (Neon), com TLS.
 */
const url = process.env['DATABASE_URL'];
if (!url) {
  throw new Error('DATABASE_URL não definida');
}

export const pool = new pg.Pool({
  connectionString: url,
  max: 3,
  idleTimeoutMillis: 10_000,
});
