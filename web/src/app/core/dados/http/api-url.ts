import { InjectionToken } from '@angular/core';

/** Prefixo da API. Mesmo domínio do app (o cookie de sessão vai sozinho). */
export const API_URL = new InjectionToken<string>('API_URL', { factory: () => '/api' });
