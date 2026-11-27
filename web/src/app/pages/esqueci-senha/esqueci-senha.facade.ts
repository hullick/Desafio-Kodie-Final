import { Injectable, inject, signal } from '@angular/core';
import { SessaoRepositorio } from '../../core/dados/repositorios';
import { mensagemDeErroSessao } from '../compartilhado/mensagens-sessao';

/**
 * "Esqueci a senha" (R-01.8): pede o link e mostra uma confirmação neutra, que não revela se
 * existe conta com o e-mail (a API responde igual nos dois casos).
 */
@Injectable()
export class EsqueciSenhaFacade {
  private readonly sessao = inject(SessaoRepositorio);
  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);
  readonly enviadoPara = signal<string | null>(null);

  async enviar(email: string): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      await this.sessao.pedirRedefinicao(email);
      this.enviadoPara.set(email);
    } catch (e) {
      this.erro.set(mensagemDeErroSessao(e, 'Não foi possível enviar agora. Tente de novo.'));
    } finally {
      this.carregando.set(false);
    }
  }

  outroEmail(): void {
    this.enviadoPara.set(null);
  }
}
