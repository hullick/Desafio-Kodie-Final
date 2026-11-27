import { Injectable, signal } from '@angular/core';

const CHAVE_OCULTAR = 'nubanko.ocultarValores';

/** Preferências locais do aparelho (R-03.3). */
@Injectable({ providedIn: 'root' })
export class Preferencias {
  private readonly _ocultarValores = signal(ler(CHAVE_OCULTAR) === '1');
  readonly ocultarValores = this._ocultarValores.asReadonly();

  alternarOcultarValores(): void {
    const novo = !this._ocultarValores();
    this._ocultarValores.set(novo);
    gravar(CHAVE_OCULTAR, novo ? '1' : '0');
  }
}

function ler(chave: string): string | null {
  try { return globalThis.localStorage?.getItem(chave) ?? null; } catch { return null; }
}
function gravar(chave: string, valor: string): void {
  try { globalThis.localStorage?.setItem(chave, valor); } catch { /* modo privado: ignora */ }
}
