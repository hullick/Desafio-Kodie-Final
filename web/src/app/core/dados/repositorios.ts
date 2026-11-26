import { Mes } from '../tempo/mes';
import {
  Caixinha, DadosCaixinha, Lancamento, MovimentoCaixinha, NovoLancamento, NovoMovimento, Perfil, ResumoMes,
} from '../dominio/tipos';

/*
 * Contratos de acesso a dados. Os componentes e facades dependem SÓ destas classes abstratas
 * (usadas como tokens de DI). Hoje a implementação é em memória; o plan 00/01+ troca por Supabase
 * sem mexer em páginas ou componentes.
 */

export abstract class LancamentosRepositorio {
  abstract listarDoMes(m: Mes): Promise<Lancamento[]>;
  abstract obter(id: string): Promise<Lancamento>;
  abstract criar(dados: NovoLancamento): Promise<Lancamento>;
  abstract atualizar(id: string, dados: NovoLancamento): Promise<Lancamento>;
  abstract excluir(id: string): Promise<void>;
}

export abstract class CaixinhasRepositorio {
  abstract listar(): Promise<Caixinha[]>;
  abstract obter(id: string): Promise<Caixinha>;
  abstract criar(dados: DadosCaixinha): Promise<Caixinha>;
  abstract editar(id: string, dados: DadosCaixinha): Promise<Caixinha>;
  abstract excluir(id: string): Promise<void>;
  abstract movimentos(caixinhaId: string): Promise<MovimentoCaixinha[]>;
  abstract movimentar(caixinhaId: string, mov: NovoMovimento): Promise<void>;
}

export abstract class ResumoRepositorio {
  abstract resumoDoMes(m: Mes): Promise<ResumoMes>;
}

export abstract class PerfilRepositorio {
  abstract obter(): Promise<Perfil>;
  abstract atualizarNome(nome: string): Promise<Perfil>;
}

export type CodigoErroCaixinha = 'saldo_insuficiente' | 'caixinha_com_saldo' | 'nao_encontrada';

export class ErroCaixinha extends Error {
  constructor(readonly codigo: CodigoErroCaixinha) {
    super(codigo);
  }
}
