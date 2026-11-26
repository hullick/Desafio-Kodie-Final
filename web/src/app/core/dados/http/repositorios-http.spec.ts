import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NovoLancamento } from '../../dominio/tipos';
import {
  CaixinhasRepositorio, ErroCaixinha, ErroSessao, LancamentosRepositorio, PerfilRepositorio, ResumoRepositorio,
  SessaoRepositorio,
} from '../repositorios';
import { ErroApi, paraErroApi } from './erro-api';
import { CaixinhasHttp, LancamentosHttp, PerfilHttp, ResumoHttp, SessaoHttp } from './repositorios-http';

let http: HttpTestingController;

function configurar() {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: LancamentosRepositorio, useClass: LancamentosHttp },
      { provide: CaixinhasRepositorio, useClass: CaixinhasHttp },
      { provide: ResumoRepositorio, useClass: ResumoHttp },
      { provide: PerfilRepositorio, useClass: PerfilHttp },
      { provide: SessaoRepositorio, useClass: SessaoHttp },
    ],
  });
  http = TestBed.inject(HttpTestingController);
}

/** Responde à próxima requisição esperada e devolve a requisição para inspeção. */
type Corpo = Parameters<ReturnType<HttpTestingController["expectOne"]>["flush"]>[0];
const responder = (metodo: string, url: string, corpo: Corpo, status = 200) => {
  const r = http.expectOne((req) => req.method === metodo && req.urlWithParams === url);
  r.flush(corpo, { status, statusText: String(status) });
  return r.request;
};

const novo: NovoLancamento = {
  tipo: 'gasto', valorCentavos: 1250, categoria: 'alimentacao', descricao: '  Almoço  ', data: '2026-11-26',
};

beforeEach(configurar);
afterEach(() => http.verify());

describe('LancamentosHttp', () => {
  it('lista o mês e os últimos com limite', async () => {
    const repo = TestBed.inject(LancamentosRepositorio);
    const p1 = repo.listarDoMes({ ano: 2026, mes: 11 });
    responder('GET', '/api/lancamentos?ano=2026&mes=11', []);
    await expect(p1).resolves.toEqual([]);
    const p2 = repo.ultimos({ ano: 2026, mes: 11 }, 4);
    responder('GET', '/api/lancamentos?ano=2026&mes=11&limite=4', [{ id: 'l1' }]);
    await expect(p2).resolves.toEqual([{ id: 'l1' }]);
  });

  it('cria e atualiza mandando só os campos aceitos, com a descrição aparada', async () => {
    const repo = TestBed.inject(LancamentosRepositorio);
    const p = repo.criar({ ...novo, extra: 'x' } as NovoLancamento);
    const req = responder('POST', '/api/lancamentos', { id: 'l1' }, 201);
    expect(req.body).toEqual({ ...novo, descricao: 'Almoço' });
    await p;
    const p2 = repo.atualizar('l1', { ...novo, descricao: '   ' });
    expect(responder('PUT', '/api/lancamentos/l1', { id: 'l1' }).body).toMatchObject({ descricao: null });
    await p2;
  });

  it('obtém e exclui; 404 vira ErroApi nao_encontrado', async () => {
    const repo = TestBed.inject(LancamentosRepositorio);
    const p = repo.obter('l1');
    responder('GET', '/api/lancamentos/l1', { erro: 'nao_encontrado' }, 404);
    await expect(p).rejects.toEqual(new ErroApi(404, 'nao_encontrado'));
    const del = repo.excluir('l2');
    responder('DELETE', '/api/lancamentos/l2', null, 204);
    await expect(del).resolves.toBeUndefined();
  });

  it('400 traz os detalhes do campo', async () => {
    const p = TestBed.inject(LancamentosRepositorio).criar(novo);
    responder('POST', '/api/lancamentos', { erro: 'dados_invalidos', detalhes: [{ campo: 'data', problema: 'futura' }] }, 400);
    await expect(p).rejects.toMatchObject({ status: 400, codigo: 'dados_invalidos', detalhes: [{ campo: 'data', problema: 'futura' }] });
  });
});

