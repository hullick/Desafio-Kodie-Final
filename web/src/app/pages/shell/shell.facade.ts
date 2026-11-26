import { Injectable, computed, inject } from '@angular/core';
import { PerfilRepositorio } from '../../core/dados/repositorios';
import { carregavel } from '../../core/estado/carregavel';
import { DadosAlterados } from '../../core/estado/dados-alterados';
import { LancamentoSheet } from '../../core/estado/sheets';
import { ToastService } from '../../core/estado/toast';

/** Monta a casca: nome no topo, toast global e o "+" (R-02.1, U-00.7). */
@Injectable()
export class ShellFacade {
  private readonly perfil = inject(PerfilRepositorio);
  private readonly alterados = inject(DadosAlterados);
  private readonly sheet = inject(LancamentoSheet);

  private readonly dados = carregavel(() => this.alterados.versao(), () => this.perfil.obter());
  readonly nome = computed(() => this.dados.valor()?.nome ?? '');
  readonly toast = inject(ToastService).atual;

  novoLancamento(): void {
    this.sheet.abrir();
  }
}
