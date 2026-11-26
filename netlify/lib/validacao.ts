import { ErroHttp, type Detalhe } from './http.ts';

/**
 * Validação de entrada das functions. Repete as regras do banco (que continua sendo a última
 * barreira) para responder 400 com o campo e o problema, e cobre o que o banco não consegue
 * ver: o tamanho dos textos, que chegam lá já cifrados.
 */

export const MAX_CENTAVOS = 99_999_999;

const FUSO = 'America/Sao_Paulo';
const partesSP = new Intl.DateTimeFormat('en-CA', { timeZone: FUSO, year: 'numeric', month: '2-digit', day: '2-digit' });

/** Hoje (YYYY-MM-DD) em São Paulo. */
export function hojeSP(agora: Date = new Date()): string {
  return partesSP.format(agora);
}

/** Soma anos a uma data ISO (29/02 vira 28/02 quando o ano não é bissexto). */
export function somarAnos(iso: string, anos: number): string {
  const [a, m, d] = iso.split('-').map(Number);
  const ultimo = new Date(Date.UTC(a + anos, m, 0)).getUTCDate();
  return `${a + anos}-${String(m).padStart(2, '0')}-${String(Math.min(d, ultimo)).padStart(2, '0')}`;
}

export class Validador {
  private readonly erros: Detalhe[] = [];

  constructor(private readonly dados: Record<string, unknown>) {}

  private falhar(campo: string, problema: string): undefined {
    this.erros.push({ campo, problema });
    return undefined;
  }

  enumeracao<T extends string>(campo: string, opcoes: readonly T[]): T | undefined {
    const v = this.dados[campo];
    if (v === undefined || v === null) return this.falhar(campo, 'obrigatorio');
    if (typeof v !== 'string' || !opcoes.includes(v as T)) return this.falhar(campo, 'valor_invalido');
    return v as T;
  }

  centavos(campo: string): number | undefined {
    const v = this.dados[campo];
    if (v === undefined || v === null) return this.falhar(campo, 'obrigatorio');
    if (typeof v !== 'number' || !Number.isInteger(v)) return this.falhar(campo, 'nao_inteiro');
    if (v < 1 || v > MAX_CENTAVOS) return this.falhar(campo, 'fora_do_intervalo');
    return v;
  }

  /** Texto obrigatório, com trim, entre min e max caracteres. */
  texto(campo: string, min: number, max: number): string | undefined {
    const v = this.dados[campo];
    if (v === undefined || v === null) return this.falhar(campo, 'obrigatorio');
    if (typeof v !== 'string') return this.falhar(campo, 'valor_invalido');
    const t = v.trim();
    if (t.length < min) return this.falhar(campo, t.length === 0 ? 'obrigatorio' : 'curto_demais');
    if (t.length > max) return this.falhar(campo, 'longo_demais');
    return t;
  }

  /** Texto opcional: ausente, null ou só espaços vira null. */
  textoOpcional(campo: string, max: number): string | null | undefined {
    const v = this.dados[campo];
    if (v === undefined || v === null) return null;
    if (typeof v !== 'string') return this.falhar(campo, 'valor_invalido');
    const t = v.trim();
    if (t.length > max) return this.falhar(campo, 'longo_demais');
    return t || null;
  }

  /** Data YYYY-MM-DD válida no calendário, opcionalmente dentro de [min, max]. */
  data(campo: string, limites: { min?: string; max?: string } = {}): string | undefined {
    const v = this.dados[campo];
    if (v === undefined || v === null) return this.falhar(campo, 'obrigatorio');
    if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return this.falhar(campo, 'formato_invalido');
    const d = new Date(`${v}T00:00:00Z`);
    if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v) return this.falhar(campo, 'formato_invalido');
    if (limites.max && v > limites.max) return this.falhar(campo, campo === 'data' ? 'futura' : 'fora_do_intervalo');
    if (limites.min && v < limites.min) return this.falhar(campo, 'fora_do_intervalo');
    return v;
  }

  /** Lança 400 dados_invalidos com todos os problemas encontrados, se houver. */
  conferir(): void {
    if (this.erros.length) throw new ErroHttp(400, 'dados_invalidos', this.erros);
  }
}

/** Lê `ano` e `mes` da query (obrigatórios) e `limite` (opcional, 1 a 100). */
export function lerMes(url: URL, comLimite = false): { ano: number; mes: number; limite: number | null } {
  const erros: Detalhe[] = [];
  const inteiro = (nome: string, min: number, max: number, obrigatorio: boolean): number | null => {
    const bruto = url.searchParams.get(nome);
    if (bruto === null || bruto === '') {
      if (obrigatorio) erros.push({ campo: nome, problema: 'obrigatorio' });
      return null;
    }
    const n = Number(bruto);
    if (!/^\d+$/.test(bruto) || n < min || n > max) {
      erros.push({ campo: nome, problema: 'fora_do_intervalo' });
      return null;
    }
    return n;
  };
  const ano = inteiro('ano', 2000, 2100, true);
  const mes = inteiro('mes', 1, 12, true);
  const limite = comLimite ? inteiro('limite', 1, 100, false) : null;
  if (erros.length) throw new ErroHttp(400, 'parametros_invalidos', erros);
  return { ano: ano!, mes: mes!, limite };
}
