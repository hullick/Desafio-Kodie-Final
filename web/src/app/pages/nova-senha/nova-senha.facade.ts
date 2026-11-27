import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ErroSessao, SessaoRepositorio } from '../../core/dados/repositorios';
import { mensagemDeErroSessao } from '../compartilhado/mensagens-sessao';

/**
 * Nova senha a partir do link do e-mail (R-01.8). O link passa por /api/auth/reset-password/<token>
 * e chega aqui como `?token=...`, ou como `?error=INVALID_TOKEN` se expirou ou já foi usado.
 */
@Injectable()
export class NovaSenhaFacade {
  private readonly sessao = inject(SessaoRepositorio);
  private readonly router = inject(Router);
  private readonly query = toSignal(inject(ActivatedRoute).queryParamMap, { requireSync: true });

  private readonly token = computed(() => (this.query().get('error') ? null : this.query().get('token')));
  private readonly tokenRecusado = signal(false);
  /** Sem token, com erro na URL ou recusado pela API: a tela oferece pedir outro link. */
  readonly linkInvalido = computed(() => !this.token() || this.tokenRecusado());
  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);

  async salvar(novaSenha: string): Promise<void> {
    const token = this.token();
    if (!token) return;
    this.carregando.set(true);
    this.erro.set(null);
    try {
      await this.sessao.redefinirSenha(token, novaSenha);
      await this.router.navigate(['/entrar'], { queryParams: { aviso: 'senha-redefinida' } });
    } catch (e) {
      if (e instanceof ErroSessao && e.codigo === 'token_invalido') this.tokenRecusado.set(true);
      else this.erro.set(mensagemDeErroSessao(e));
    } finally {
      this.carregando.set(false);
    }
  }
}
