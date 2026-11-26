import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { CaixinhasRepositorio, ErroCaixinha } from '../../core/dados/repositorios';
import { carregavel } from '../../core/estado/carregavel';
import { DadosAlterados } from '../../core/estado/dados-alterados';
import { MovimentoSheet } from '../../core/estado/sheets';
import { ToastService } from '../../core/estado/toast';
import { formatBRL } from '../../core/formatacao/dinheiro';
import { hojeISO, mesAtual } from '../../core/tempo/mes';
import { paraCaixinhaVM, paraMovimentoVM } from '../compartilhado/mapeadores';

/** Monta o detalhe da caixinha: anel, cards, histórico, guardar/retirar, editar/excluir (R-04.4, R-04.7). */
@Injectable()
export class CaixinhaDetalheFacade {
  private readonly repo = inject(CaixinhasRepositorio);
  private readonly alterados = inject(DadosAlterados);
  private readonly sheet = inject(MovimentoSheet);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  readonly id = toSignal(inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('id') ?? '')), { requireSync: true });

  private readonly dados = carregavel(
    () => ({ id: this.id(), versao: this.alterados.versao() }),
    async ({ id }) => {
      const [c, movs] = await Promise.all([this.repo.obter(id), this.repo.movimentos(id)]);
      const hoje = hojeISO();
      return { caixinha: paraCaixinhaVM(c, mesAtual()), movimentos: movs.map((m) => paraMovimentoVM(m, hoje)) };
    },
  );
  readonly vm = this.dados.valor;
  readonly naoEncontrada = this.dados.falhou;
  readonly linkEditar = computed(() => `/caixinhas/${this.id()}/editar`);
  readonly erro = signal<string | null>(null);

  guardar(): void {
    this.sheet.abrir(this.id(), 'guardar');
  }

  retirar(): void {
    this.sheet.abrir(this.id(), 'retirar');
  }

  async excluir(): Promise<void> {
    this.erro.set(null);
    try {
      await this.repo.excluir(this.id());
      this.alterados.notificar();
      this.toast.mostrar('Caixinha excluída');
      await this.router.navigate(['/caixinhas'], { replaceUrl: true });
    } catch (e) {
      const saldo = this.vm()?.caixinha.guardadoCentavos ?? 0;
      this.erro.set(e instanceof ErroCaixinha && e.codigo === 'caixinha_com_saldo'
        ? `Retire os ${formatBRL(saldo)} antes de excluir esta caixinha.`
        : 'Não foi possível excluir. Tente de novo.');
    }
  }
}
