import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { nomeValido } from '../../core/calculos/senha';
import { NbButton } from '../../ui/atoms/button/button';
import { NbInput } from '../../ui/atoms/input/input';
import { NbSkeleton } from '../../ui/atoms/skeleton/skeleton';
import { NbFormField } from '../../ui/molecules/form-field/form-field';
import { NbDetailTemplate } from '../../ui/templates/detail-template/detail-template';
import { PerfilDadosFacade } from './perfil-dados.facade';

/** Página "Seus dados" (R-05.2). */
@Component({
  selector: 'nb-perfil-dados-page',
  imports: [NbButton, NbDetailTemplate, NbFormField, NbInput, NbSkeleton],
  providers: [PerfilDadosFacade],
  template: `
    <nb-detail-template titulo="Seus dados" voltarPara="/perfil" rotuloVoltar="Perfil">
      @if (f.perfil(); as p) {
        <form class="space-y-5" novalidate (submit)="$event.preventDefault(); salvar()">
          <nb-form-field rotulo="Como prefere ser chamado(a)?" [erro]="erroNome()">
            <input nbInput autocomplete="given-name" maxlength="40" [value]="nome()"
              (input)="nome.set($any($event.target).value)" (blur)="tocado.set(true)" />
          </nb-form-field>
          <nb-form-field rotulo="E-mail" dica="Por enquanto o e-mail não pode ser trocado.">
            <input nbInput type="email" [value]="p.email" readonly />
          </nb-form-field>
          <div aria-live="assertive">
            @if (f.erro(); as e) { <p class="text-sm text-neg-ink">{{ e }}</p> }
          </div>
          <button nb-button type="submit" [larguraTotal]="true" [disabled]="!valido() || f.salvando()">
            {{ f.salvando() ? 'Salvando…' : 'Salvar' }}
          </button>
        </form>
      } @else {
        <nb-skeleton forma="h-56 w-full rounded-card" />
      }
    </nb-detail-template>
  `,
})
export class PerfilDadosPage {
  protected readonly f = inject(PerfilDadosFacade);
  protected readonly nome = linkedSignal(() => this.f.perfil()?.nome ?? '');
  protected readonly tocado = signal(false);
  protected readonly valido = computed(() => nomeValido(this.nome()));
  protected readonly erroNome = computed(() => (this.tocado() && !this.valido() ? 'Use de 2 a 40 caracteres.' : null));

  protected salvar(): void {
    if (this.valido()) this.f.salvarNome(this.nome());
  }
}
