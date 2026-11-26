import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NbIcon } from '../../ui/atoms/icon/icon';
import { NbSkeleton } from '../../ui/atoms/skeleton/skeleton';
import { NbSettingsItem } from '../../ui/molecules/settings-item/settings-item';
import { NbProfileHeader } from '../../ui/organisms/profile-header/profile-header';
import { NbSettingsGroup } from '../../ui/organisms/settings-group/settings-group';
import { PerfilFacade } from './perfil.facade';

/** Página Perfil (spec 05). Sair fica separado das configurações (U-05.1). */
@Component({
  selector: 'nb-perfil-page',
  imports: [NbIcon, NbProfileHeader, NbSettingsGroup, NbSettingsItem, NbSkeleton, RouterLink],
  providers: [PerfilFacade],
  template: `
    @if (f.vm(); as vm) {
      <nb-profile-header class="mt-4" [nome]="vm.nome" [email]="vm.email" [desde]="vm.desde" />
    } @else {
      <nb-skeleton class="mx-auto mt-4 block" forma="h-44 w-full rounded-card" />
    }

    <nb-settings-group class="mt-8" titulo="Sua conta" [itens]="f.itens" />

    <section class="mt-6 rounded-card bg-brand-light p-5" aria-labelledby="titulo-privacidade">
      <h2 id="titulo-privacidade" class="flex items-center gap-2 font-display text-lg font-bold">
        <nb-icon nome="shield-check" class="text-brand-ink" />Seus dados são só seus
      </h2>
      <p class="mt-2 text-sm">Só você vê seus lançamentos e caixinhas. Sua senha é guardada de forma protegida, a conexão é segura (HTTPS) e coletamos só o necessário.</p>
      <a routerLink="/privacidade" class="mt-2 inline-flex min-h-11 items-center text-sm font-bold text-brand-ink">Saiba mais</a>
    </section>

    <div class="mt-6 overflow-hidden rounded-card bg-surface shadow-n1">
      <button nb-settings-item type="button" icone="log-out" titulo="Sair" subtitulo="Desconectar deste aparelho" (click)="f.sair()"></button>
    </div>

    <p class="mt-8 text-center text-xs text-muted">NuBanko v{{ f.versao }}</p>
  `,
})
export class PerfilPage {
  protected readonly f = inject(PerfilFacade);
}
