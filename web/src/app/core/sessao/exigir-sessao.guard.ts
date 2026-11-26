import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessaoRepositorio } from '../dados/repositorios';

/** Rotas internas exigem sessão; sem ela, vai para o login e volta depois (R-01.9). */
export const exigirSessao: CanActivateFn = (_rota, estado) =>
  inject(SessaoRepositorio).autenticado() ||
  inject(Router).createUrlTree(['/entrar'], { queryParams: { voltar: estado.url } });
