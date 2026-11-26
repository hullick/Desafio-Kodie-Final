import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Injector, inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { SessaoRepositorio } from '../repositorios';

/**
 * Sessão expirou no meio do uso (ou a conta foi excluída em outro aparelho): qualquer 401 das
 * rotas de domínio esquece a sessão local e leva ao login, guardando a rota para voltar depois
 * (R-01.9). As rotas de /api/auth/* ficam de fora: lá, 401 é "senha errada", tratado na tela.
 */
export const sessaoExpiradaInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector);
  const router = inject(Router);
  return next(req).pipe(
    catchError((e: unknown) => {
      if (e instanceof HttpErrorResponse && e.status === 401 && !req.url.includes('/api/auth/')) {
        injector.get(SessaoRepositorio).encerrarLocalmente();
        const atual = router.url;
        if (!atual.startsWith('/entrar')) {
          void router.navigate(['/entrar'], { queryParams: { voltar: atual } });
        }
      }
      return throwError(() => e);
    }),
  );
};
