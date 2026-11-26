import { Component } from '@angular/core';
import { NbCard } from '../../ui/atoms/card/card';
import { NbDetailTemplate } from '../../ui/templates/detail-template/detail-template';

/**
 * Página Privacidade (R-05.4, U-05.3). Pública, para o link do cadastro funcionar sem login.
 * Texto estático: não precisa de facade.
 */
@Component({
  selector: 'nb-privacidade-page',
  imports: [NbCard, NbDetailTemplate],
  template: `
    <div class="mx-auto max-w-md px-5 pb-10">
      <nb-detail-template titulo="Privacidade" voltarPara="/perfil" rotuloVoltar="Perfil">
        <nb-card class="space-y-5 text-[15px] leading-relaxed">
          <section>
            <h2 class="font-display text-lg font-bold">O que guardamos</h2>
            <p>Seu nome, seu e-mail, sua senha protegida e os lançamentos e caixinhas que você cria.</p>
          </section>
          <section>
            <h2 class="font-display text-lg font-bold">Para quê</h2>
            <p>Só para o app funcionar: entrar na sua conta e mostrar o seu mês e as suas metas.</p>
          </section>
          <section>
            <h2 class="font-display text-lg font-bold">O que não coletamos</h2>
            <p>CPF, telefone, endereço, localização ou rastreadores. Não vendemos nem compartilhamos seus dados.</p>
          </section>
          <section>
            <h2 class="font-display text-lg font-bold">Quem vê</h2>
            <p>Só você. Cada registro fica preso à sua conta, e a conexão é segura (HTTPS).</p>
          </section>
          <p class="text-sm text-muted">Política versão {{ versao }}.</p>
        </nb-card>
      </nb-detail-template>
    </div>
  `,
  host: { class: 'block min-h-dvh bg-canvas text-ink' },
})
export class PrivacidadePage {
  protected readonly versao = '2026-11';
}
