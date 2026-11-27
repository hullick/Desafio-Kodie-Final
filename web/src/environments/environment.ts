import pkg from '../../package.json';

/**
 * Configuração de ambiente.
 * dados: 'http' usa a API real em /api/* (rode com o docker compose, http://localhost:8888);
 *        'memoria' usa os dados de demonstração, sem backend (npm run start:demo).
 */
export const environment = {
  producao: false,
  versao: pkg.version,
  dados: 'http' as 'http' | 'memoria',
  /** "Esqueci a senha" depende de SMTP. Ligado aqui porque o compose tem o Mailpit. */
  recuperacaoSenha: true,
};
