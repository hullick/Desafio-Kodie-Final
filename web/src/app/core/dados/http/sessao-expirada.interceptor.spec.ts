import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { proverDadosEmMemoria } from '../prover-dados';
import { SessaoRepositorio } from '../repositorios';
import { sessaoExpiradaInterceptor } from './sessao-expirada.interceptor';

describe('sessaoExpiradaInterceptor (R-01.9)', () => {
  let http: HttpClient;
  let ctrl: HttpTestingController;
  let router: Router;
  let sessao: SessaoRepositorio;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        proverDadosEmMemoria(),
        provideRouter([]),
        provideHttpClient(withInterceptors([sessaoExpiradaInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    ctrl = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    sessao = TestBed.inject(SessaoRepositorio);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('401 numa rota de domínio esquece a sessão e vai ao login guardando a rota', async () => {
    vi.spyOn(router, 'url', 'get').mockReturnValue('/caixinhas/c1');
    const p = firstValueFrom(http.get('/api/caixinhas'));
    ctrl.expectOne('/api/caixinhas').flush({ erro: 'nao_autenticado' }, { status: 401, statusText: '401' });
    await expect(p).rejects.toMatchObject({ status: 401 });
    expect(sessao.autenticado()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/entrar'], { queryParams: { voltar: '/caixinhas/c1' } });
  });

  it('401 de /api/auth/* (senha errada) não mexe na sessão nem navega', async () => {
    const p = firstValueFrom(http.post('/api/auth/sign-in/email', {}));
    ctrl.expectOne('/api/auth/sign-in/email').flush({}, { status: 401, statusText: '401' });
    await expect(p).rejects.toBeTruthy();
    expect(sessao.autenticado()).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('já no login, não navega de novo', async () => {
    vi.spyOn(router, 'url', 'get').mockReturnValue('/entrar?voltar=%2Finicio');
    const p = firstValueFrom(http.get('/api/perfil'));
    ctrl.expectOne('/api/perfil').flush({}, { status: 401, statusText: '401' });
    await expect(p).rejects.toBeTruthy();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(sessao.autenticado()).toBe(false);
  });

  it('outros erros passam direto, sem mexer na sessão', async () => {
    const q = firstValueFrom(http.get('/api/resumo'));
    ctrl.expectOne('/api/resumo').flush({}, { status: 500, statusText: '500' });
    await expect(q).rejects.toMatchObject({ status: 500 });
    expect(sessao.autenticado()).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
