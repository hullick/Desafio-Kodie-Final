import { randomUUID } from 'node:crypto';
import type { Config } from '@netlify/functions';
import type { PoolClient } from 'pg';
import { comUsuario } from '../lib/com-usuario.ts';
import { cifrar, decifrar } from '../lib/cripto.ts';
import { ErroHttp, casarRota, json, lerCorpo, metodoNaoPermitido, semConteudo, tratar } from '../lib/http.ts';
import { Validador, hojeSP, somarAnos } from '../lib/validacao.ts';

/**
 * /api/caixinhas (spec 04): metas da pessoa logada, com saldo calculado pelo banco
 * (view caixinhas_com_saldo) e movimentos de guardar e retirar.
 * O nome é cifrado antes de gravar (AAD caixinhas.nome:<id>).
 * Caixinha de outra pessoa responde 404, igual a um id que não existe.
 */

const ICONES = ['aparelho', 'viagem', 'reserva', 'estudos', 'casa', 'carro', 'presente', 'outro'] as const;

interface LinhaCaixinha {
  id: string;
  nome_cifrado: string;
  icone: string;
  meta_centavos: number;
  prazo: string;
  saldo_centavos: number;
  criado_em: Date;
}

interface LinhaMovimento {
  id: string;
  caixinha_id: string;
  tipo: 'guardar' | 'retirar';
  valor_centavos: number;
  data: string;
  criado_em: Date;
}

const COLUNAS = 'id, nome_cifrado, icone, meta_centavos, prazo, saldo_centavos, criado_em';
const COLUNAS_MOV = 'id, caixinha_id, tipo, valor_centavos, data, criado_em';

function caixinhaApi(c: LinhaCaixinha, usuarioId: string) {
  return {
    id: c.id,
    nome: decifrar(usuarioId, `caixinhas.nome:${c.id}`, c.nome_cifrado),
    icone: c.icone,
    metaCentavos: c.meta_centavos,
    prazo: c.prazo,
    saldoCentavos: c.saldo_centavos,
    criadoEm: c.criado_em.toISOString(),
  };
}

function movimentoApi(m: LinhaMovimento) {
  return {
    id: m.id,
    caixinhaId: m.caixinha_id,
    tipo: m.tipo,
    valorCentavos: m.valor_centavos,
    data: m.data,
    criadoEm: m.criado_em.toISOString(),
  };
}

/**
 * Valida o corpo de criar/editar. O prazo precisa estar entre hoje e +10 anos (R-04.3), exceto
 * na edição que mantém o prazo atual: renomear uma caixinha vencida continua permitido.
 */
async function validarCaixinha(req: Request, prazoAtual?: string) {
  const dados = await lerCorpo(req, ['nome', 'icone', 'metaCentavos', 'prazo']);
  const v = new Validador(dados);
  const nome = v.texto('nome', 1, 40);
  const icone = v.enumeracao('icone', ICONES);
  const metaCentavos = v.centavos('metaCentavos');
  const hoje = hojeSP();
  const mantem = prazoAtual !== undefined && dados['prazo'] === prazoAtual;
  const prazo = v.data('prazo', mantem ? {} : { min: hoje, max: somarAnos(hoje, 10) });
  v.conferir();
  return { nome: nome!, icone: icone!, metaCentavos: metaCentavos!, prazo: prazo! };
}

async function obter(db: PoolClient, id: string, usuarioId: string) {
  const r = await db.query<LinhaCaixinha>(
    `select ${COLUNAS} from public.caixinhas_com_saldo where id = $1 and user_id = $2`, [id, usuarioId]);
  if (!r.rows[0]) throw new ErroHttp(404, 'nao_encontrado');
  return caixinhaApi(r.rows[0], usuarioId);
}

