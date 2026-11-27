export interface Mes {
  readonly ano: number;
  /** 1 a 12 */
  readonly mes: number;
}

const FUSO = 'America/Sao_Paulo';
const NOMES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];
const CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const partesSP = new Intl.DateTimeFormat('en-CA', {
  timeZone: FUSO, year: 'numeric', month: '2-digit', day: '2-digit',
});

/** Data de hoje (YYYY-MM-DD) no fuso de São Paulo. */
export function hojeISO(agora: Date = new Date()): string {
  return partesSP.format(agora);
}

export function mesAtual(agora: Date = new Date()): Mes {
  return mesDeISO(hojeISO(agora));
}

export function mesDeISO(dataISO: string): Mes {
  const [ano, mes] = dataISO.split('-').map(Number);
  return { ano, mes };
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "Novembro 2026" */
export function rotuloMes(m: Mes): string {
  return `${cap(NOMES[m.mes - 1])} ${m.ano}`;
}

/** "novembro" */
export function nomeMes(m: Mes): string {
  return NOMES[m.mes - 1];
}

/** "nov/2026" */
export function rotuloMesCurto(m: Mes): string {
  return `${CURTOS[m.mes - 1]}/${m.ano}`;
}

export function somarMeses(m: Mes, n: number): Mes {
  const indice = m.ano * 12 + (m.mes - 1) + n;
  return { ano: Math.floor(indice / 12), mes: (indice % 12) + 1 };
}

export function compararMes(a: Mes, b: Mes): -1 | 0 | 1 {
  const d = (a.ano - b.ano) * 12 + (a.mes - b.mes);
  return d < 0 ? -1 : d > 0 ? 1 : 0;
}

/** Quantidade de meses de `de` até `ate`, contando os dois. 0 se `ate` é anterior. */
export function mesesInclusivos(de: Mes, ate: Mes): number {
  const d = (ate.ano - de.ano) * 12 + (ate.mes - de.mes) + 1;
  return Math.max(0, d);
}

/** Primeiro dia (inclusive) e primeiro dia do mês seguinte (exclusive), em ISO. */
export function intervaloDoMes(m: Mes): { inicio: string; fim: string } {
  const prox = somarMeses(m, 1);
  const iso = (x: Mes) => `${x.ano}-${String(x.mes).padStart(2, '0')}-01`;
  return { inicio: iso(m), fim: iso(prox) };
}

/** Último dia do mês em ISO (usado como prazo de caixinha). */
export function ultimoDiaISO(m: Mes): string {
  const dia = new Date(Date.UTC(m.ano, m.mes, 0)).getUTCDate();
  return `${m.ano}-${String(m.mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

/** "Hoje", "Ontem" ou "25 de nov." relativo a `hoje` (ISO). */
export function rotuloDia(dataISO: string, hoje: string): string {
  if (dataISO === hoje) return 'Hoje';
  const ontem = new Date(`${hoje}T12:00:00Z`);
  ontem.setUTCDate(ontem.getUTCDate() - 1);
  if (dataISO === ontem.toISOString().slice(0, 10)) return 'Ontem';
  const [, m, d] = dataISO.split('-').map(Number);
  return `${d} de ${CURTOS[m - 1]}.`;
}

/** "05/03/2027" (prazo da caixinha). */
export function formatarData(dataISO: string): string {
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
}

/** Soma `n` meses a uma data ISO, mantendo o dia ou usando o último dia do mês se ele não existir. */
export function somarMesesISO(dataISO: string, n: number): string {
  const [, , dia] = dataISO.split('-').map(Number);
  const m = somarMeses(mesDeISO(dataISO), n);
  const ultimo = Number(ultimoDiaISO(m).slice(8, 10));
  return `${m.ano}-${String(m.mes).padStart(2, '0')}-${String(Math.min(dia, ultimo)).padStart(2, '0')}`;
}
