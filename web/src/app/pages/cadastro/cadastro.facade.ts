import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CodigoErroSessao, ErroSessao, SessaoRepositorio } from '../../core/dados/repositorios';
import { DadosCadastro } from '../../ui/organisms/signup-form/signup-form';

/** Mensagens do cadastro por código de erro; o resto cai na genérica. */
export const ERROS_CADASTRO: Partial<Record<CodigoErroSessao, string>> = {
  email_em_uso: 'Já existe uma conta com esse e-mail. Entre ou recupere a senha.',
  senha_fraca: 'A senha precisa de 8+ caracteres, 1 número e 1 símbolo.',
  nome_invalido: 'O nome precisa ter de 2 a 40 caracteres.',
  muitas_tentativas: 'Muitas tentativas. Espere um minuto e tente de novo.',
};
export const ERRO_CADASTRO_GENERICO = 'Não foi possível criar a conta. Tente de novo.';

/** Cria a conta e já entra nela: o app não pede confirmação de e-mail (decisão do time). */
@Injectable()
export class CadastroFacade {
  private readonly sessao = inject(SessaoRepositorio);
  private readonly router = inject(Router);
  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);

  async cadastrar(dados: DadosCadastro): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      await this.sessao.cadastrar(dados);
      await this.router.navigateByUrl('/inicio');
    } catch (e) {
      this.erro.set((e instanceof ErroSessao && ERROS_CADASTRO[e.codigo]) || ERRO_CADASTRO_GENERICO);
    } finally {
      this.carregando.set(false);
    }
  }
}
