import { Injectable, inject, signal } from '@angular/core';
import { CaixinhasRepositorio, ErroCaixinha } from '../../core/dados/repositorios';
import { NovoMovimento } from '../../core/dominio/tipos';
import { carregavel } from '../../core/estado/carregavel';
import { DadosAlterados } from '../../core/estado/dados-alterados';
import { MovimentoSheet } from '../../core/estado/sheets';
import { ToastService } from '../../core/estado/toast';
import { formatBRL } from '../../core/formatacao/dinheiro';
import { ERRO_SALVAR } from './lancamento-sheet.facade';

/** Monta o sheet de guardar/retirar (R-04.5, R-04.6, U-04.4). */
@Injectable()
export class MovimentoSheetFacade {
  private readonly repo = inject(CaixinhasRepositorio);
  private readonly sheet = inject(MovimentoSheet);
  private readonly alterados = inject(DadosAlterados);
  private readonly toast = inject(ToastService);

  readonly pedido = this.sheet.pedido;
  private readonly dados = carregavel(
    () => this.sheet.pedido()?.caixinhaId ?? null,
    (id) => (id ? this.repo.obter(id) : Promise.resolve(null)),
  );
  readonly caixinha = this.dados.valor;
  readonly salvando = signal(false);
  readonly erro = signal<string | null>(null);

  async salvar(mov: NovoMovimento): Promise<void> {
    const c = this.caixinha();
    if (!c) return;
    this.salvando.set(true);
    this.erro.set(null);
    try {
      await this.repo.movimentar(c.id, mov);
      this.alterados.notificar();
      this.toast.mostrar(mov.tipo === 'guardar' ? `Guardado em ${c.nome}` : `Retirado de ${c.nome}`);
      this.fechar();
    } catch (e) {
      this.erro.set(e instanceof ErroCaixinha && e.codigo === 'saldo_insuficiente'
        ? `Você tem ${formatBRL(c.saldoCentavos)} nesta caixinha.`
        : ERRO_SALVAR);
    } finally {
      this.salvando.set(false);
    }
  }

  fechar(): void {
    this.erro.set(null);
    this.sheet.fechar();
  }
}
