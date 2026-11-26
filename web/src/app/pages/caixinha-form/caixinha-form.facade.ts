import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { CaixinhasRepositorio } from '../../core/dados/repositorios';
import { DadosCaixinha } from '../../core/dominio/tipos';
import { carregavel } from '../../core/estado/carregavel';
import { DadosAlterados } from '../../core/estado/dados-alterados';
import { ToastService } from '../../core/estado/toast';
import { mesAtual } from '../../core/tempo/mes';
import { ERRO_SALVAR } from '../shell/lancamento-sheet.facade';

/** Monta a tela de nova caixinha ou de edição (/caixinhas/:id/editar) (R-04.3, R-04.7). */
@Injectable()
export class CaixinhaFormFacade {
  private readonly repo = inject(CaixinhasRepositorio);
  private readonly alterados = inject(DadosAlterados);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  readonly id = toSignal(inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('id'))), { requireSync: true });

  private readonly existente = carregavel(() => this.id(), (id) => (id ? this.repo.obter(id) : Promise.resolve(null)));
  readonly editando = computed(() => this.id() !== null);
  readonly pronto = computed(() => !this.editando() || !!this.existente.valor());
  readonly inicial = computed<DadosCaixinha | null>(() => {
    const c = this.existente.valor();
    return c ? { nome: c.nome, icone: c.icone, metaCentavos: c.metaCentavos, prazo: c.prazo } : null;
  });
  readonly saldoCentavos = computed(() => this.existente.valor()?.saldoCentavos ?? 0);
  readonly hoje = mesAtual();
  readonly voltarPara = computed(() => (this.id() ? `/caixinhas/${this.id()}` : '/caixinhas'));
  readonly salvando = signal(false);
  readonly erro = signal<string | null>(null);

  async salvar(dados: DadosCaixinha): Promise<void> {
    const id = this.id();
    this.salvando.set(true);
    this.erro.set(null);
    try {
      const c = id ? await this.repo.editar(id, dados) : await this.repo.criar(dados);
      this.alterados.notificar();
      this.toast.mostrar(id ? 'Caixinha atualizada' : 'Caixinha criada');
      await this.router.navigate(['/caixinhas', c.id], { replaceUrl: true });
    } catch {
      this.erro.set(ERRO_SALVAR);
    } finally {
      this.salvando.set(false);
    }
  }
}
