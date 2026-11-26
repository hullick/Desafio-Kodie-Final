import { Injectable, inject, signal } from '@angular/core';
import { SessaoRepositorio } from '../../core/dados/repositorios';
import { DadosCadastro } from '../../ui/organisms/signup-form/signup-form';

/**
 * Cadastra e mostra uma mensagem neutra, que não revela se o e-mail já existia (R-01.4).
 * A conta só entra depois de confirmar o e-mail (R-01.5).
 */
@Injectable()
export class CadastroFacade {
  private readonly sessao = inject(SessaoRepositorio);
  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);
  readonly enviadoPara = signal<string | null>(null);

  async cadastrar(dados: DadosCadastro): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      await this.sessao.cadastrar(dados);
      this.enviadoPara.set(dados.email);
    } catch {
      this.erro.set('Não foi possível criar a conta. Tente de novo.');
    } finally {
      this.carregando.set(false);
    }
  }
}
