import { rotasDeRecuperacao } from './app.routes';

describe('rotasDeRecuperacao', () => {
  it('com SMTP, expõe /esqueci-senha e /nova-senha', () => {
    expect(rotasDeRecuperacao(true).map((r) => r.path)).toEqual(['esqueci-senha', 'nova-senha']);
  });

  it('sem SMTP (produção hoje), as rotas não existem e caem no fallback', () => {
    expect(rotasDeRecuperacao(false)).toEqual([]);
  });
});
