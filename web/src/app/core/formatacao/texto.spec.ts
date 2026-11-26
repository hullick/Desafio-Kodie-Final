import { iniciais, primeiroNome } from './texto';

describe('texto', () => {
  it('gera iniciais', () => {
    expect(iniciais('Larissa Santos')).toBe('LS');
    expect(iniciais('Lari')).toBe('L');
    expect(iniciais('  ana  maria souza ')).toBe('AS');
    expect(iniciais('   ')).toBe('');
  });

  it('extrai o primeiro nome', () => {
    expect(primeiroNome(' Larissa Santos')).toBe('Larissa');
    expect(primeiroNome('')).toBe('');
  });
});
