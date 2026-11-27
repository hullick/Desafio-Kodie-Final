import { HttpErrorResponse } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';

/** Um item de `detalhes` dos erros 400 da API (docs/api/openapi.yaml, schema Detalhe). */
export interface DetalheErro {
  readonly campo: string;
  readonly problema: string;
}

/**
 * Erro de uma chamada à API. `codigo` vem do corpo (`erro` nas rotas de domínio, `code` nas de
 * /api/auth/*); sem corpo (rede caiu, servidor fora), o código é `rede` e o status, 0.
 */
export class ErroApi extends Error {
  constructor(
    readonly status: number,
    readonly codigo: string,
    readonly detalhes: readonly DetalheErro[] = [],
  ) {
    super(`${status} ${codigo}`);
  }
}

export function paraErroApi(e: unknown): ErroApi {
  if (e instanceof ErroApi) return e;
  if (e instanceof HttpErrorResponse) {
    const corpo = (e.error ?? {}) as { erro?: string; code?: string; detalhes?: DetalheErro[] };
    if (e.status === 0) return new ErroApi(0, 'rede');
    return new ErroApi(e.status, corpo.erro ?? corpo.code ?? 'desconhecido', corpo.detalhes ?? []);
  }
  return new ErroApi(0, 'desconhecido');
}

/** Primeira emissão do observable como Promise, com o erro já convertido em ErroApi. */
export async function requisitar<T>(obs: Observable<T>): Promise<T> {
  try {
    return await firstValueFrom(obs);
  } catch (e) {
    throw paraErroApi(e);
  }
}
