import pkg from '../../package.json';

/**
 * Build de produção (Netlify). "Esqueci a senha" fica desligado enquanto não houver SMTP:
 * o link some do login e as rotas /esqueci-senha e /nova-senha não existem. Para religar,
 * configure o SMTP na Netlify e troque recuperacaoSenha para true (DESENVOLVIMENTO.md, seção 14).
 */
export const environment = {
  producao: true,
  versao: pkg.version,
  dados: 'http' as 'http' | 'memoria',
  recuperacaoSenha: false,
};