describe('CaixinhasHttp', () => {
  it('CRUD e movimentos nas rotas certas, com o prazo como YYYY-MM-DD', async () => {
    const repo = TestBed.inject(CaixinhasRepositorio);
    const dados = { nome: ' Viagem ', icone: 'viagem' as const, metaCentavos: 50000, prazo: '2027-02-15' };
    const l = repo.listar();
    responder('GET', '/api/caixinhas', []);
    await l;
    const c = repo.criar(dados);
    expect(responder('POST', '/api/caixinhas', { id: 'c1' }, 201).body).toEqual({ ...dados, nome: 'Viagem' });
    await c;
    const o = repo.obter('c1');
    responder('GET', '/api/caixinhas/c1', { id: 'c1' });
    await o;
    const e = repo.editar('c1', dados);
    responder('PUT', '/api/caixinhas/c1', { id: 'c1' });
    await e;
    const m = repo.movimentos('c1');
    responder('GET', '/api/caixinhas/c1/movimentos', []);
    await m;
    const mv = repo.movimentar('c1', { tipo: 'guardar', valorCentavos: 100, data: '2026-11-26' });
    expect(responder('POST', '/api/caixinhas/c1/movimentos', { id: 'm1' }, 201).body)
      .toEqual({ tipo: 'guardar', valorCentavos: 100, data: '2026-11-26' });
    await mv;
    const x = repo.excluir('c1');
    responder('DELETE', '/api/caixinhas/c1', null, 204);
    await x;
  });

  it('409 e 404 viram ErroCaixinha', async () => {
    const repo = TestBed.inject(CaixinhasRepositorio);
    const mv = repo.movimentar('c1', { tipo: 'retirar', valorCentavos: 9999, data: '2026-11-26' });
    responder('POST', '/api/caixinhas/c1/movimentos', { erro: 'saldo_insuficiente' }, 409);
    await expect(mv).rejects.toEqual(new ErroCaixinha('saldo_insuficiente'));
    const x = repo.excluir('c1');
    responder('DELETE', '/api/caixinhas/c1', { erro: 'caixinha_com_saldo' }, 409);
    await expect(x).rejects.toEqual(new ErroCaixinha('caixinha_com_saldo'));
    const o = repo.obter('de-outra-pessoa');
    responder('GET', '/api/caixinhas/de-outra-pessoa', { erro: 'nao_encontrado' }, 404);
    await expect(o).rejects.toEqual(new ErroCaixinha('nao_encontrada'));
    const l = repo.editar('c1', { nome: 'x', icone: 'casa', metaCentavos: 1, prazo: '2020-01-01' });
    responder('PUT', '/api/caixinhas/c1', { erro: 'dados_invalidos' }, 400);
    await expect(l).rejects.toBeInstanceOf(ErroApi);
  });
});

describe('ResumoHttp e PerfilHttp', () => {
  it('resumo do mês e perfil', async () => {
    const r = TestBed.inject(ResumoRepositorio).resumoDoMes({ ano: 2026, mes: 1 });
    responder('GET', '/api/resumo?ano=2026&mes=1', { saldo: 1 });
    await expect(r).resolves.toEqual({ saldo: 1 });
    const perfil = TestBed.inject(PerfilRepositorio);
    const g = perfil.obter();
    responder('GET', '/api/perfil', { nome: 'Lari' });
    await g;
    const p = perfil.atualizarNome('  Lari S  ');
    expect(responder('PATCH', '/api/perfil', { nome: 'Lari S' }).body).toEqual({ nome: 'Lari S' });
    await p;
  });
});

