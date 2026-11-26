import { EnvironmentProviders, Provider, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, Routes, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { estabilizar } from './estabilizar';

/**
 * Navega até `url` por um router-outlet real e devolve o serviço `token` do componente da rota.
 * Útil para testar facades que leem parâmetros da rota.
 */
export async function abrirRota<T>(
  url: string, rotas: Routes, token: Type<T>, providers: (Provider | EnvironmentProviders)[] = [],
): Promise<{ servico: T; router: Router; harness: RouterTestingHarness }> {
  TestBed.configureTestingModule({ providers: [...providers, provideRouter(rotas)] });
  const harness = await RouterTestingHarness.create();
  harness.fixture.autoDetectChanges();
  await harness.navigateByUrl(url);
  const servico = harness.routeDebugElement!.injector.get(token);
  await estabilizar();
  return { servico, router: TestBed.inject(Router), harness };
}