async function movimentos(req: Request, id: string): Promise<Response> {
  if (req.method === 'GET') {
    return comUsuario(req, async (db, usuarioId) => {
      await obter(db, id, usuarioId);
      const r = await db.query<LinhaMovimento>(
        `select ${COLUNAS_MOV} from public.movimentos_caixinha
          where caixinha_id = $1 and user_id = $2
          order by data desc, criado_em desc`,
        [id, usuarioId],
      );
      return json(r.rows.map(movimentoApi));
    });
  }
  if (req.method === 'POST') {
    const v = new Validador(await lerCorpo(req, ['tipo', 'valorCentavos', 'data']));
    const tipo = v.enumeracao('tipo', ['guardar', 'retirar'] as const);
    const valorCentavos = v.centavos('valorCentavos');
    const data = v.data('data', { max: hojeSP() });
    v.conferir();
    return comUsuario(req, async (db) => {
      // A trigger validar_movimento confere o dono, a data e o saldo (com lock da caixinha).
      const r = await db.query<LinhaMovimento>(
        `insert into public.movimentos_caixinha (id, caixinha_id, tipo, valor_centavos, data)
         values ($1, $2, $3, $4, $5) returning ${COLUNAS_MOV}`,
        [randomUUID(), id, tipo, valorCentavos, data],
      );
      return json(movimentoApi(r.rows[0]), 201);
    });
  }
  return metodoNaoPermitido(['GET', 'POST']);
}

export default tratar(async (req: Request) => {
  const rota = casarRota(req, 'caixinhas', ['movimentos']);
  if (!rota.id) {
    if (req.method === 'GET') {
      return comUsuario(req, async (db, usuarioId) => {
        const r = await db.query<LinhaCaixinha>(
          `select ${COLUNAS} from public.caixinhas_com_saldo where user_id = $1 order by prazo, criado_em`, [usuarioId]);
        return json(r.rows.map((c) => caixinhaApi(c, usuarioId)));
      });
    }
    if (req.method === 'POST') {
      const d = await validarCaixinha(req);
      return comUsuario(req, async (db, usuarioId) => {
        const id = randomUUID();
        await db.query(
          `insert into public.caixinhas (id, nome_cifrado, icone, meta_centavos, prazo) values ($1, $2, $3, $4, $5)`,
          [id, cifrar(usuarioId, `caixinhas.nome:${id}`, d.nome), d.icone, d.metaCentavos, d.prazo],
        );
        return json(await obter(db, id, usuarioId), 201, { location: `/api/caixinhas/${id}` });
      });
    }
    return metodoNaoPermitido(['GET', 'POST']);
  }

  const id = rota.id;
  if (rota.sub === 'movimentos') return movimentos(req, id);

  if (req.method === 'GET') {
    return comUsuario(req, async (db, usuarioId) => json(await obter(db, id, usuarioId)));
  }
  if (req.method === 'PUT') {
    return comUsuario(req, async (db, usuarioId) => {
      const atual = await obter(db, id, usuarioId);
      const d = await validarCaixinha(req, atual.prazo);
      await db.query(
        `update public.caixinhas set nome_cifrado = $3, icone = $4, meta_centavos = $5, prazo = $6
          where id = $1 and user_id = $2`,
        [id, usuarioId, cifrar(usuarioId, `caixinhas.nome:${id}`, d.nome), d.icone, d.metaCentavos, d.prazo],
      );
      return json(await obter(db, id, usuarioId));
    });
  }
  if (req.method === 'DELETE') {
    return comUsuario(req, async (db, usuarioId) => {
      const r = await db.query('delete from public.caixinhas where id = $1 and user_id = $2', [id, usuarioId]);
      if (!r.rowCount) throw new ErroHttp(404, 'nao_encontrado');
      return semConteudo();
    });
  }
  return metodoNaoPermitido(['GET', 'PUT', 'DELETE']);
});

export const config: Config = {
  path: ['/api/caixinhas', '/api/caixinhas/:id', '/api/caixinhas/:id/movimentos'],
};
