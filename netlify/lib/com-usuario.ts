import type { PoolClient } from 'pg';
import { pool } from './db.ts';
import { ErroHttp } from './http.ts';
import { obterSessao as sessaoPadrao, type ObterSessao } from './sessao.ts';

/**
 * R-00.1, primeira camada: toda function de domínio acessa o banco só por aqui.
 * 1. Sem sessão válida: 401 nao_autenticado, sem abrir transação.
 * 2. Com sessão: begin, set_config('app.user_id', <id>, true) e só então `fn`.
 *    O `true` deixa o valor local à transação: a conexão volta ao pool sem usuário,
 *    então nada vaza para a próxima requisição que a reaproveitar.
 * 3. commit, ou rollback e relança. A conexão sempre volta ao pool.
 * A segunda camada é o RLS: mesmo que `fn` esqueça o filtro, o banco só mostra as linhas do id.
 */
export async function comUsuario<T>(
  req: Request,
  fn: (db: PoolClient, usuarioId: string) => Promise<T>,
  obterSessao: ObterSessao = sessaoPadrao,
): Promise<T> {
  const sessao = await obterSessao(req);
  if (!sessao) throw new ErroHttp(401, 'nao_autenticado');
  const cliente = await pool.connect();
  try {
    await cliente.query('begin');
    await cliente.query("select set_config('app.user_id', $1, true)", [sessao.usuarioId]);
    const resultado = await fn(cliente, sessao.usuarioId);
    await cliente.query('commit');
    return resultado;
  } catch (e) {
    await cliente.query('rollback').catch(() => undefined);
    throw e;
  } finally {
    cliente.release();
  }
}
