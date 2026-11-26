import { checarSenha, emailValido, nomeValido } from './senha';

describe('validações de cadastro (R-01.1, R-01.2)', () => {
  it('checa a força da senha', () => {
    expect(checarSenha('abcdefg1!').valida).toBe(true);
    expect(checarSenha('abcdefgh!')).toMatchObject({ numero: false, valida: false });
    expect(checarSenha('abcdefg1')).toMatchObject({ simbolo: false, valida: false });
    expect(checarSenha('a1!')).toMatchObject({ oitoMais: false, valida: false });
  });

  it('valida nome', () => {
    expect(nomeValido('   ')).toBe(false);
    expect(nomeValido('L')).toBe(false);
    expect(nomeValido('Lari')).toBe(true);
    expect(nomeValido('x'.repeat(41))).toBe(false);
  });

  it('valida e-mail', () => {
    expect(emailValido(' lari@exemplo.com ')).toBe(true);
    expect(emailValido('lari@exemplo')).toBe(false);
  });
});
