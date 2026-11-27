import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessaoRepositorio } from '../dados/repositorios';

/**
 * Login e cadastro são só para quem está fora: com sessão ativa, vai direto para o início.
 * Como no exigirSessao, se a sessão ainda não é conhecida, consulta o servidor uma vez.
 */
export const semSessao: CanActivateFn = async () => {
  const sessao = inject(SessaoRepositorio);
  const router = inject(Router); // inject só vale antes do primeiro await
  if (sessao.autenticado() || (await sessao.verificar())) return router.createUrlTree(['/inicio']);
  return true;
};
