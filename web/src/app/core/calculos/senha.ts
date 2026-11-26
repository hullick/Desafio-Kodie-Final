export interface ChecagemSenha {
  readonly oitoMais: boolean;
  readonly numero: boolean;
  readonly simbolo: boolean;
  readonly valida: boolean;
}

/** Regra R-01.2: 8+ caracteres, 1 número e 1 símbolo. */
export function checarSenha(senha: string): ChecagemSenha {
  const oitoMais = senha.length >= 8;
  const numero = /\d/.test(senha);
  const simbolo = /[^\p{L}\p{N}\s]/u.test(senha);
  return { oitoMais, numero, simbolo, valida: oitoMais && numero && simbolo };
}

/** Regra R-01.1: nome entre 2 e 40 caracteres após trim. */
export function nomeValido(nome: string): boolean {
  const n = nome.trim().length;
  return n >= 2 && n <= 40;
}

export function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
