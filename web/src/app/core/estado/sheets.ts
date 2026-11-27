import { Injectable, signal } from '@angular/core';
import { TipoMovimento } from '../dominio/tipos';

/** Controla o bottom sheet de novo/editar lançamento (R-02.1, R-02.9). */
@Injectable({ providedIn: 'root' })
export class LancamentoSheet {
  private readonly _aberto = signal(false);
  private readonly _emEdicao = signal<string | null>(null);
  readonly aberto = this._aberto.asReadonly();
  readonly emEdicao = this._emEdicao.asReadonly();

  abrir(idParaEditar?: string): void {
    this._emEdicao.set(idParaEditar ?? null);
    this._aberto.set(true);
  }

  fechar(): void {
    this._aberto.set(false);
    this._emEdicao.set(null);
  }
}

export interface PedidoMovimento {
  readonly caixinhaId: string;
  readonly tipo: TipoMovimento;
}

/** Controla o bottom sheet de guardar/retirar (R-04.5). */
@Injectable({ providedIn: 'root' })
export class MovimentoSheet {
  private readonly _pedido = signal<PedidoMovimento | null>(null);
  readonly pedido = this._pedido.asReadonly();

  abrir(caixinhaId: string, tipo: TipoMovimento): void {
    this._pedido.set({ caixinhaId, tipo });
  }

  fechar(): void {
    this._pedido.set(null);
  }
}
