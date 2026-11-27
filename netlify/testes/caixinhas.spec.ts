import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import handler from '../functions/caixinhas.mts';
import { cadastrar, chamar, diasAntes, diasDepois, hoje, limparContas, linhasCruas, type Conta } from './apoio.ts';

let a: Conta;
let b: Conta;
beforeAll(async () => { [a, b] = await Promise.all([cadastrar('Ana'), cadastrar('Bia')]); });
afterAll(limparContas);

interface Caixinha { id: string; nome: string; saldoCentavos: number; prazo: string; metaCentavos: number }
const dados = (extra: Record<string, unknown> = {}) =>
  ({ nome: 'Celular novo', icone: 'aparelho', metaCentavos: 200000, prazo: diasDepois(120), ...extra });

async function criar(conta: Conta, corpo = dados()): Promise<Caixinha> {
  const r = await chamar(handler, 'POST', '/api/caixinhas', { conta, corpo });
  expect(r.status).toBe(201);
  return (await r.json()) as Caixinha;
}
const mov = (conta: Conta, id: string, tipo: string, valorCentavos: number, data = hoje()) =>
  chamar(handler, 'POST', `/api/caixinhas/${id}/movimentos`, { conta, params: { id }, corpo: { tipo, valorCentavos, data } });

describe('/api/caixinhas', () => {
  it('cria, lê, edita e exclui; o nome fica cifrado no banco', async () => {
    const c = await criar(a);
    expect(c).toMatchObject({ nome: 'Celular novo', icone: 'aparelho', metaCentavos: 200000, saldoCentavos: 0 });
    const [linha] = await linhasCruas<{ nome_cifrado: string }>(a, 'select nome_cifrado from public.caixinhas where id = $1', [c.id]);
    expect(linha.nome_cifrado).toMatch(/^v1\./);
    expect(linha.nome_cifrado).not.toContain('Celular');

    const put = await chamar(handler, 'PUT', `/api/caixinhas/${c.id}`, {
      conta: a, params: { id: c.id }, corpo: dados({ nome: '  Viagem  ', icone: 'viagem', metaCentavos: 50000 }),
    });
    expect(await put.json()).toMatchObject({ nome: 'Viagem', icone: 'viagem', metaCentavos: 50000 });

    const lista = (await (await chamar(handler, 'GET', '/api/caixinhas', { conta: a })).json()) as Caixinha[];
    expect(lista.map((x) => x.id)).toContain(c.id);

    expect((await chamar(handler, 'DELETE', `/api/caixinhas/${c.id}`, { conta: a, params: { id: c.id } })).status).toBe(204);
    expect((await chamar(handler, 'GET', `/api/caixinhas/${c.id}`, { conta: a, params: { id: c.id } })).status).toBe(404);
  });

  it('lista por prazo mais próximo', async () => {
    const c = await cadastrar();
    await criar(c, dados({ nome: 'Longe', prazo: diasDepois(300) }));
    await criar(c, dados({ nome: 'Perto', prazo: diasDepois(10) }));
    const lista = (await (await chamar(handler, 'GET', '/api/caixinhas', { conta: c })).json()) as Caixinha[];
    expect(lista.map((x) => x.nome)).toEqual(['Perto', 'Longe']);
  });

  it('guardar e retirar atualizam o saldo; retirar acima do saldo dá 409', async () => {
    const c = await criar(a);
    expect((await mov(a, c.id, 'guardar', 1000)).status).toBe(201);
    const acima = await mov(a, c.id, 'retirar', 1001);
    expect(acima.status).toBe(409);
    expect(await acima.json()).toEqual({ erro: 'saldo_insuficiente' });
    expect((await mov(a, c.id, 'retirar', 400, diasAntes(1))).status).toBe(201);

    const atual = (await (await chamar(handler, 'GET', `/api/caixinhas/${c.id}`, { conta: a, params: { id: c.id } })).json()) as Caixinha;
    expect(atual.saldoCentavos).toBe(600);
    const hist = (await (await chamar(handler, 'GET', `/api/caixinhas/${c.id}/movimentos`, { conta: a, params: { id: c.id } })).json()) as { tipo: string }[];
    expect(hist.map((m) => m.tipo)).toEqual(['guardar', 'retirar']);
  });

  it('excluir com saldo dá 409 caixinha_com_saldo', async () => {
    const c = await criar(a);
    await mov(a, c.id, 'guardar', 500);
    const r = await chamar(handler, 'DELETE', `/api/caixinhas/${c.id}`, { conta: a, params: { id: c.id } });
    expect(r.status).toBe(409);
    expect(await r.json()).toEqual({ erro: 'caixinha_com_saldo' });
  });

  it('duas retiradas simultâneas que somadas passam do saldo: uma passa e a outra dá 409', async () => {
    const c = await criar(a);
    await mov(a, c.id, 'guardar', 1000);
    const status = (await Promise.all([mov(a, c.id, 'retirar', 700), mov(a, c.id, 'retirar', 700)])).map((r) => r.status);
    expect(status.sort()).toEqual([201, 409]);
  });

  it('B recebe 404 em todas as rotas com o id de A, inclusive movimentos', async () => {
    const c = await criar(a);
    await mov(a, c.id, 'guardar', 300);
    const casos = [
      ['GET', `/api/caixinhas/${c.id}`, undefined],
      ['PUT', `/api/caixinhas/${c.id}`, dados()],
      ['DELETE', `/api/caixinhas/${c.id}`, undefined],
      ['GET', `/api/caixinhas/${c.id}/movimentos`, undefined],
      ['POST', `/api/caixinhas/${c.id}/movimentos`, { tipo: 'guardar', valorCentavos: 1, data: hoje() }],
    ] as const;
    for (const [metodo, caminho, corpo] of casos) {
      const r = await chamar(handler, metodo, caminho, { conta: b, params: { id: c.id }, corpo });
      expect(r.status, `${metodo} ${caminho}`).toBe(404);
    }
    const lista = (await (await chamar(handler, 'GET', '/api/caixinhas', { conta: b })).json()) as Caixinha[];
    expect(lista.map((x) => x.id)).not.toContain(c.id);
    const intacta = (await (await chamar(handler, 'GET', `/api/caixinhas/${c.id}`, { conta: a, params: { id: c.id } })).json()) as Caixinha;
    expect(intacta).toMatchObject({ nome: 'Celular novo', saldoCentavos: 300 });
  });

  it('caminhos com sufixo (tentativas do netlify dev após um 404) não caem na lista', async () => {
    const c = await criar(a);
    for (const sufixo of ['/index.html', '.html', '/movimentos/index.html', '/outra-coisa']) {
      const r = await chamar(handler, 'GET', `/api/caixinhas/${c.id}${sufixo}`, { conta: b });
      expect(r.status, sufixo).toBe(404);
    }
    expect((await chamar(handler, 'GET', '/api/caixinhas/nao-e-uuid', { conta: a })).status).toBe(404);
  });

  it('sem sessão, 401', async () => {
    expect((await chamar(handler, 'GET', '/api/caixinhas')).status).toBe(401);
    expect((await chamar(handler, 'POST', '/api/caixinhas', { corpo: dados() })).status).toBe(401);
  });

  it.each([
    ['nome vazio', dados({ nome: '  ' }), 'nome', 'obrigatorio'],
    ['nome com 41 caracteres', dados({ nome: 'x'.repeat(41) }), 'nome', 'longo_demais'],
    ['ícone fora da lista', dados({ icone: 'foguete' }), 'icone', 'valor_invalido'],
    ['meta 0', dados({ metaCentavos: 0 }), 'metaCentavos', 'fora_do_intervalo'],
    ['prazo de ontem', dados({ prazo: diasAntes(1) }), 'prazo', 'fora_do_intervalo'],
    ['prazo depois de 10 anos', dados({ prazo: `${Number(hoje().slice(0, 4)) + 10}-12-31` }), 'prazo', 'fora_do_intervalo'],
    ['user_id no corpo', dados({ user_id: 'x' }), 'user_id', 'nao_permitido'],
  ])('recusa %s com 400', async (_, corpo, campo, problema) => {
    const r = await chamar(handler, 'POST', '/api/caixinhas', { conta: a, corpo });
    expect(r.status).toBe(400);
    expect(await r.json()).toEqual({ erro: 'dados_invalidos', detalhes: [{ campo, problema }] });
  });

  it('movimento com data futura ou valor 0 dá 400', async () => {
    const c = await criar(a);
    const futura = await mov(a, c.id, 'guardar', 10, diasDepois(1));
    expect(await futura.json()).toEqual({ erro: 'dados_invalidos', detalhes: [{ campo: 'data', problema: 'futura' }] });
    expect((await mov(a, c.id, 'guardar', 0)).status).toBe(400);
  });

  it('prazo de hoje é aceito', async () => {
    expect((await criar(a, dados({ prazo: hoje() }))).prazo).toBe(hoje());
  });
});
