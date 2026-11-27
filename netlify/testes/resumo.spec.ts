import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import caixinhas from '../functions/caixinhas.mts';
import lancamentos from '../functions/lancamentos.mts';
import resumo from '../functions/resumo.mts';
import { cadastrar, chamar, hoje, limparContas, type Conta } from './apoio.ts';

let a: Conta;
let b: Conta;
const [ano, mes] = hoje().split('-').map(Number);

beforeAll(async () => {
  [a, b] = await Promise.all([cadastrar('Ana'), cadastrar('Bia')]);
  const lanc = (conta: Conta, tipo: string, valorCentavos: number, categoria: string) =>
    chamar(lancamentos, 'POST', '/api/lancamentos', { conta, corpo: { tipo, valorCentavos, categoria, data: hoje() } });
  await lanc(a, 'entrada', 141200, 'salario');
  await lanc(a, 'gasto', 32000, 'alimentacao');
  await lanc(a, 'gasto', 18000, 'transporte');
  await lanc(b, 'gasto', 99900, 'lazer');
  const c = (await (await chamar(caixinhas, 'POST', '/api/caixinhas', {
    conta: a, corpo: { nome: 'Reserva', icone: 'reserva', metaCentavos: 100000, prazo: hoje() },
  })).json()) as { id: string };
  const mov = (tipo: string, valorCentavos: number) => chamar(caixinhas, 'POST', `/api/caixinhas/${c.id}/movimentos`, {
    conta: a, params: { id: c.id }, corpo: { tipo, valorCentavos, data: hoje() },
  });
  await mov('guardar', 30000);
  await mov('retirar', 5000);
});
afterAll(limparContas);

describe('/api/resumo', () => {
  it('soma o mês de A: saldo = entradas − gastos − guardado líquido', async () => {
    const r = await chamar(resumo, 'GET', `/api/resumo?ano=${ano}&mes=${mes}`, { conta: a });
    expect(await r.json()).toEqual({
      entradas: 141200,
      gastos: 50000,
      guardadoLiquido: 25000,
      saldo: 66200,
      porCategoria: [{ categoria: 'alimentacao', total: 32000 }, { categoria: 'transporte', total: 18000 }],
    });
  });

  it('B só vê os próprios números', async () => {
    const r = await chamar(resumo, 'GET', `/api/resumo?ano=${ano}&mes=${mes}`, { conta: b });
    expect(await r.json()).toMatchObject({ entradas: 0, gastos: 99900, guardadoLiquido: 0 });
  });

  it('mês vazio dá zeros', async () => {
    const r = await chamar(resumo, 'GET', '/api/resumo?ano=2001&mes=1', { conta: a });
    expect(await r.json()).toEqual({ entradas: 0, gastos: 0, guardadoLiquido: 0, saldo: 0, porCategoria: [] });
  });

  it('sem sessão dá 401, mês 13 dá 400 e POST dá 405', async () => {
    expect((await chamar(resumo, 'GET', `/api/resumo?ano=${ano}&mes=${mes}`)).status).toBe(401);
    const r = await chamar(resumo, 'GET', `/api/resumo?ano=${ano}&mes=13`, { conta: a });
    expect(await r.json()).toEqual({ erro: 'parametros_invalidos', detalhes: [{ campo: 'mes', problema: 'fora_do_intervalo' }] });
    expect((await chamar(resumo, 'POST', '/api/resumo', { conta: a })).status).toBe(405);
    expect((await chamar(resumo, 'GET', '/api/resumo/index.html', { conta: a })).status).toBe(404);
  });
});
