/** Teclas do teclado numérico (R-02.3). "00" substitui a vírgula do mockup. */
export type Tecla = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '00' | 'apagar';

export const MAX_CENTAVOS = 99_999_999;

/** Entrada da direita para a esquerda, em centavos. */
export function teclar(centavos: number, tecla: Tecla): number {
  if (tecla === 'apagar') return Math.floor(centavos / 10);
  const proximo = Number(`${centavos}${tecla}`);
  return proximo > MAX_CENTAVOS ? centavos : proximo;
}

/** Converte qualquer texto digitado em centavos, usando só os dígitos. */
export function centavosDeTexto(texto: string): number {
  const digitos = texto.replace(/\D/g, '').replace(/^0+/, '');
  if (!digitos) return 0;
  const n = Number(digitos);
  return n > MAX_CENTAVOS ? MAX_CENTAVOS : n;
}
