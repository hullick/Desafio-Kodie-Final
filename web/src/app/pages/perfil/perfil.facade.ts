import { Injectable, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PerfilRepositorio, SessaoRepositorio } from '../../core/dados/repositorios';
import { carregavel } from '../../core/estado/carregavel';
import { DadosAlterados } from '../../core/estado/dados-alterados';
import { mesDeISO, rotuloMesCurto } from '../../core/tempo/mes';
import { ItemConfiguracaoVM } from '../../ui/organisms/settings-group/settings-group';
import { environment } from '../../../environments/environment';

const ITENS: readonly ItemConfiguracaoVM[] = [
  { icone: 'id-card', titulo: 'Seus dados', subtitulo: 'Nome e e-mail', rota: '/perfil/dados' },
  { icone: 'key-round', titulo: 'Alterar senha', subtitulo: 'Troque sua senha de acesso', rota: '/perfil/senha' },
  { icone: 'shield-check', titulo: 'Privacidade', subtitulo: 'O que coletamos e por quê', rota: '/privacidade' },
];

/** Monta o perfil: topo com dados reais, configurações e sair (R-05.1, R-05.5, R-05.8). */
@Injectable()
export class PerfilFacade {
  private readonly perfil = inject(PerfilRepositorio);
  private readonly sessao = inject(SessaoRepositorio);
  private readonly alterados = inject(DadosAlterados);
  private readonly router = inject(Router);

  private readonly dados = carregavel(() => this.alterados.versao(), () => this.perfil.obter());
  readonly vm = computed(() => {
    const p = this.dados.valor();
    return p && { nome: p.nome, email: p.email, desde: rotuloMesCurto(mesDeISO(p.criadoEm.slice(0, 10))) };
  });
  readonly itens = ITENS;
  readonly versao = environment.versao;

  async sair(): Promise<void> {
    await this.sessao.sair();
    await this.router.navigateByUrl('/entrar');
  }
}
