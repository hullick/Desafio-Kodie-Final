import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import {
  CaixinhasMemoria, LancamentosMemoria, PerfilMemoria, ResumoMemoria,
} from './memoria/repositorios-memoria';
import {
  CaixinhasRepositorio, LancamentosRepositorio, PerfilRepositorio, ResumoRepositorio,
} from './repositorios';

/** Liga os contratos de dados às implementações em memória (demonstração). */
export function proverDadosEmMemoria(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: LancamentosRepositorio, useClass: LancamentosMemoria },
    { provide: CaixinhasRepositorio, useClass: CaixinhasMemoria },
    { provide: ResumoRepositorio, useClass: ResumoMemoria },
    { provide: PerfilRepositorio, useClass: PerfilMemoria },
  ]);
}
