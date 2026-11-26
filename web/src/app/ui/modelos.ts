import { EstadoMeta } from '../core/calculos/meta';
import { IconeNome } from '../core/dominio/icones';
import { TipoLancamento, TipoMovimento } from '../core/dominio/tipos';

/*
 * View models: o que as moléculas e organismos recebem. São dados prontos para exibir,
 * sem regra de negócio. Os facades de cada página montam estes objetos.
 */

export interface TransacaoItemVM {
  readonly id: string;
  readonly titulo: string;
  readonly subtitulo: string;
  readonly centavos: number;
  readonly tipo: TipoLancamento;
  readonly icone: IconeNome;
  readonly cor: string;
  readonly fundo: string;
}

export interface GrupoTransacoesVM {
  readonly rotulo: string;
  readonly itens: readonly TransacaoItemVM[];
}

export interface FatiaCategoriaVM {
  readonly id: string;
  readonly rotulo: string;
  readonly icone: IconeNome;
  readonly cor: string;
  readonly fundo: string;
  readonly centavos: number;
  readonly percentual: number;
}

export interface CaixinhaCardVM {
  readonly id: string;
  readonly nome: string;
  readonly icone: IconeNome;
  readonly guardadoCentavos: number;
  readonly metaCentavos: number;
  readonly progresso: number;
  readonly percentual: number;
  readonly prazoRotulo: string;
  readonly sugeridoCentavos: number | null;
  readonly faltamCentavos: number;
  readonly estado: EstadoMeta;
}

export interface MovimentoItemVM {
  readonly id: string;
  readonly tipo: TipoMovimento;
  readonly titulo: string;
  readonly dataRotulo: string;
  readonly centavos: number;
}

export interface OpcaoVM<T> {
  readonly valor: T;
  readonly rotulo: string;
}

export interface OpcaoIconeVM<T> extends OpcaoVM<T> {
  readonly icone: IconeNome;
}
