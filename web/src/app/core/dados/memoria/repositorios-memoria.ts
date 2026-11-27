import { Injectable, inject, signal } from '@angular/core';
import { calcularResumo } from '../../calculos/resumo';
import {
  Caixinha, DadosCaixinha, Lancamento, MovimentoCaixinha, NovoLancamento, NovoMovimento, Perfil, ResumoMes,
} from '../../dominio/tipos';
import { Mes, intervaloDoMes } from '../../tempo/mes';
import {
  CaixinhasRepositorio, ErroCaixinha, ErroSessao, LancamentosRepositorio, NovaConta, PerfilRepositorio, ResumoRepositorio,
  SessaoRepositorio,
} from '../repositorios';
import { BancoMemoria } from './banco-memoria';

const noMes = (data: string, m: Mes) => {
  const { inicio, fim } = intervaloDoMes(m);
  return data >= inicio && data < fim;
};
const maisRecente = (a: { data: string; criadoEm: string }, b: { data: string; criadoEm: string }) =>
  b.data.localeCompare(a.data) || b.criadoEm.localeCompare(a.criadoEm);

@Injectable()
export class LancamentosMemoria extends LancamentosRepositorio {
  private readonly banco = inject(BancoMemoria);

  listarDoMes(m: Mes): Promise<Lancamento[]> {
    return this.banco.latencia(this.banco.dados.lancamentos.filter((l) => noMes(l.data, m)).sort(maisRecente));
  }

  async ultimos(m: Mes, limite: number): Promise<Lancamento[]> {
    return (await this.listarDoMes(m)).slice(0, limite);
  }

  obter(id: string): Promise<Lancamento> {
    const l = this.banco.dados.lancamentos.find((x) => x.id === id);
    return l ? this.banco.latencia(l) : Promise.reject(new Error('Lançamento não encontrado'));
  }

  criar(dados: NovoLancamento): Promise<Lancamento> {
    const novo: Lancamento = { ...dados, id: this.banco.novoId('l'), criadoEm: new Date().toISOString() };
    this.banco.dados.lancamentos.push(novo);
    return this.banco.latencia(novo);
  }

  async atualizar(id: string, dados: NovoLancamento): Promise<Lancamento> {
    const atual = await this.obter(id);
    const novo = { ...atual, ...dados };
    this.banco.dados.lancamentos = this.banco.dados.lancamentos.map((l) => (l.id === id ? novo : l));
    return this.banco.latencia(novo);
  }

  excluir(id: string): Promise<void> {
    this.banco.dados.lancamentos = this.banco.dados.lancamentos.filter((l) => l.id !== id);
    return this.banco.latencia(undefined);
  }
}

@Injectable()
export class CaixinhasMemoria extends CaixinhasRepositorio {
  private readonly banco = inject(BancoMemoria);

  private saldo(id: string): number {
    return this.banco.dados.movimentos
      .filter((m) => m.caixinhaId === id)
      .reduce((a, m) => a + (m.tipo === 'guardar' ? m.valorCentavos : -m.valorCentavos), 0);
  }

  private comSaldo(c: Omit<Caixinha, 'saldoCentavos'>): Caixinha {
    return { ...c, saldoCentavos: this.saldo(c.id) };
  }

  listar(): Promise<Caixinha[]> {
    const lista = this.banco.dados.caixinhas
      .map((c) => this.comSaldo(c))
      .sort((a, b) => a.prazo.localeCompare(b.prazo));
    return this.banco.latencia(lista);
  }

  obter(id: string): Promise<Caixinha> {
    const c = this.banco.dados.caixinhas.find((x) => x.id === id);
    return c ? this.banco.latencia(this.comSaldo(c)) : Promise.reject(new ErroCaixinha('nao_encontrada'));
  }

  criar(dados: DadosCaixinha): Promise<Caixinha> {
    const nova = { ...dados, nome: dados.nome.trim(), id: this.banco.novoId('c'), criadoEm: new Date().toISOString() };
    this.banco.dados.caixinhas.push(nova);
    return this.banco.latencia(this.comSaldo(nova));
  }

  async editar(id: string, dados: DadosCaixinha): Promise<Caixinha> {
    await this.obter(id);
    this.banco.dados.caixinhas = this.banco.dados.caixinhas.map((c) =>
      c.id === id ? { ...c, ...dados, nome: dados.nome.trim() } : c);
    return this.obter(id);
  }