describe('SessaoHttp', () => {
  let s: SessaoRepositorio;
  beforeEach(() => (s = TestBed.inject(SessaoRepositorio)));

  it('verificar consulta o servidor uma vez e reaproveita', async () => {
    const p = s.verificar();
    responder('GET', '/api/auth/get-session', { session: {}, user: {} });
    expect(await p).toBe(true);
    expect(s.autenticado()).toBe(true);
    expect(await s.verificar()).toBe(true);
  });

  it('sem sessão (null) ou com a rede fora, verificar dá false', async () => {
    const p = s.verificar();
    responder('GET', '/api/auth/get-session', null);
    expect(await p).toBe(false);
    s.encerrarLocalmente();
    const outro = TestBed.inject(SessaoRepositorio);
    expect(outro.autenticado()).toBe(false);
  });

  it('entrar normaliza o e-mail e marca a sessão; senha errada vira credenciais_invalidas', async () => {
    const p = s.entrar('  Lari@Exemplo.com ', 'Senha123!');
    expect(responder('POST', '/api/auth/sign-in/email', { user: {} }).body).toEqual({ email: 'lari@exemplo.com', password: 'Senha123!' });
    await p;
    expect(s.autenticado()).toBe(true);
    const errada = s.entrar('lari@exemplo.com', 'x');
    responder('POST', '/api/auth/sign-in/email', { code: 'INVALID_EMAIL_OR_PASSWORD' }, 401);
    await expect(errada).rejects.toEqual(new ErroSessao('credenciais_invalidas'));
    const muitas = s.entrar('lari@exemplo.com', 'x');
    responder('POST', '/api/auth/sign-in/email', { message: 'Too many requests.' }, 429);
    await expect(muitas).rejects.toEqual(new ErroSessao('muitas_tentativas'));
  });

  it('cadastrar manda nome, e-mail, senha e a versão da política, e já entra', async () => {
    const p = s.cadastrar({ nome: ' Bia ', email: 'BIA@x.com', senha: 'Senha123!' });
    expect(responder('POST', '/api/auth/sign-up/email', { user: {} }).body)
      .toEqual({ name: 'Bia', email: 'bia@x.com', password: 'Senha123!', aceiteVersao: '2026-11' });
    await p;
    expect(s.autenticado()).toBe(true);
  });

  it.each([
    [422, 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL', 'email_em_uso'],
    [400, 'SENHA_FRACA', 'senha_fraca'],
    [400, 'NOME_INVALIDO', 'nome_invalido'],
    [400, 'ACEITE_OBRIGATORIO', 'aceite_obrigatorio'],
    [500, 'QUALQUER', 'falha'],
  ])('cadastro com %s %s vira %s', async (status, code, codigo) => {
    const p = s.cadastrar({ nome: 'Bia', email: 'b@x.com', senha: 'x' });
    responder('POST', '/api/auth/sign-up/email', { code }, status);
    await expect(p).rejects.toEqual(new ErroSessao(codigo as never));
    expect(s.autenticado()).toBe(false);
  });

  it('sair encerra mesmo se a rede falhar', async () => {
    const p = s.sair();
    http.expectOne('/api/auth/sign-out').error(new ProgressEvent('erro'));
    await expect(p).rejects.toEqual(new ErroSessao('falha'));
    expect(s.autenticado()).toBe(false);
  });

  it('redefinição, troca de senha e exclusão chamam as rotas do Better Auth', async () => {
    const pedir = s.pedirRedefinicao(' Lari@x.com ');
    expect(responder('POST', '/api/auth/request-password-reset', { status: true }).body)
      .toEqual({ email: 'lari@x.com', redirectTo: '/nova-senha' });
    await pedir;

    const redef = s.redefinirSenha('tok', 'Nova123!');
    expect(responder('POST', '/api/auth/reset-password', { status: true }).body).toEqual({ token: 'tok', newPassword: 'Nova123!' });
    await redef;

    const ruim = s.redefinirSenha('velho', 'Nova123!');
    responder('POST', '/api/auth/reset-password', { code: 'INVALID_TOKEN' }, 400);
    await expect(ruim).rejects.toEqual(new ErroSessao('token_invalido'));

    const troca = s.alterarSenha('Atual1!', 'Nova123!');
    expect(responder('POST', '/api/auth/change-password', { user: {} }).body)
      .toEqual({ currentPassword: 'Atual1!', newPassword: 'Nova123!', revokeOtherSessions: true });
    await troca;

    const errada = s.alterarSenha('x', 'Nova123!');
    responder('POST', '/api/auth/change-password', { code: 'INVALID_PASSWORD' }, 400);
    await expect(errada).rejects.toEqual(new ErroSessao('senha_atual_incorreta'));

    const entrar = s.entrar('a@x.com', 'y');
    responder('POST', '/api/auth/sign-in/email', { user: {} });
    await entrar;
    expect(s.autenticado()).toBe(true);
    const exc = s.excluirConta('Atual1!');
    expect(responder('POST', '/api/auth/delete-user', { success: true }).body).toEqual({ password: 'Atual1!' });
    await exc;
    expect(s.autenticado()).toBe(false);
  });
});

describe('paraErroApi', () => {
  it('rede fora vira status 0 rede; algo desconhecido vira desconhecido', () => {
    expect(paraErroApi(new HttpErrorResponse({ status: 0 }))).toEqual(new ErroApi(0, 'rede'));
    expect(paraErroApi(new HttpErrorResponse({ status: 502, error: 'html' }))).toEqual(new ErroApi(502, 'desconhecido'));
    expect(paraErroApi(new Error('x'))).toEqual(new ErroApi(0, 'desconhecido'));
    const e = new ErroApi(400, 'x');
    expect(paraErroApi(e)).toBe(e);
  });
});
