import { Injectable, effect, inject, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { LancamentosRepositorio } from '../../core/dados/repositorios';
import { carregavel } from '../../core/estado/carregavel';
import { DadosAlterados } from '../../core/estado/dados-alterados';
import { Preferencias } from '../../core/estado/preferencias';
import { LancamentoSheet } from '../../core/estado/sheets';
import { compararMes, hojeISO } from '../../core/tempo/mes';
import { agruparPorDia } from '../compartilhado/mapeadores';
import { mesNavegavel } from '../compartilhado/mes-navegavel';

/** Monta a lista "Ver todos" do mês, agrupada por dia (R-02.8). O mês fica na URL (?ano=&mes=). */
@Injectable()
export class LancamentosFacade {
  private readonly repo = inject(LancamentosRepositorio);
  private readonly alterados = inject(DadosAlterados);
  private readonly sheet = inject(LancamentoSheet);
  private readonly router = inject(Router);
  private readonly rota = inject(ActivatedRoute);
  private readonly query = toSignal(this.rota.queryParamMap, { requireSync: true });

  readonly mes = mesNavegavel();
  readonly oculto = inject(Preferencias).ocultarValores;

  private readonly dados = carregavel(
    () => ({ mes: this.mes.mes(), versao: this.alterados.versao() }),
    async ({ mes }) => agruparPorDia(await this.repo.listarDoMes(mes), hojeISO()),
  );
  readonly grupos = this.dados.valor;
  readonly carregando = this.dados.carregando;

  constructor() {
    effect(() => {
      const ano = Number(this.query().get('ano'));
      const mes = Number(this.query().get('mes'));
      if (ano && mes >= 1 && mes <= 12) untracked(() => this.mes.ir({ ano, mes }));
    });
    effect(() => {
      const m = this.mes.mes();
      const q = untracked(this.query);
      if (compararMes(m, { ano: Number(q.get('ano')), mes: Number(q.get('mes')) }) !== 0) {
        untracked(() => this.router.navigate([], { queryParams: { ano: m.ano, mes: m.mes }, replaceUrl: true }));
      }
    });
  }

  editar(id: string): void {
    this.sheet.abrir(id);
  }
}