  excluir(id: string): Promise<void> {
    if (this.saldo(id) !== 0) return Promise.reject(new ErroCaixinha('caixinha_com_saldo'));
    this.banco.dados.caixinhas = this.banco.dados.caixinhas.filter((c) => c.id !== id);
    this.banco.dados.movimentos = this.banco.dados.movimentos.filter((m) => m.caixinhaId !== id);
    return this.banco.latencia(undefined);
  }

  movimentos(caixinhaId: string): Promise<MovimentoCaixinha[]> {
    return this.banco.latencia(this.banco.dados.movimentos.filter((m) => m.caixinhaId === caixinhaId).sort(maisRecente));
  }

  movimentar(caixinhaId: string, mov: NovoMovimento): Promise<void> {
    if (mov.tipo === 'retirar' && mov.valorCentavos > this.saldo(caixinhaId)) {
      return Promise.reject(new ErroCaixinha('saldo_insuficiente'));
    }
    this.banco.dados.movimentos.push({
      ...mov, caixinhaId, id: this.banco.novoId('m'), criadoEm: new Date().toISOString(),
    });
    return this.banco.latencia(undefined);
  }
}

@Injectable()
export class ResumoMemoria extends ResumoRepositorio {
  private readonly banco = inject(BancoMemoria);

  resumoDoMes(m: Mes): Promise<ResumoMes> {
    const { lancamentos, movimentos } = this.banco.dados;
    return this.banco.latencia(calcularResumo(
      lancamentos.filter((l) => noMes(l.data, m)),
      movimentos.filter((x) => noMes(x.data, m)),
    ));
  }
}

@Injectable()
export class PerfilMemoria extends PerfilRepositorio {
  private readonly banco = inject(BancoMemoria);

  obter(): Promise<Perfil> {
    return this.banco.latencia(this.banco.dados.perfil);
  }

  atualizarNome(nome: string): Promise<Perfil> {
    this.banco.dados.perfil = { ...this.banco.dados.perfil, nome: nome.trim() };
    return this.obter();
  }
}

/**
 * Sessão de demonstração: começa logada como a pessoa da semente. Aceita qualquer senha
 * para e-mails conhecidos (a semente e os cadastrados). Nunca guarda a senha.
 * Troca e redefinição de senha só conferem que algo foi digitado; excluir a conta sai dela.
 */
@Injectable()
export class SessaoMemoria extends SessaoRepositorio {
  private readonly banco = inject(BancoMemoria);
  private readonly _autenticado = signal(true);
  readonly autenticado = this._autenticado.asReadonly();
  private readonly cadastrados = new Set<string>();

  async entrar(email: string, senha: string): Promise<void> {
    const e = email.trim().toLowerCase();
    const conhecido = e === this.banco.dados.perfil.email.toLowerCase() || this.cadastrados.has(e);
    if (!conhecido || !senha) throw new ErroSessao('credenciais_invalidas');
    this._autenticado.set(true);
  }

  async verificar(): Promise<boolean> {
    return this._autenticado();
  }

  async cadastrar(conta: NovaConta): Promise<void> {
    const e = conta.email.trim().toLowerCase();
    if (e === this.banco.dados.perfil.email.toLowerCase() || this.cadastrados.has(e)) {
      throw new ErroSessao('email_em_uso');
    }
    this.cadastrados.add(e);
    this._autenticado.set(true);
  }

  async sair(): Promise<void> {
    this._autenticado.set(false);
  }

  async pedirRedefinicao(): Promise<void> {
    // Resposta neutra: nada a fazer na demonstração.
  }

  async redefinirSenha(token: string, novaSenha: string): Promise<void> {
    if (!token) throw new ErroSessao('token_invalido');
    if (!novaSenha) throw new ErroSessao('senha_fraca');
    this._autenticado.set(false);
  }

  async alterarSenha(atual: string, nova: string): Promise<void> {
    if (!atual) throw new ErroSessao('senha_atual_incorreta');
    if (!nova) throw new ErroSessao('senha_fraca');
  }

  async excluirConta(senha: string): Promise<void> {
    if (!senha) throw new ErroSessao('senha_atual_incorreta');
    this._autenticado.set(false);
  }

  encerrarLocalmente(): void {
    this._autenticado.set(false);
  }
}
