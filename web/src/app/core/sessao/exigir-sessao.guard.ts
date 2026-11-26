import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessaoRepositorio } from '../dados/repositorios';

/**
 * Rotas internas exigem sessão; sem ela, vai para o login e volta depois (R-01.9).
 * Ao abrir o app, a sessão ainda não é conhecida: consulta o servidor uma vez (cookie HttpOnly).
 */
export const exigirSessao: CanActivateFn = async (_rota, estado) => {
  const sessao = inject(SessaoRepositorio);
  const router = inject(Router);
  if (sessao.autenticado() || (await sessao.verificar())) return true;
  return router.createUrlTree(['/entrar'], { queryParams: { voltar: estado.url } });
};
