import { IconeNome } from './icones';
import { CategoriaEntradaId, CategoriaGastoId, CategoriaId, TipoLancamento } from './tipos';

export interface Categoria {
  readonly id: CategoriaId;
  readonly rotulo: string;
  readonly icone: IconeNome;
  /** Cor da fatia na rosca e do ícone (R-03.9). */
  readonly cor: string;
  /** Fundo claro do ícone na lista. */
  readonly fundo: string;
  readonly tipo: TipoLancamento;
}

/** Categorias pré-definidas (resumo). Os ids espelham o `check` do banco (plan 02). */
export const CATEGORIAS: readonly Categoria[] = [
  { id: 'alimentacao', rotulo: 'Alimentação', icone: 'utensils', cor: '#00A3A6', fundo: '#E6FAFA', tipo: 'gasto' },
  { id: 'transporte', rotulo: 'Transporte', icone: 'bus', cor: '#2563EB', fundo: '#EFF4FF', tipo: 'gasto' },
  { id: 'lazer', rotulo: 'Lazer', icone: 'ticket', cor: '#D4B46A', fundo: '#FFF8E6', tipo: 'gasto' },
  { id: 'compras', rotulo: 'Compras', icone: 'shopping-bag', cor: '#8B5CF6', fundo: '#F3EFFF', tipo: 'gasto' },
  { id: 'contas', rotulo: 'Contas', icone: 'receipt-text', cor: '#64748B', fundo: '#F1F3F7', tipo: 'gasto' },
  { id: 'saude', rotulo: 'Saúde', icone: 'heart-pulse', cor: '#E5484D', fundo: '#FDEEEE', tipo: 'gasto' },
  { id: 'educacao', rotulo: 'Educação', icone: 'graduation-cap', cor: '#0EA5E9', fundo: '#EAF6FD', tipo: 'gasto' },
  { id: 'outros_gasto', rotulo: 'Outros', icone: 'ellipsis', cor: '#9CA3AF', fundo: '#F3F4F6', tipo: 'gasto' },
  { id: 'salario', rotulo: 'Salário/Bolsa', icone: 'wallet', cor: '#16A34A', fundo: '#EAF7EE', tipo: 'entrada' },
  { id: 'extra', rotulo: 'Extra', icone: 'coins', cor: '#16A34A', fundo: '#EAF7EE', tipo: 'entrada' },
  { id: 'presente', rotulo: 'Presente', icone: 'gift', cor: '#16A34A', fundo: '#EAF7EE', tipo: 'entrada' },
  { id: 'outros_entrada', rotulo: 'Outros', icone: 'ellipsis', cor: '#16A34A', fundo: '#EAF7EE', tipo: 'entrada' },
];

const porId = new Map(CATEGORIAS.map((c) => [c.id, c]));

export function categoria(id: CategoriaId): Categoria {
  const c = porId.get(id);
  if (!c) throw new Error(`Categoria desconhecida: ${id}`);
  return c;
}

export function categoriasDe(tipo: TipoLancamento): readonly Categoria[] {
  return CATEGORIAS.filter((c) => c.tipo === tipo);
}

export function ehCategoriaGasto(id: CategoriaId): id is CategoriaGastoId {
  return categoria(id).tipo === 'gasto';
}

export function ehCategoriaEntrada(id: CategoriaId): id is CategoriaEntradaId {
  return categoria(id).tipo === 'entrada';
}
