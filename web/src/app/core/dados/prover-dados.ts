import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { CaixinhasHttp, LancamentosHttp, PerfilHttp, ResumoHttp, SessaoHttp } from './http/repositorios-http';
import { sessaoExpiradaInterceptor } from './http/sessao-expirada.interceptor';
import {
  CaixinhasMemoria, LancamentosMemoria, PerfilMemoria, ResumoMemoria, SessaoMemoria,
} from './memoria/repositorios-memoria';
import {
  CaixinhasRepositorio, LancamentosRepositorio, PerfilRepositorio, ResumoRepositorio, SessaoRepositorio,
} from './repositorios';

/** Liga os contratos de dados à API real em /api/* (padrão do app). */
export function proverDadosHttp(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideHttpClient(withFetch(), withInterceptors([sessaoExpiradaInterceptor])),
    { provide: LancamentosRepositorio, useClass: LancamentosHttp },
    { provide: CaixinhasRepositorio, useClass: CaixinhasHttp },
    { provide: ResumoRepositorio, useClass: ResumoHttp },
    { provide: PerfilRepositorio, useClass: PerfilHttp },
    { provide: SessaoRepositorio, useClass: SessaoHttp },
  ]);
}

/** Liga os contratos de dados às implementações em memória (demonstração e testes). */
export function proverDadosEmMemoria(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: LancamentosRepositorio, useClass: LancamentosMemoria },
    { provide: CaixinhasRepositorio, useClass: CaixinhasMemoria },
    { provide: ResumoRepositorio, useClass: ResumoMemoria },
    { provide: PerfilRepositorio, useClass: PerfilMemoria },
    { provide: SessaoRepositorio, useClass: SessaoMemoria },
  ]);
}
