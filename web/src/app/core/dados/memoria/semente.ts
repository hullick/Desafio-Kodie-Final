import { Mes, hojeISO, mesAtual, somarMeses } from '../../tempo/mes';
import { Caixinha, Lancamento, MovimentoCaixinha, Perfil } from '../../dominio/tipos';

export interface BancoSemente {
  perfil: Perfil;
  lancamentos: Lancamento[];
  caixinhas: Omit<Caixinha, 'saldoCentavos'>[];
  movimentos: MovimentoCaixinha[];
}

/**
 * Dados de demonstração baseados nos mockups (Lari, R$ 642,30 de saldo).
 * Datas relativas a hoje, nunca no futuro. Movimentos de caixinha ficam no mês anterior
 * para o saldo do mês atual bater com o mockup.
 */
export function criarSemente(agora: Date = new Date()): BancoSemente {
  const hoje = hojeISO(agora);
  const m = mesAtual(agora);
  const diaHoje = Number(hoje.slice(8, 10));
  const dia = (d: number) => `${hoje.slice(0, 8)}${String(Math.max(1, Math.min(d, diaHoje))).padStart(2, '0')}`;
  const anterior = somarMeses(m, -1);
  const diaAnterior = (d: number) => `${anterior.ano}-${String(anterior.mes).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const criadoEm = agora.toISOString();
  const lanc = (id: string, p: Omit<Lancamento, 'id' | 'criadoEm'>): Lancamento => ({ id, criadoEm, ...p });
  const prazo = (n: number): Mes => somarMeses(m, n);

  return {
    perfil: {
      nome: 'Larissa Santos',
      email: 'lari@exemplo.com',
      criadoEm: `${anterior.ano}-${String(anterior.mes).padStart(2, '0')}-01T12:00:00.000Z`,
      versaoPolitica: '2026-11',
      aceitePoliticaEm: `${anterior.ano}-${String(anterior.mes).padStart(2, '0')}-01T12:00:00.000Z`,
    },
    lancamentos: [
      lanc('l1', { tipo: 'entrada', categoria: 'salario', valorCentavos: 141200, descricao: 'Bolsa de estágio', data: dia(5) }),
      lanc('l2', { tipo: 'gasto', categoria: 'alimentacao', valorCentavos: 3850, descricao: 'iFood Delivery', data: dia(diaHoje) }),
      lanc('l3', { tipo: 'gasto', categoria: 'transporte', valorCentavos: 4400, descricao: 'Recarga Bilhete Único', data: dia(diaHoje - 1) }),
      lanc('l4', { tipo: 'gasto', categoria: 'lazer', valorCentavos: 4200, descricao: 'Cinema & Pipoca', data: dia(15) }),
      lanc('l5', { tipo: 'gasto', categoria: 'alimentacao', valorCentavos: 28150, descricao: 'Mercado do mês', data: dia(6) }),
      lanc('l6', { tipo: 'gasto', categoria: 'transporte', valorCentavos: 13600, descricao: 'Aplicativo de corrida', data: dia(12) }),
      lanc('l7', { tipo: 'gasto', categoria: 'lazer', valorCentavos: 9300, descricao: 'Show', data: dia(9) }),
      lanc('l8', { tipo: 'gasto', categoria: 'compras', valorCentavos: 8470, descricao: 'Camiseta', data: dia(8) }),
      lanc('l9', { tipo: 'gasto', categoria: 'contas', valorCentavos: 5000, descricao: 'Plano do celular', data: dia(7) }),
    ],
    caixinhas: [
      { id: 'c1', nome: 'Reserva de Emergência', icone: 'reserva', metaCentavos: 100000, prazo: prazo(1), criadoEm },
      { id: 'c2', nome: 'Viagem Fim de Ano', icone: 'viagem', metaCentavos: 80000, prazo: prazo(2), criadoEm },
      { id: 'c3', nome: 'Celular novo', icone: 'aparelho', metaCentavos: 200000, prazo: prazo(4), criadoEm },
      { id: 'c4', nome: 'Fone Bluetooth', icone: 'presente', metaCentavos: 40000, prazo: prazo(1), criadoEm },
    ],
    movimentos: [
      { id: 'm1', caixinhaId: 'c1', tipo: 'guardar', valorCentavos: 45000, data: diaAnterior(10), criadoEm },
      { id: 'm2', caixinhaId: 'c2', tipo: 'guardar', valorCentavos: 30000, data: diaAnterior(10), criadoEm },
      { id: 'm3', caixinhaId: 'c3', tipo: 'guardar', valorCentavos: 25000, data: diaAnterior(1), criadoEm },
      { id: 'm4', caixinhaId: 'c3', tipo: 'guardar', valorCentavos: 25000, data: diaAnterior(12), criadoEm },
      { id: 'm5', caixinhaId: 'c3', tipo: 'guardar', valorCentavos: 30000, data: diaAnterior(20), criadoEm },
      { id: 'm6', caixinhaId: 'c4', tipo: 'guardar', valorCentavos: 40000, data: diaAnterior(15), criadoEm },
    ],
  };
}

