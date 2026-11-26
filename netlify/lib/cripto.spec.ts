import { describe, expect, it } from 'vitest';
import { cifrar, decifrar, ErroCripto } from './cripto.ts';

// O mesmo formato que o check app.eh_cifrado do banco exige.
const FORMATO_DO_BANCO = /^v1\.[A-Za-z0-9_-]{16}\.[A-Za-z0-9_-]{22,}$/;

describe('cripto', () => {
  it('cifra e decifra com o mesmo dono e o mesmo contexto', () => {
    const c = cifrar('u1', 'caixinhas.nome:c1', 'Celular novo 📱');
    expect(c).toMatch(FORMATO_DO_BANCO);
    expect(c).not.toContain('Celular');
    expect(decifrar('u1', 'caixinhas.nome:c1', c)).toBe('Celular novo 📱');
  });

  it('texto vazio também fica no formato do banco', () => {
    expect(cifrar('u1', 'perfis.nome:u1', '')).toMatch(FORMATO_DO_BANCO);
  });

  it('o mesmo texto cifra diferente a cada vez (IV aleatório)', () => {
    expect(cifrar('u1', 'caixinhas.nome:c1', 'Viagem')).not.toBe(cifrar('u1', 'caixinhas.nome:c1', 'Viagem'));
  });

  it('outro usuário não decifra (chave por usuário)', () => {
    const c = cifrar('u1', 'caixinhas.nome:c1', 'Reserva');
    expect(() => decifrar('u2', 'caixinhas.nome:c1', c)).toThrow(ErroCripto);
  });

  it('o texto movido para outra linha ou coluna não decifra (AAD)', () => {
    const c = cifrar('u1', 'caixinhas.nome:c1', 'Reserva');
    expect(() => decifrar('u1', 'caixinhas.nome:c2', c)).toThrow(ErroCripto);
    expect(() => decifrar('u1', 'lancamentos.descricao:c1', c)).toThrow(ErroCripto);
  });

  it('texto adulterado ou fora do formato é recusado', () => {
    const c = cifrar('u1', 'perfis.nome:u1', 'Lari');
    const adulterado = c.slice(0, -2) + (c.endsWith('A') ? 'BB' : 'AA');
    expect(() => decifrar('u1', 'perfis.nome:u1', adulterado)).toThrow(ErroCripto);
    expect(() => decifrar('u1', 'perfis.nome:u1', 'Lari')).toThrow(ErroCripto);
    expect(() => decifrar('u1', 'perfis.nome:u1', 'v2.abc.def')).toThrow(ErroCripto);
  });
});
