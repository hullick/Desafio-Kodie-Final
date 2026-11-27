/**
 * Endereço público do site, usado como baseURL do Better Auth e na checagem de origem.
 *
 * - BETTER_AUTH_URL, quando definida (local e produção: o domínio oficial).
 * - Senão, a URL do próprio deploy que a Netlify injeta (DEPLOY_PRIME_URL em deploy previews
 *   e branch deploys; URL no site principal). Assim um preview aceita o login no próprio endereço.
 */
export function urlDoSite(): string {
  const url = process.env['BETTER_AUTH_URL'] || process.env['DEPLOY_PRIME_URL'] || process.env['URL'];
  if (!url) throw new Error('BETTER_AUTH_URL não definida');
  return url;
}
