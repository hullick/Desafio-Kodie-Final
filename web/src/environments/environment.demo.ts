import pkg from '../../package.json';

/** Demonstração sem backend: dados em memória, já logado como a persona (npm run start:demo). */
export const environment = {
  producao: false,
  versao: pkg.version,
  dados: 'memoria' as 'http' | 'memoria',
};
