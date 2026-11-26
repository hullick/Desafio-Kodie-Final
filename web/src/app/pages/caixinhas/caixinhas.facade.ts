import { Injectable, inject } from '@angular/core';
import { CaixinhasRepositorio } from '../../core/dados/repositorios';
import { carregavel } from '../../core/estado/carregavel';
import { DadosAlterados } from '../../core/estado/dados-alterados';
import { Preferencias } from '../../core/estado/preferencias';
import { MovimentoSheet } from '../../core/estado/sheets';
import { mesAtual } from '../../core/tempo/mes';
import { paraCaixinhaVM } from '../compartilhado/mapeadores';

/** Monta a lista de caixinhas: total, em andamento (prazo mais próximo) e atingidas (R-04.1). */
@Injectable()
export class CaixinhasFacade {
  private readonly repo = inject(CaixinhasRepositorio);
  private readonly alterados = inject(DadosAlterados);
  private readonly sheet = inject(MovimentoSheet);
  readonly oculto = inject(Preferencias).ocultarValores;

  private readonly dados = carregavel(
    () => this.alterados.versao(),
    async () => {
      const hoje = mesAtual();
      const todas = (await this.repo.listar()).map((c) => paraCaixinhaVM(c, hoje));
      return {
        totalCentavos: todas.reduce((a, c) => a + c.guardadoCentavos, 0),
        emAndamento: todas.filter((c) => c.estado !== 'atingida'),
        atingidas: todas.filter((c) => c.estado === 'atingida'),
        vazio: todas.length === 0,
      };
    },
  );
  readonly vm = this.dados.valor;
  readonly falhou = this.dados.falhou;

  guardar(id: string): void {
    this.sheet.abrir(id, 'guardar');
  }

  retirar(id: string): void {
    this.sheet.abrir(id, 'retirar');
  }
}
