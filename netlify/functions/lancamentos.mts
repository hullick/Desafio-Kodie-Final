import { randomUUID } from 'node:crypto';
import type { Config } from '@netlify/functions';
import type { PoolClient } from 'pg';
import { comUsuario } from '../lib/com-usuario.ts';
import { cifrar, decifrar } from '../lib/cripto.ts';
import { ErroHttp, casarRota, json, lerCorpo, metodoNaoPermitido, semConteudo, tratar } from '../lib/http.ts';
import { Validador, hojeSP, lerMes } from '../lib/validacao.ts';

/**
 * /api/lancamentos (spec 02): CRUD de gastos e entradas de quem está logado.
 * A descrição é cifrada antes de gravar e decifrada ao ler (AAD lancamentos.descricao:<id>).
 * Lançamento de outra pessoa responde 404, igual a um id que não existe.
 */

const CATEGORIAS = {
  gasto: ['alimentacao', 'transporte', 'lazer', 'compras', 'contas', 'saude', 'educacao', 'outros_gasto'],
  entrada: ['salario', 'extra', 'presente', 'outros_entrada'],
} as const;
type Tipo = keyof typeof CATEGORIAS;
const CAMPOS = ['tipo', 'valorCentavos', 'categoria', 'descricao', 'data'] as const;

interface Linha {
  id: string;
  tipo: Tipo;
  valor_centavos: number;
  categoria: string;
  descricao_cifrada: string | null;
  data: string;
  criado_em: Date;
}

const COLUNAS = 'id, tipo, valor_centavos, categoria, descricao_cifrada, data, criado_em';

function paraApi(l: Linha, usuarioId: string) {
  return {
    id: l.id,
    tipo: l.tipo,
    valorCentavos: l.valor_centavos,
    categoria: l.categoria,
    descricao: l.descricao_cifrada ? decifrar(usuarioId, `lancamentos.descricao:${l.id}`, l.descricao_cifrada) : null,
    data: l.data,
    criadoEm: l.criado_em.toISOString(),
  };
}

async function validar(req: Request) {
  const v = new Validador(await lerCorpo(req, CAMPOS));
  const tipo = v.enumeracao('tipo', ['gasto', 'entrada'] as const);
  const valorCentavos = v.centavos('valorCentavos');
  const categoria = tipo ? v.enumeracao('categoria', CATEGORIAS[tipo]) : undefined;
  const descricao = v.textoOpcional('descricao', 60);
  const data = v.data('data', { max: hojeSP() });
  v.conferir();
  return { tipo: tipo!, valorCentavos: valorCentavos!, categoria: categoria!, descricao: descricao ?? null, data: data! };
}

async function obter(db: PoolClient, id: string, usuarioId: string) {
  const r = await db.query<Linha>(`select ${COLUNAS} from public.lancamentos where id = $1 and user_id = $2`, [id, usuarioId]);
  if (!r.rows[0]) throw new ErroHttp(404, 'nao_encontrado');
  return paraApi(r.rows[0], usuarioId);
}

export default tratar(async (req: Request) => {
  const rota = casarRota(req, 'lancamentos');

  if (!rota.id) {
    if (req.method === 'GET') {
      const { ano, mes, limite } = lerMes(new URL(req.url), true);
      return comUsuario(req, async (db, usuarioId) => {
        const inicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
        const r = await db.query<Linha>(
          `select ${COLUNAS} from public.lancamentos
            where user_id = $1 and data >= $2::date and data < ($2::date + interval '1 month')
            order by data desc, criado_em desc
            limit $3`,
          [usuarioId, inicio, limite],
        );
        return json(r.rows.map((l) => paraApi(l, usuarioId)));
      });
    }
    if (req.method === 'POST') {
      const d = await validar(req);
      return comUsuario(req, async (db, usuarioId) => {
        const id = randomUUID();
        const descricao = d.descricao ? cifrar(usuarioId, `lancamentos.descricao:${id}`, d.descricao) : null;
        const r = await db.query<Linha>(
          `insert into public.lancamentos (id, tipo, valor_centavos, categoria, descricao_cifrada, data)
           values ($1, $2, $3, $4, $5, $6) returning ${COLUNAS}`,
          [id, d.tipo, d.valorCentavos, d.categoria, descricao, d.data],
        );
        return json(paraApi(r.rows[0], usuarioId), 201, { location: `/api/lancamentos/${id}` });
      });
    }
    return metodoNaoPermitido(['GET', 'POST']);
  }

  const id = rota.id;
  if (req.method === 'GET') {
    return comUsuario(req, async (db, usuarioId) => json(await obter(db, id, usuarioId)));
  }
  if (req.method === 'PUT') {
    const d = await validar(req);
    return comUsuario(req, async (db, usuarioId) => {
      const descricao = d.descricao ? cifrar(usuarioId, `lancamentos.descricao:${id}`, d.descricao) : null;
      const r = await db.query<Linha>(
        `update public.lancamentos
            set tipo = $3, valor_centavos = $4, categoria = $5, descricao_cifrada = $6, data = $7
          where id = $1 and user_id = $2
          returning ${COLUNAS}`,
        [id, usuarioId, d.tipo, d.valorCentavos, d.categoria, descricao, d.data],
      );
      if (!r.rows[0]) throw new ErroHttp(404, 'nao_encontrado');
      return json(paraApi(r.rows[0], usuarioId));
    });
  }
  if (req.method === 'DELETE') {
    return comUsuario(req, async (db, usuarioId) => {
      const r = await db.query('delete from public.lancamentos where id = $1 and user_id = $2', [id, usuarioId]);
      if (!r.rowCount) throw new ErroHttp(404, 'nao_encontrado');
      return semConteudo();
    });
  }
  return metodoNaoPermitido(['GET', 'PUT', 'DELETE']);
});

export const config: Config = { path: ['/api/lancamentos', '/api/lancamentos/:id'] };
