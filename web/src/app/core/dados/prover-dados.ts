import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import {
  CaixinhasMemoria, LancamentosMemoria, PerfilMemoria, ResumoMemoria, SessaoMemoria,
} from './memoria/repositorios-memoria';
import {
  CaixinhasRepositorio, LancamentosRepositorio, PerfilRepositorio, ResumoRepositorio, SessaoRepositorio,
} from './repositorios';

/** Liga os contratos de dados às implementações em memória (demonstração). */
export function proverDadosEmMemoria(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: LancamentosRepositorio, useClass: LancamentosMemoria },
    { provide: CaixinhasRepositorio, useClass: CaixinhasMemoria },
    { provide: ResumoRepositorio, useClass: ResumoMemoria },
    { provide: PerfilRepositorio, useClass: PerfilMemoria },
    { provide: SessaoRepositorio, useClass: SessaoMemoria },
  ]);
}
