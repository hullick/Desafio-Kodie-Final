import { Injectable, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ErroSessao, SessaoRepositorio } from '../../core/dados/repositorios';
import { Credenciais } from '../../ui/organisms/login-form/login-form';
import { AVISOS_LOGIN, AvisoLogin } from '../compartilhado/mensagens-sessao';

export const ERRO_LOGIN = 'E-mail ou senha incorretos.';
export const ERRO_MUITAS_TENTATIVAS = 'Muitas tentativas. Espere um minuto e tente de novo.';

/** Entra e volta para a rota pedida antes do login (R-01.6, R-01.7, R-01.9). */
@Injectable()
export class EntrarFacade {
  private readonly sessao = inject(SessaoRepositorio);
  private readonly router = inject(Router);
  private readonly rota = inject(ActivatedRoute);
  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);
  /** Aviso deixado por outra tela (conta excluída, senha redefinida). Só chaves conhecidas. */
  readonly aviso = computed(() => {
    const chave = this.rota.snapshot.queryParamMap.get('aviso');
    return chave && chave in AVISOS_LOGIN ? AVISOS_LOGIN[chave as AvisoLogin] : null;
  });

  async entrar({ email, senha }: Credenciais): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      await this.sessao.entrar(email, senha);
      const voltar = this.rota.snapshot.queryParamMap.get('voltar');
      await this.router.navigateByUrl(voltar?.startsWith('/') && !voltar.startsWith('//') ? voltar : '/inicio');
    } catch (e) {
      this.erro.set(
        e instanceof ErroSessao && e.codigo === 'credenciais_invalidas' ? ERRO_LOGIN
          : e instanceof ErroSessao && e.codigo === 'muitas_tentativas' ? ERRO_MUITAS_TENTATIVAS
            : 'Não foi possível entrar. Tente de novo.',
      );
    } finally {
      this.carregando.set(false);
    }
  }
}
