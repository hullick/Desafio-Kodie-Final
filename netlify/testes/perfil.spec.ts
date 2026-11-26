import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import perfil from '../functions/perfil.mts';
import { cadastrar, chamar, limparContas, linhasCruas, type Conta } from './apoio.ts';

let a: Conta;
let b: Conta;
beforeAll(async () => { [a, b] = await Promise.all([cadastrar('Larissa'), cadastrar('Bruno')]); });
afterAll(limparContas);

describe('/api/perfil', () => {
  it('GET devolve nome, e-mail, cadastro e aceite de quem está logado', async () => {
    const r = await chamar(perfil, 'GET', '/api/perfil', { conta: a });
    const p = (await r.json()) as Record<string, string>;
    expect(p).toMatchObject({ nome: 'Larissa', email: a.email, versaoPolitica: '2026-11' });
    expect(new Date(p['criadoEm']).getTime()).toBeGreaterThan(Date.now() - 60_000);
    expect(new Date(p['aceitePoliticaEm']).getTime()).toBeGreaterThan(Date.now() - 60_000);
  });

  it('PATCH troca o nome (cifrado) sem afetar B', async () => {
    const r = await chamar(perfil, 'PATCH', '/api/perfil', { conta: a, corpo: { nome: '  Lari  ' } });
    expect(((await r.json()) as { nome: string }).nome).toBe('Lari');
    const [linha] = await linhasCruas<{ nome_cifrado: string }>(a, 'select nome_cifrado from public.perfis');
    expect(linha.nome_cifrado).not.toContain('Lari');
    const rb = await chamar(perfil, 'GET', '/api/perfil', { conta: b });
    expect(((await rb.json()) as { nome: string; email: string })).toMatchObject({ nome: 'Bruno', email: b.email });
  });

  it.each([
    ['nome curto', { nome: 'L' }, 'nome', 'curto_demais'],
    ['nome com 41 caracteres', { nome: 'x'.repeat(41) }, 'nome', 'longo_demais'],
    ['versaoPolitica', { nome: 'Lari', versaoPolitica: '2030-01' }, 'versaoPolitica', 'nao_permitido'],
    ['email', { email: 'outro@x.com' }, 'email', 'nao_permitido'],
  ])('PATCH com %s dá 400', async (_, corpo, campo, problema) => {
    const r = await chamar(perfil, 'PATCH', '/api/perfil', { conta: a, corpo });
    expect(r.status).toBe(400);
    expect(((await r.json()) as { detalhes: unknown[] }).detalhes).toContainEqual({ campo, problema });
  });

  it('sem sessão dá 401 e DELETE dá 405', async () => {
    expect((await chamar(perfil, 'GET', '/api/perfil')).status).toBe(401);
    expect((await chamar(perfil, 'PATCH', '/api/perfil', { corpo: { nome: 'Lari' } })).status).toBe(401);
    expect((await chamar(perfil, 'DELETE', '/api/perfil', { conta: a })).status).toBe(405);
  });
});
