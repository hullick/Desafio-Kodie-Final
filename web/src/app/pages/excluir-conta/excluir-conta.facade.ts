import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SessaoRepositorio } from '../../core/dados/repositorios';
import { mensagemDeErroSessao } from '../compartilhado/mensagens-sessao';

/**
 * Exclusão definitiva da conta (R-05.6). Termina no login com "Sua conta e seus dados foram
 * apagados". `replaceUrl` tira a página da conta do histórico: voltar não mostra nada dela.
 */
@Injectable()
export class ExcluirContaFacade {
  private readonly sessao = inject(SessaoRepositorio);
  private readonly router = inject(Router);
  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);

  async excluir(senha: string): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      await this.sessao.excluirConta(senha);
      await this.router.navigate(['/entrar'], { queryParams: { aviso: 'conta-excluida' }, replaceUrl: true });
    } catch (e) {
      this.erro.set(mensagemDeErroSessao(e, 'Não foi possível excluir agora. Nada foi apagado. Tente de novo.'));
    } finally {
      this.carregando.set(false);
    }
  }
}
