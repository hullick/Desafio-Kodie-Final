import pkg from '../../package.json';

/** Configuração de ambiente. As chaves do Supabase entram no plan 00 (tarefa 4). */
export const environment = {
  producao: false,
  versao: pkg.version,
};
