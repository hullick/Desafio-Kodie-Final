import { afterAll, describe, expect, it } from 'vitest';
import {
  cadastrar, chamar, chamarAuth, cookieDe, emailNovo, limparContas, linhasCruas, poolAuth, SENHA, ultimoEmail,
} from './apoio.ts';
import perfil from '../functions/perfil.mts';

afterAll(limparContas);

const novaConta = (extra: Record<string, unknown> = {}) =>
  ({ name: 'Lari', email: emailNovo(), password: SENHA, aceiteVersao: '2026-11', ...extra });

describe('/api/auth: cadastro (spec 01, sem confirmação de e-mail)', () => {
  it('cadastra, já entra na conta e cria o perfil com o nome cifrado', async () => {
    const res = await chamarAuth('/sign-up/email', novaConta({ name: '  Larissa  ' }));
    expect(res.status).toBe(200);
    const cookies = res.headers.getSetCookie().join('\n');
    expect(cookies).toMatch(/nubanko\.session_token=/);
    expect(cookies).toMatch(/HttpOnly/i);
    expect(cookies).toMatch(/SameSite=Lax/i);

    const corpo = (await res.json()) as { token?: string; user: { id: string; name: string } };
    const { user } = corpo;
    expect(user.name).toBe('');
    expect(corpo.token).toBeUndefined();
    const [u] = (await poolAuth.query('select name from "user" where id = $1', [user.id])).rows;
    expect(u.name).toBe('');
    const conta = { id: user.id, email: '', nome: '', cookie: cookieDe(res) };
    const [p] = await linhasCruas<{ nome_cifrado: string }>(conta, 'select nome_cifrado from public.perfis');
    expect(p.nome_cifrado).toMatch(/^v1\./);
    expect(p.nome_cifrado).not.toContain('Larissa');
    const r = await chamar(perfil, 'GET', '/api/perfil', { conta });
    expect(((await r.json()) as { nome: string }).nome).toBe('Larissa');
  });

  it('normaliza o e-mail (maiúsculas e espaços)', async () => {
    const email = emailNovo();
    await chamarAuth('/sign-up/email', novaConta({ email: `  ${email.toUpperCase()} ` }));
    const res = await chamarAuth('/sign-in/email', { email, password: SENHA });
    expect(res.status).toBe(200);
    expect(res.headers.getSetCookie().join()).toMatch(/nubanko\.session_token=/);
    expect(((await res.json()) as { token?: string }).token).toBeUndefined();
  });

  it.each([
    ['senha sem número', { password: 'abcdefgh!' }, 'SENHA_FRACA'],
    ['senha sem símbolo', { password: 'abcdefg1' }, 'SENHA_FRACA'],
    ['senha curta', { password: 'a1!' }, 'SENHA_FRACA'],
    ['sem aceite', { aceiteVersao: undefined }, 'ACEITE_OBRIGATORIO'],
    ['aceite de versão antiga', { aceiteVersao: '2020-01' }, 'ACEITE_OBRIGATORIO'],
    ['nome só com espaços', { name: '   ' }, 'NOME_INVALIDO'],
    ['nome com 41 caracteres', { name: 'x'.repeat(41) }, 'NOME_INVALIDO'],
  ])('recusa %s com 400 %s', async (_, extra, codigo) => {
    const res = await chamarAuth('/sign-up/email', novaConta(extra));
    expect(res.status).toBe(400);
    expect(((await res.json()) as { code: string }).code).toBe(codigo);
  });

  it('e-mail já cadastrado responde 422 e não cria nada', async () => {
    const corpo = novaConta();
    await chamarAuth('/sign-up/email', corpo);
    const res = await chamarAuth('/sign-up/email', { ...corpo, password: 'Outra123!' });
    expect(res.status).toBe(422);
    expect(((await res.json()) as { code: string }).code).toBe('USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL');
    expect(res.headers.getSetCookie()).toEqual([]);
  });

  it('escrita com Origin de outro site é recusada', async () => {
    const res = await chamarAuth('/sign-up/email', novaConta(), undefined, 'POST', 'https://evil.example');
    expect(res.status).toBe(403);
  });
});

