import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SessaoRepositorio } from '../../core/dados/repositorios';
import { ToastService } from '../../core/estado/toast';
import { mensagemDeErroSessao } from '../compartilhado/mensagens-sessao';

/**
 * Alterar senha logado (R-05.3): confere a atual e encerra as sessões dos outros aparelhos.
 * Senha atual errada mostra o erro e mantém a pessoa logada.
 */
@Injectable()
export class AlterarSenhaFacade {
  private readonly sessao = inject(SessaoRepositorio);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);

  async alterar(atual: string, nova: string): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      await this.sessao.alterarSenha(atual, nova);
      this.toast.mostrar('Senha alterada');
      await this.router.navigateByUrl('/perfil');
    } catch (e) {
      this.erro.set(mensagemDeErroSessao(e));
    } finally {
      this.carregando.set(false);
    }
  }
}
