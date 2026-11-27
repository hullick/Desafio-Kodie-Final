import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PerfilRepositorio } from '../../core/dados/repositorios';
import { carregavel } from '../../core/estado/carregavel';
import { DadosAlterados } from '../../core/estado/dados-alterados';
import { ToastService } from '../../core/estado/toast';
import { ERRO_SALVAR } from '../shell/lancamento-sheet.facade';

/** Monta "Seus dados": nome editável, e-mail só leitura (R-05.2). */
@Injectable()
export class PerfilDadosFacade {
  private readonly repo = inject(PerfilRepositorio);
  private readonly alterados = inject(DadosAlterados);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  private readonly dados = carregavel(() => null, () => this.repo.obter());
  readonly perfil = this.dados.valor;
  readonly pronto = computed(() => !!this.perfil());
  readonly salvando = signal(false);
  readonly erro = signal<string | null>(null);

  async salvarNome(nome: string): Promise<void> {
    this.salvando.set(true);
    this.erro.set(null);
    try {
      await this.repo.atualizarNome(nome);
      this.alterados.notificar();
      this.toast.mostrar('Nome atualizado');
      await this.router.navigateByUrl('/perfil');
    } catch {
      this.erro.set(ERRO_SALVAR);
    } finally {
      this.salvando.set(false);
    }
  }
}
