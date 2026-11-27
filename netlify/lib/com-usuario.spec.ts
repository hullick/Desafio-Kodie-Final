import { describe, expect, it } from 'vitest';
import { comUsuario } from './com-usuario.ts';
import { pool } from './db.ts';
import { ErroHttp } from './http.ts';

const req = new Request('http://localhost/api/x');
const sessaoDe = (usuarioId: string) => async () => ({ usuarioId });

describe('comUsuario', () => {
  it('sem sessão, lança 401 sem abrir transação', async () => {
    let chamou = false;
    const p = comUsuario(req, async () => { chamou = true; }, async () => null);
    await expect(p).rejects.toMatchObject({ status: 401, codigo: 'nao_autenticado' });
    expect(chamou).toBe(false);
  });

  it('define app.user_id só dentro da transação', async () => {
    const dentro = await comUsuario(req, async (db) =>
      (await db.query<{ id: string }>('select app.usuario_id() as id')).rows[0].id, sessaoDe('usuario-x'));
    expect(dentro).toBe('usuario-x');
    // Todas as conexões do pool (max 3) voltam sem usuário.
    const depois = await Promise.all([1, 2, 3].map(() => pool.query<{ id: string | null }>('select app.usuario_id() as id')));
    expect(depois.map((r) => r.rows[0].id)).toEqual([null, null, null]);
  });

  it('erro dentro de fn faz rollback e devolve a conexão', async () => {
    const livresAntes = pool.totalCount - pool.idleCount;
    await expect(comUsuario(req, async (db) => {
      await db.query('select 1');
      throw new ErroHttp(409, 'qualquer');
    }, sessaoDe('usuario-x'))).rejects.toMatchObject({ codigo: 'qualquer' });
    expect(pool.totalCount - pool.idleCount).toBe(livresAntes);
  });
});
