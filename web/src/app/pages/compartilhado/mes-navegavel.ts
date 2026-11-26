import { computed, signal } from '@angular/core';
import { Mes, compararMes, mesAtual, nomeMes, rotuloMes, somarMeses } from '../../core/tempo/mes';

/** Estado do seletor de mês: começa no atual e não passa dele (R-03.1). */
export function mesNavegavel(inicial: Mes = mesAtual()) {
  const mes = signal(inicial);
  return {
    mes: mes.asReadonly(),
    rotulo: computed(() => rotuloMes(mes())),
    nome: computed(() => nomeMes(mes())),
    podeAvancar: computed(() => compararMes(mes(), mesAtual()) < 0),
    ir(m: Mes) {
      if (compararMes(m, mesAtual()) <= 0) mes.set(m);
    },
    anterior() {
      mes.update((m) => somarMeses(m, -1));
    },
    proximo() {
      this.ir(somarMeses(mes(), 1));
    },
  };
}
