import { Mes } from '../tempo/mes';

export type TipoLancamento = 'gasto' | 'entrada';

export interface Lancamento {
  readonly id: string;
  readonly tipo: TipoLancamento;
  readonly valorCentavos: number;
  readonly categoria: CategoriaId;
  readonly descricao: string | null;
  /** YYYY-MM-DD */
  readonly data: string;
  readonly criadoEm: string;
}

export type NovoLancamento = Omit<Lancamento, 'id' | 'criadoEm'>;

export type CategoriaGastoId =
  | 'alimentacao' | 'transporte' | 'lazer' | 'compras' | 'contas' | 'saude' | 'educacao' | 'outros_gasto';
export type CategoriaEntradaId = 'salario' | 'extra' | 'presente' | 'outros_entrada';
export type CategoriaId = CategoriaGastoId | CategoriaEntradaId;

export type IconeCaixinha =
  | 'aparelho' | 'viagem' | 'reserva' | 'estudos' | 'casa' | 'carro' | 'presente' | 'outro';

export interface Caixinha {
  readonly id: string;
  readonly nome: string;
  readonly icone: IconeCaixinha;
  readonly metaCentavos: number;
  readonly prazo: Mes;
  readonly saldoCentavos: number;
  readonly criadoEm: string;
}

export type DadosCaixinha = Pick<Caixinha, 'nome' | 'icone' | 'metaCentavos' | 'prazo'>;

export type TipoMovimento = 'guardar' | 'retirar';

export interface MovimentoCaixinha {
  readonly id: string;
  readonly caixinhaId: string;
  readonly tipo: TipoMovimento;
  readonly valorCentavos: number;
  readonly data: string;
  readonly criadoEm: string;
}

export type NovoMovimento = Pick<MovimentoCaixinha, 'tipo' | 'valorCentavos' | 'data'>;

export interface Perfil {
  readonly nome: string;
  readonly email: string;
  /** ISO */
  readonly criadoEm: string;
  readonly versaoPolitica: string;
  readonly aceitePoliticaEm: string;
}

export interface ResumoMes {
  readonly entradas: number;
  readonly gastos: number;
  readonly guardadoLiquido: number;
  readonly saldo: number;
  readonly porCategoria: readonly { categoria: CategoriaGastoId; total: number }[];
}
