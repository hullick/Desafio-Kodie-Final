import { Injectable } from '@angular/core';
import { BancoSemente, criarSemente } from './semente';

/** Armazenamento em memória compartilhado pelos repositórios de demonstração. */
@Injectable({ providedIn: 'root' })
export class BancoMemoria {
  dados: BancoSemente = criarSemente();
  private seq = 0;

  novoId(prefixo: string): string {
    this.seq += 1;
    return `${prefixo}-${Date.now().toString(36)}-${this.seq}`;
  }

  /** Atraso artificial para simular rede e permitir ver estados de carregamento. */
  async latencia<T>(valor: T, ms = 0): Promise<T> {
    if (ms > 0) await new Promise((r) => setTimeout(r, ms));
    return structuredClone(valor);
  }
}
