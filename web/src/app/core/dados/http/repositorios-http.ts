import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { POLITICA_VERSAO } from '../../dominio/politica';
import {
  Caixinha, DadosCaixinha, Lancamento, MovimentoCaixinha, NovoLancamento, NovoMovimento, Perfil, ResumoMes,
} from '../../dominio/tipos';
import { Mes } from '../../tempo/mes';
import {
  CaixinhasRepositorio, CodigoErroSessao, ErroCaixinha, ErroSessao, LancamentosRepositorio, NovaConta,
  PerfilRepositorio, ResumoRepositorio, SessaoRepositorio,
} from '../repositorios';
import { API_URL } from './api-url';
import { ErroApi, requisitar } from './erro-api';

/*
 * Implementações HTTP dos repositórios, sobre a API em /api/* (contrato: docs/api/openapi.yaml).
 * O cookie de sessão é HttpOnly e do mesmo domínio: o navegador o envia sozinho, e o front
 * nunca vê o token. Erros chegam como ErroApi, ou como ErroCaixinha/ErroSessao quando a tela
 * precisa reagir a um código específico.
 */

const paramsDoMes = (m: Mes, limite?: number) => {
  let p = new HttpParams().set('ano', m.ano).set('mes', m.mes);
  if (limite !== undefined) p = p.set('limite', limite);
  return p;
};

@Injectable()
export class LancamentosHttp extends LancamentosRepositorio {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_URL)}/lancamentos`;

  listarDoMes(m: Mes): Promise<Lancamento[]> {
    return requisitar(this.http.get<Lancamento[]>(this.url, { params: paramsDoMes(m) }));
  }

  ultimos(m: Mes, limite: number): Promise<Lancamento[]> {
    return requisitar(this.http.get<Lancamento[]>(this.url, { params: paramsDoMes(m, limite) }));
  }

  obter(id: string): Promise<Lancamento> {
    return requisitar(this.http.get<Lancamento>(`${this.url}/${encodeURIComponent(id)}`));
  }

  criar(dados: NovoLancamento): Promise<Lancamento> {
    return requisitar(this.http.post<Lancamento>(this.url, corpoLancamento(dados)));
  }

  atualizar(id: string, dados: NovoLancamento): Promise<Lancamento> {
    return requisitar(this.http.put<Lancamento>(`${this.url}/${encodeURIComponent(id)}`, corpoLancamento(dados)));
  }

  async excluir(id: string): Promise<void> {
    await requisitar(this.http.delete<void>(`${this.url}/${encodeURIComponent(id)}`));
  }
}

/** Só os campos que a API aceita (ela recusa qualquer outro com 400). */
function corpoLancamento(d: NovoLancamento): NovoLancamento {
  return { tipo: d.tipo, valorCentavos: d.valorCentavos, categoria: d.categoria, descricao: d.descricao?.trim() || null, data: d.data };
}

const CODIGOS_CAIXINHA = { saldo_insuficiente: true, caixinha_com_saldo: true } as const;

/** 409 conhecidos e 404 viram ErroCaixinha; o resto segue como ErroApi. */
async function comErroCaixinha<T>(p: Promise<T>): Promise<T> {
  try {
    return await p;
  } catch (e) {
    if (e instanceof ErroApi && e.codigo in CODIGOS_CAIXINHA) {
      throw new ErroCaixinha(e.codigo as keyof typeof CODIGOS_CAIXINHA);
    }
    if (e instanceof ErroApi && e.status === 404) throw new ErroCaixinha('nao_encontrada');
    throw e;
  }
}

@Injectable()
export class CaixinhasHttp extends CaixinhasRepositorio {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_URL)}/caixinhas`;
  private readonly de = (id: string) => `${this.url}/${encodeURIComponent(id)}`;

  listar(): Promise<Caixinha[]> {
    return requisitar(this.http.get<Caixinha[]>(this.url));
  }

  obter(id: string): Promise<Caixinha> {
    return comErroCaixinha(requisitar(this.http.get<Caixinha>(this.de(id))));
  }

  criar(dados: DadosCaixinha): Promise<Caixinha> {
    return requisitar(this.http.post<Caixinha>(this.url, corpoCaixinha(dados)));
  }

  editar(id: string, dados: DadosCaixinha): Promise<Caixinha> {
    return comErroCaixinha(requisitar(this.http.put<Caixinha>(this.de(id), corpoCaixinha(dados))));
  }

  async excluir(id: string): Promise<void> {
    await comErroCaixinha(requisitar(this.http.delete<void>(this.de(id))));
  }

  movimentos(caixinhaId: string): Promise<MovimentoCaixinha[]> {
    return comErroCaixinha(requisitar(this.http.get<MovimentoCaixinha[]>(`${this.de(caixinhaId)}/movimentos`)));
  }

  async movimentar(caixinhaId: string, mov: NovoMovimento): Promise<void> {
    const corpo: NovoMovimento = { tipo: mov.tipo, valorCentavos: mov.valorCentavos, data: mov.data };
    await comErroCaixinha(requisitar(this.http.post<MovimentoCaixinha>(`${this.de(caixinhaId)}/movimentos`, corpo)));
  }
}