describe('/api/auth: sessão', () => {
  it('login com senha errada e com e-mail inexistente dão a mesma resposta (R-01.7)', async () => {
    const c = await cadastrar();
    const errada = await chamarAuth('/sign-in/email', { email: c.email, password: 'Errada123!' });
    const inexistente = await chamarAuth('/sign-in/email', { email: emailNovo(), password: SENHA });
    expect(errada.status).toBe(401);
    expect(inexistente.status).toBe(401);
    expect(await errada.json()).toEqual(await inexistente.json());
  });

  it('get-session devolve a sessão e sign-out a encerra', async () => {
    const c = await cadastrar();
    const s = await chamarAuth('/get-session', undefined, c.cookie, 'GET');
    expect(((await s.json()) as { user: { id: string } }).user.id).toBe(c.id);
    const out = await chamarAuth('/sign-out', {}, c.cookie);
    expect(out.status).toBe(200);
    const depois = await chamarAuth('/get-session', undefined, c.cookie, 'GET');
    expect(await depois.json()).toBeNull();
  });

  it('rotas fora do escopo do app estão desligadas', async () => {
    const c = await cadastrar();
    const res = await chamarAuth('/update-user', { name: 'Em claro' }, c.cookie);
    expect(res.status).toBe(404);
  });
});

describe('/api/auth: senha', () => {
  it('troca de senha confere a atual e aplica a regra da nova', async () => {
    const c = await cadastrar();
    const errada = await chamarAuth('/change-password', { currentPassword: 'Errada123!', newPassword: 'Nova1234!' }, c.cookie);
    expect(errada.status).toBe(400);
    expect(((await errada.json()) as { code: string }).code).toBe('INVALID_PASSWORD');
    const fraca = await chamarAuth('/change-password', { currentPassword: SENHA, newPassword: 'fraca' }, c.cookie);
    expect(((await fraca.json()) as { code: string }).code).toBe('SENHA_FRACA');
    const ok = await chamarAuth('/change-password',
      { currentPassword: SENHA, newPassword: 'Nova1234!', revokeOtherSessions: true }, c.cookie);
    expect(ok.status).toBe(200);
    expect((await chamarAuth('/sign-in/email', { email: c.email, password: 'Nova1234!' })).status).toBe(200);
  });

  it('esqueci a senha: resposta neutra, e-mail com link e nova senha funcionando', async () => {
    const c = await cadastrar();
    const pedido = await chamarAuth('/request-password-reset', { email: c.email, redirectTo: '/nova-senha' });
    const inexistente = await chamarAuth('/request-password-reset', { email: emailNovo(), redirectTo: '/nova-senha' });
    expect(pedido.status).toBe(200);
    expect(await pedido.json()).toEqual(await inexistente.json());

    let email = null;
    for (let i = 0; i < 20 && !email; i++) {
      email = await ultimoEmail(c.email);
      if (!email) await new Promise((r) => setTimeout(r, 200));
    }
    const token = email!.texto.match(/reset-password\/([A-Za-z0-9_-]+)/)![1];
    const fraca = await chamarAuth('/reset-password', { newPassword: 'fraca', token });
    expect(fraca.status).toBe(400);
    const ok = await chamarAuth('/reset-password', { newPassword: 'Nova1234!', token });
    expect(ok.status).toBe(200);
    expect((await chamarAuth('/sign-in/email', { email: c.email, password: 'Nova1234!' })).status).toBe(200);
    // A sessão antiga cai (revokeSessionsOnPasswordReset).
    expect(await (await chamarAuth('/get-session', undefined, c.cookie, 'GET')).json()).toBeNull();
    const reuso = await chamarAuth('/reset-password', { newPassword: 'Outra123!', token });
    expect(reuso.status).toBe(400);
  });
});

describe('/api/auth: exclusão de conta (R-05.6)', () => {
  it('senha errada não apaga nada; a certa apaga tudo e derruba as sessões', async () => {
    const c = await cadastrar();
    const outroAparelho = cookieDe(await chamarAuth('/sign-in/email', { email: c.email, password: SENHA }));
    const errada = await chamarAuth('/delete-user', { password: 'Errada123!' }, c.cookie);
    expect(errada.status).toBe(400);
    expect((await poolAuth.query('select 1 from "user" where id = $1', [c.id])).rowCount).toBe(1);

    const ok = await chamarAuth('/delete-user', { password: SENHA }, c.cookie);
    expect(ok.status).toBe(200);
    expect((await poolAuth.query('select 1 from "user" where id = $1', [c.id])).rowCount).toBe(0);
    const r = await chamar(perfil, 'GET', '/api/perfil', { conta: { ...c, cookie: outroAparelho } });
    expect(r.status).toBe(401);
  });
});
