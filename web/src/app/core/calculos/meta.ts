import { Mes, mesesInclusivos } from '../tempo/mes';

export type EstadoMeta = 'ativa' | 'atingida' | 'prazo_encerrado';

export interface CalculoMeta {
  /** 0..1, limitado a 1 para a barra */
  readonly progresso: number;
  /** percentual real com 1 casa (pode passar de 100) */
  readonly percentual: number;
  readonly faltamCentavos: number;
  readonly mesesRestantes: number;
  readonly sugeridoMensalCentavos: number | null;
  readonly estado: EstadoMeta;
}

/** Regras da spec 04 (Cálculos). */
export function calcularMeta(
  i: { metaCentavos: number; saldoCentavos: number; prazo: Mes },
  hoje: Mes,
): CalculoMeta {
  const razao = i.metaCentavos > 0 ? i.saldoCentavos / i.metaCentavos : 0;
  const percentual = Math.round(razao * 1000) / 10;
  const progresso = Math.min(1, Math.max(0, razao));
  const faltamCentavos = Math.max(0, i.metaCentavos - i.saldoCentavos);
  const mesesRestantes = mesesInclusivos(hoje, i.prazo);

  if (faltamCentavos === 0) {
    return { progresso: 1, percentual, faltamCentavos, mesesRestantes, sugeridoMensalCentavos: null, estado: 'atingida' };
  }
  if (mesesRestantes === 0) {
    return { progresso, percentual, faltamCentavos, mesesRestantes, sugeridoMensalCentavos: null, estado: 'prazo_encerrado' };
  }
  return {
    progresso,
    percentual,
    faltamCentavos,
    mesesRestantes,
    sugeridoMensalCentavos: Math.ceil(faltamCentavos / mesesRestantes),
    estado: 'ativa',
  };
}