function corpoCaixinha(d: DadosCaixinha): DadosCaixinha {
  return { nome: d.nome.trim(), icone: d.icone, metaCentavos: d.metaCentavos, prazo: d.prazo };
}

@Injectable()
export class ResumoHttp extends ResumoRepositorio {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_URL)}/resumo`;

  resumoDoMes(m: Mes): Promise<ResumoMes> {
    return requisitar(this.http.get<ResumoMes>(this.url, { params: paramsDoMes(m) }));
  }
}

@Injectable()
export class PerfilHttp extends PerfilRepositorio {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_URL)}/perfil`;

  obter(): Promise<Perfil> {
    return requisitar(this.http.get<Perfil>(this.url));
  }

  atualizarNome(nome: string): Promise<Perfil> {
    return requisitar(this.http.patch<Perfil>(this.url, { nome: nome.trim() }));
  }
}

/** Códigos do Better Auth (e os do NuBanko nos hooks) e o que significam para a tela. */
const CODIGOS_AUTH: Record<string, CodigoErroSessao> = {
  INVALID_EMAIL_OR_PASSWORD: 'credenciais_invalidas',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'email_em_uso',
  USER_ALREADY_EXISTS: 'email_em_uso',
  SENHA_FRACA: 'senha_fraca',
  PASSWORD_TOO_SHORT: 'senha_fraca',
  PASSWORD_TOO_LONG: 'senha_fraca',
  NOME_INVALIDO: 'nome_invalido',
  ACEITE_OBRIGATORIO: 'aceite_obrigatorio',
  INVALID_PASSWORD: 'senha_atual_incorreta',
  INVALID_TOKEN: 'token_invalido',
  TOKEN_EXPIRED: 'token_invalido',
};

function paraErroSessao(e: unknown): ErroSessao {
  if (e instanceof ErroApi) {
    if (e.status === 429) return new ErroSessao('muitas_tentativas');
    const codigo = CODIGOS_AUTH[e.codigo];
    if (codigo) return new ErroSessao(codigo);
  }
  return new ErroSessao('falha');
}

const normalizarEmail = (email: string) => email.trim().toLowerCase();

/** Sessão sobre o Better Auth em /api/auth/*. */
@Injectable()
export class SessaoHttp extends SessaoRepositorio {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_URL)}/auth`;
  private readonly _autenticado = signal(false);
  readonly autenticado = this._autenticado.asReadonly();
  private consulta: Promise<boolean> | null = null;

  private async auth<T>(caminho: string, corpo: unknown = {}): Promise<T> {
    try {
      return await requisitar(this.http.post<T>(`${this.url}${caminho}`, corpo));
    } catch (e) {
      throw paraErroSessao(e);
    }
  }

  private definir(logado: boolean): void {
    this._autenticado.set(logado);
    this.consulta = Promise.resolve(logado);
  }

  verificar(): Promise<boolean> {
    this.consulta ??= requisitar(this.http.get<unknown>(`${this.url}/get-session`))
      .then((s) => s !== null)
      .catch(() => false)
      .then((logado) => {
        this._autenticado.set(logado);
        return logado;
      });
    return this.consulta;
  }

  async entrar(email: string, senha: string): Promise<void> {
    await this.auth('/sign-in/email', { email: normalizarEmail(email), password: senha });
    this.definir(true);
  }

  async cadastrar(conta: NovaConta): Promise<void> {
    await this.auth('/sign-up/email', {
      name: conta.nome.trim(), email: normalizarEmail(conta.email), password: conta.senha, aceiteVersao: POLITICA_VERSAO,
    });
    this.definir(true);
  }

  async sair(): Promise<void> {
    try {
      await this.auth('/sign-out');
    } finally {
      this.definir(false);
    }
  }

  async pedirRedefinicao(email: string): Promise<void> {
    await this.auth('/request-password-reset', { email: normalizarEmail(email), redirectTo: '/nova-senha' });
  }

  async redefinirSenha(token: string, novaSenha: string): Promise<void> {
    await this.auth('/reset-password', { token, newPassword: novaSenha });
    this.definir(false);
  }

  async alterarSenha(atual: string, nova: string): Promise<void> {
    await this.auth('/change-password', { currentPassword: atual, newPassword: nova, revokeOtherSessions: true });
  }

  async excluirConta(senha: string): Promise<void> {
    await this.auth('/delete-user', { password: senha });
    this.definir(false);
  }

  encerrarLocalmente(): void {
    this.definir(false);
  }
}
