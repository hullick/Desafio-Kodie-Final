import type { Config } from '@netlify/functions';
import { comUsuario } from '../lib/com-usuario.ts';
import { casarRota, ErroHttp, json, metodoNaoPermitido, tratar } from '../lib/http.ts';
import { lerMes } from '../lib/validacao.ts';

/**
 * GET /api/resumo?ano=&mes= (spec 03): saldo, entradas, gastos, guardado líquido e gasto por
 * categoria do mês, calculados por public.resumo_mes (security invoker: só as linhas da pessoa).
 */

interface ResumoBanco {
  entradas: number;
  gastos: number;
  guardado_liquido: number;
  saldo: number;
  por_categoria: { categoria: string; total: number }[];
}

export default tratar(async (req: Request) => {
  if (casarRota(req, 'resumo').id) throw new ErroHttp(404, 'nao_encontrado');
  if (req.method !== 'GET') return metodoNaoPermitido(['GET']);
  const { ano, mes } = lerMes(new URL(req.url));
  return comUsuario(req, async (db) => {
    const r = await db.query<{ resumo: ResumoBanco }>('select public.resumo_mes($1, $2) as resumo', [ano, mes]);
    const s = r.rows[0].resumo;
    return json({
      entradas: s.entradas,
      gastos: s.gastos,
      guardadoLiquido: s.guardado_liquido,
      saldo: s.saldo,
      porCategoria: s.por_categoria,
    });
  });
});

export const config: Config = { path: '/api/resumo' };
