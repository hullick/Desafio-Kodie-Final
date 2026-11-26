import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import handler from '../functions/lancamentos.mts';
import { cadastrar, chamar, diasAntes, diasDepois, hoje, limparContas, linhasCruas, type Conta } from './apoio.ts';

let a: Conta;
let b: Conta;
beforeAll(async () => { [a, b] = await Promise.all([cadastrar('Ana'), cadastrar('Bia')]); });
afterAll(limparContas);

const gasto = (extra: Record<string, unknown> = {}) =>
  ({ tipo: 'gasto', valorCentavos: 1250, categoria: 'alimentacao', descricao: 'Almoço no bandejão', data: hoje(), ...extra });
const [ano, mes] = hoje().split('-').map(Number);

async function criar(conta: Conta, corpo = gasto()) {
  const r = await chamar(handler, 'POST', '/api/lancamentos', { conta, corpo });
  expect(r.status).toBe(201);
  return (await r.json()) as { id: string; descricao: string | null; data: string };
}

describe('/api/lancamentos', () => {
  it('CRUD completo como dono', async () => {
    const l = await criar(a);
    expect(l).toMatchObject({ tipo: 'gasto', valorCentavos: 1250, categoria: 'alimentacao', descricao: 'Almoço no bandejão' });

    const obtido = await chamar(handler, 'GET', `/api/lancamentos/${l.id}`, { conta: a, params: { id: l.id } });
    expect(await obtido.json()).toEqual(l);

    const put = await chamar(handler, 'PUT', `/api/lancamentos/${l.id}`, {
      conta: a, params: { id: l.id }, corpo: gasto({ tipo: 'entrada', categoria: 'salario', descricao: '   ', valorCentavos: 141200 }),
    });
    expect(put.status).toBe(200);
    expect(await put.json()).toMatchObject({ tipo: 'entrada', categoria: 'salario', descricao: null, valorCentavos: 141200 });

    const del = await chamar(handler, 'DELETE', `/api/lancamentos/${l.id}`, { conta: a, params: { id: l.id } });
    expect(del.status).toBe(204);
    const sumiu = await chamar(handler, 'GET', `/api/lancamentos/${l.id}`, { conta: a, params: { id: l.id } });
    expect(sumiu.status).toBe(404);
  });

  it('a descrição fica cifrada no banco', async () => {
    const l = await criar(a, gasto({ descricao: 'Presente da Ana' }));
    const [linha] = await linhasCruas<{ descricao_cifrada: string }>(a,
      'select descricao_cifrada from public.lancamentos where id = $1', [l.id]);
    expect(linha.descricao_cifrada).toMatch(/^v1\./);
    expect(linha.descricao_cifrada).not.toContain('Ana');
  });

  it('lista o mês do mais recente para o mais antigo, com limite opcional', async () => {
    const c = await cadastrar();
    await criar(c, gasto({ data: hoje(), descricao: 'hoje' }));
    await criar(c, gasto({ data: hoje().slice(0, 8) + '01', descricao: 'dia 1' }));
    const r = await chamar(handler, 'GET', `/api/lancamentos?ano=${ano}&mes=${mes}`, { conta: c });
    const lista = (await r.json()) as { descricao: string }[];
    expect(lista.map((l) => l.descricao)).toEqual(hoje().endsWith('-01') ? ['dia 1', 'hoje'] : ['hoje', 'dia 1']);
    const um = await chamar(handler, 'GET', `/api/lancamentos?ano=${ano}&mes=${mes}&limite=1`, { conta: c });
    expect((await um.json()) as unknown[]).toHaveLength(1);
    const outroMes = await chamar(handler, 'GET', `/api/lancamentos?ano=2001&mes=1`, { conta: c });
    expect(await outroMes.json()).toEqual([]);
  });

  it('B não vê, não lê, não edita e não apaga o lançamento de A (404)', async () => {
    const l = await criar(a);
    const lista = (await (await chamar(handler, 'GET', `/api/lancamentos?ano=${ano}&mes=${mes}`, { conta: b })).json()) as { id: string }[];
    expect(lista.map((x) => x.id)).not.toContain(l.id);
    for (const [metodo, corpo] of [['GET', undefined], ['PUT', gasto()], ['DELETE', undefined]] as const) {
      const r = await chamar(handler, metodo, `/api/lancamentos/${l.id}`, { conta: b, params: { id: l.id }, corpo });
      expect(r.status, metodo).toBe(404);
      expect(await r.json()).toEqual({ erro: 'nao_encontrado' });
    }
    const intacto = await chamar(handler, 'GET', `/api/lancamentos/${l.id}`, { conta: a, params: { id: l.id } });
    expect(intacto.status).toBe(200);
  });

  it('sem sessão, 401 em todas as rotas', async () => {
    const id = '00000000-0000-4000-8000-000000000000';
    const casos = [
      ['GET', `/api/lancamentos?ano=${ano}&mes=${mes}`, {}],
      ['POST', '/api/lancamentos', {}],
      ['GET', `/api/lancamentos/${id}`, { id }],
      ['PUT', `/api/lancamentos/${id}`, { id }],
      ['DELETE', `/api/lancamentos/${id}`, { id }],
    ] as const;
    for (const [metodo, caminho, params] of casos) {
      const corpo = metodo === 'POST' || metodo === 'PUT' ? gasto() : undefined;
      const r = await chamar(handler, metodo, caminho, { params, corpo });
      expect(r.status, `${metodo} ${caminho}`).toBe(401);
      expect(await r.json()).toEqual({ erro: 'nao_autenticado' });
    }
  });

  it.each([
    ['user_id no corpo', gasto({ user_id: 'b' }), 'user_id', 'nao_permitido'],
    ['valor 0', gasto({ valorCentavos: 0 }), 'valorCentavos', 'fora_do_intervalo'],
    ['valor acima do máximo', gasto({ valorCentavos: 100_000_000 }), 'valorCentavos', 'fora_do_intervalo'],
    ['valor fracionado', gasto({ valorCentavos: 12.5 }), 'valorCentavos', 'nao_inteiro'],
    ['categoria de outro tipo', gasto({ categoria: 'salario' }), 'categoria', 'valor_invalido'],
    ['tipo inválido', gasto({ tipo: 'pix' }), 'tipo', 'valor_invalido'],
    ['descrição com 61 caracteres', gasto({ descricao: 'x'.repeat(61) }), 'descricao', 'longo_demais'],
    ['data futura', gasto({ data: diasDepois(1) }), 'data', 'futura'],
    ['data inexistente', gasto({ data: '2026-02-30' }), 'data', 'formato_invalido'],
    ['sem data', gasto({ data: undefined }), 'data', 'obrigatorio'],
  ])('recusa %s com 400', async (_, corpo, campo, problema) => {
    const r = await chamar(handler, 'POST', '/api/lancamentos', { conta: a, corpo });
    expect(r.status).toBe(400);
    expect(await r.json()).toEqual({ erro: 'dados_invalidos', detalhes: [{ campo, problema }] });
  });

  it('aceita data no passado e descrição exatamente com 60 caracteres', async () => {
    const l = await criar(a, gasto({ data: diasAntes(40), descricao: 'x'.repeat(60) }));
    expect(l.data).toBe(diasAntes(40));
  });

  it.each([
    ['sem ano', `mes=${mes}`],
    ['mês 13', `ano=${ano}&mes=13`],
    ['limite 0', `ano=${ano}&mes=${mes}&limite=0`],
    ['ano não numérico', `ano=abc&mes=1`],
  ])('GET com %s dá 400 parametros_invalidos', async (_, query) => {
    const r = await chamar(handler, 'GET', `/api/lancamentos?${query}`, { conta: a });
    expect(r.status).toBe(400);
    expect(((await r.json()) as { erro: string }).erro).toBe('parametros_invalidos');
  });

  it('erros de formato: JSON inválido, content-type, id malformado e método', async () => {
    expect((await chamar(handler, 'POST', '/api/lancamentos', { conta: a, corpo: '{' })).status).toBe(400);
    expect((await chamar(handler, 'POST', '/api/lancamentos', { conta: a, corpo: '{}', tipo: 'text/plain' })).status).toBe(415);
    expect((await chamar(handler, 'GET', '/api/lancamentos/123', { conta: a, params: { id: '123' } })).status).toBe(404);
    const patch = await chamar(handler, 'PATCH', '/api/lancamentos', { conta: a });
    expect(patch.status).toBe(405);
    expect(patch.headers.get('allow')).toBe('GET, POST');
  });
});
