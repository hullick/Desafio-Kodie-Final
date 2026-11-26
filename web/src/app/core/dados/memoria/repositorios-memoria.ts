import { Injectable, inject } from '@angular/core';
import { calcularResumo } from '../../calculos/resumo';
import {
  Caixinha, DadosCaixinha, Lancamento, MovimentoCaixinha, NovoLancamento, NovoMovimento, Perfil, ResumoMes,
} from '../../dominio/tipos';
import { Mes, intervaloDoMes } from '../../tempo/mes';
import {
  CaixinhasRepositorio, ErroCaixinha, LancamentosRepositorio, PerfilRepositorio, ResumoRepositorio,
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
      .sort((a, b) => a.prazo.ano - b.prazo.ano || a.prazo.mes - b.prazo.mes);
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
