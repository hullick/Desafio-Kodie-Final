import { calcularMeta, CalculoMeta } from '../../core/calculos/meta';
import { percentuais } from '../../core/calculos/resumo';
import { categoria } from '../../core/dominio/categorias';
import { iconeDaCaixinha } from '../../core/dominio/icones-caixinha';
import { Caixinha, CategoriaGastoId, Lancamento, MovimentoCaixinha, NovoLancamento } from '../../core/dominio/tipos';
import { Mes, rotuloDia, rotuloMesCurto } from '../../core/tempo/mes';
import { CaixinhaCardVM, FatiaCategoriaVM, GrupoTransacoesVM, MovimentoItemVM, TransacaoItemVM } from '../../ui/modelos';

/*
 * Funções puras que traduzem o domínio para os view models da UI.
 * Os facades chamam estas funções; os componentes só recebem o resultado.
 */

export function paraTransacaoVM(l: Lancamento, hoje: string, comData = true): TransacaoItemVM {
  const c = categoria(l.categoria);
  return {
    id: l.id,
    titulo: l.descricao || c.rotulo,
    subtitulo: comData ? `${c.rotulo} • ${rotuloDia(l.data, hoje)}` : c.rotulo,
    centavos: l.valorCentavos,
    tipo: l.tipo,
    icone: c.icone,
    cor: c.cor,
    fundo: c.fundo,
  };
}

/** Agrupa por dia, mantendo a ordem recebida (mais recente primeiro) (R-02.8). */
export function agruparPorDia(lancamentos: readonly Lancamento[], hoje: string): GrupoTransacoesVM[] {
  const grupos = new Map<string, TransacaoItemVM[]>();
  for (const l of lancamentos) {
    const rotulo = rotuloDia(l.data, hoje);
    grupos.set(rotulo, [...(grupos.get(rotulo) ?? []), paraTransacaoVM(l, hoje, false)]);
  }
  return [...grupos].map(([rotulo, itens]) => ({ rotulo, itens }));
}

export function paraFatiasVM(porCategoria: readonly { categoria: CategoriaGastoId; total: number }[]): FatiaCategoriaVM[] {
  return percentuais(porCategoria).map((f) => {
    const c = categoria(f.categoria);
    return { id: c.id, rotulo: c.rotulo, icone: c.icone, cor: c.cor, fundo: c.fundo, centavos: f.total, percentual: f.percentual };
  });
}

export function paraCaixinhaVM(c: Caixinha, hoje: Mes): CaixinhaCardVM & { readonly calculo: CalculoMeta } {
  const calculo = calcularMeta(c, hoje);
  return {
    id: c.id,
    nome: c.nome,
    icone: iconeDaCaixinha(c.icone),
    guardadoCentavos: c.saldoCentavos,
    metaCentavos: c.metaCentavos,
    progresso: calculo.progresso,
    percentual: calculo.percentual,
    prazoRotulo: rotuloMesCurto(c.prazo),
    sugeridoCentavos: calculo.sugeridoMensalCentavos,
    faltamCentavos: calculo.faltamCentavos,
    estado: calculo.estado,
    calculo,
  };
}

export function paraMovimentoVM(m: MovimentoCaixinha, hoje: string): MovimentoItemVM {
  return {
    id: m.id,
    tipo: m.tipo,
    titulo: m.tipo === 'guardar' ? 'Guardou' : 'Retirou',
    dataRotulo: rotuloDia(m.data, hoje),
    centavos: m.valorCentavos,
  };
}

export function paraNovoLancamento(l: Lancamento): NovoLancamento {
  return { tipo: l.tipo, valorCentavos: l.valorCentavos, categoria: l.categoria, descricao: l.descricao, data: l.data };
}
