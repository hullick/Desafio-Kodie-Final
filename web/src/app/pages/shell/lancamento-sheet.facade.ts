import { Injectable, computed, inject, signal } from '@angular/core';
import { LancamentosRepositorio } from '../../core/dados/repositorios';
import { NovoLancamento } from '../../core/dominio/tipos';
import { carregavel } from '../../core/estado/carregavel';
import { DadosAlterados } from '../../core/estado/dados-alterados';
import { LancamentoSheet } from '../../core/estado/sheets';
import { ToastService } from '../../core/estado/toast';
import { paraNovoLancamento } from '../compartilhado/mapeadores';

export const ERRO_SALVAR = 'Não foi possível salvar. Tente de novo.';

/** Monta o sheet de novo/editar lançamento e grava pelo repositório (R-02.1 a R-02.10). */
@Injectable()
export class LancamentoSheetFacade {
  private readonly repo = inject(LancamentosRepositorio);
  private readonly sheet = inject(LancamentoSheet);
  private readonly alterados = inject(DadosAlterados);
  private readonly toast = inject(ToastService);

  readonly aberto = this.sheet.aberto;
  readonly emEdicao = this.sheet.emEdicao;
  private readonly edicao = carregavel(
    () => this.sheet.emEdicao(),
    async (id) => (id ? paraNovoLancamento(await this.repo.obter(id)) : null),
  );
  readonly inicial = computed(() => (this.emEdicao() ? this.edicao.valor() ?? null : null));
  readonly pronto = computed(() => !this.emEdicao() || (!this.edicao.carregando() && !!this.edicao.valor()));
  readonly salvando = signal(false);
  readonly erro = signal<string | null>(null);

  async salvar(dados: NovoLancamento): Promise<void> {
    const id = this.emEdicao();
    await this.gravar(async () => {
      if (id) await this.repo.atualizar(id, dados);
      else await this.repo.criar(dados);
    }, id ? 'Lançamento atualizado' : dados.tipo === 'gasto' ? 'Gasto registrado' : 'Entrada registrada');
  }

  async excluir(): Promise<void> {
    const id = this.emEdicao();
    if (id) await this.gravar(() => this.repo.excluir(id), 'Lançamento excluído');
  }

  fechar(): void {
    this.erro.set(null);
    this.sheet.fechar();
  }

  private async gravar(acao: () => Promise<void>, mensagem: string): Promise<void> {
    this.salvando.set(true);
    this.erro.set(null);
    try {
      await acao();
      this.alterados.notificar();
      this.toast.mostrar(mensagem);
      this.fechar();
    } catch {
      this.erro.set(ERRO_SALVAR);
    } finally {
      this.salvando.set(false);
    }
  }
}
