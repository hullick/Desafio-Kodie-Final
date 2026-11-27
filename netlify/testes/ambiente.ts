// Ambiente dos testes de integração. Dentro do container app, as variáveis já vêm do compose;
// aqui só se desliga o rate limit (os testes cadastram muitas contas do mesmo "IP").
process.env['NUBANKO_RATE_LIMIT'] = 'desligado';
for (const v of ['DATABASE_URL', 'DATABASE_URL_AUTH', 'BETTER_AUTH_URL', 'BETTER_AUTH_SECRET', 'NUBANKO_CHAVE_DADOS']) {
  if (!process.env[v]) {
    throw new Error(`${v} não definida: rode os testes no container (docker compose exec app npm test)`);
  }
}
