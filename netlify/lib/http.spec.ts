import { describe, expect, it } from 'vitest';
import { ErroHttp, lerCorpo, respostaDeErro, tratar } from './http.ts';

const corpo = async (r: Response) => ({ status: r.status, json: await r.json() });
const post = (body: string, tipo = 'application/json') =>
  new Request('http://localhost:8888/api/x', { method: 'POST', headers: { 'content-type': tipo }, body });

describe('http', () => {
  it('converte erros das triggers nos códigos da API', async () => {
    expect(await corpo(respostaDeErro({ code: 'P0001', message: 'saldo_insuficiente' })))
      .toEqual({ status: 409, json: { erro: 'saldo_insuficiente' } });
    expect(await corpo(respostaDeErro({ code: 'P0001', message: 'caixinha_inexistente' })))
      .toEqual({ status: 404, json: { erro: 'nao_encontrado' } });
    expect(await corpo(respostaDeErro({ code: '23514', message: 'check' })))
      .toEqual({ status: 400, json: { erro: 'dados_invalidos' } });
  });

  it('erro desconhecido vira 500 interno, sem detalhes', async () => {
    const r = await corpo(respostaDeErro(new Error('senha do banco: xyz')));
    expect(r).toEqual({ status: 500, json: { erro: 'interno' } });
  });

  it('lerCorpo recusa user_id e campos desconhecidos', async () => {
    await expect(lerCorpo(post('{"nome":"x","user_id":"b"}'), ['nome'])).rejects.toMatchObject({
      status: 400, codigo: 'dados_invalidos', detalhes: [{ campo: 'user_id', problema: 'nao_permitido' }],
    });
  });

  it('lerCorpo recusa JSON inválido, tipo errado e corpo grande', async () => {
    await expect(lerCorpo(post('{'), [])).rejects.toMatchObject({ status: 400, codigo: 'json_invalido' });
    await expect(lerCorpo(post('[]'), [])).rejects.toMatchObject({ status: 400, codigo: 'json_invalido' });
    await expect(lerCorpo(post('{}', 'text/plain'), [])).rejects.toMatchObject({ status: 415 });
    await expect(lerCorpo(post(JSON.stringify({ a: 'x'.repeat(17_000) })), ['a'])).rejects.toMatchObject({ status: 413 });
  });

  it('tratar recusa escrita vinda de outra origem', async () => {
    const h = tratar(async () => new Response('ok'));
    const req = new Request('http://localhost:8888/api/x', { method: 'POST', headers: { origin: 'https://evil.example' } });
    expect(await corpo(await h(req, {} as never))).toEqual({ status: 403, json: { erro: 'origem_invalida' } });
    const get = new Request('http://localhost:8888/api/x', { headers: { origin: 'https://evil.example' } });
    expect((await h(get, {} as never)).status).toBe(200);
  });

  it('405 traz o cabeçalho Allow', async () => {
    const r = respostaDeErro(new ErroHttp(405, 'metodo_nao_permitido', undefined, { allow: 'GET' }));
    expect(r.headers.get('allow')).toBe('GET');
  });
});
