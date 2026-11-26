import type { Context } from '@netlify/functions';

/**
 * Respostas e erros HTTP das functions de domínio. Todo erro sai como JSON
 * `{ "erro": "<codigo>", "detalhes"?: [{ "campo", "problema" }] }`, nunca a mensagem crua do
 * Postgres. O catálogo completo de códigos está em docs/api/openapi.yaml.
 */

export interface Detalhe {
  readonly campo: string;
  readonly problema: string;
}

export class ErroHttp extends Error {
  constructor(
    readonly status: number,
    readonly codigo: string,
    readonly detalhes?: readonly Detalhe[],
    readonly cabecalhos?: Record<string, string>,
  ) {
    super(codigo);
  }
}

const SEM_CACHE = { 'cache-control': 'no-store' };

/** Resposta JSON com o status dado. Nunca em cache: são dados pessoais. */
export function json(dados: unknown, status = 200, cabecalhos: Record<string, string> = {}): Response {
  return Response.json(dados, { status, headers: { ...SEM_CACHE, ...cabecalhos } });
}

export function semConteudo(): Response {
  return new Response(null, { status: 204, headers: SEM_CACHE });
}

/** Erros levantados pelas triggers (raise exception '<codigo>') e o que viram na API. */
const ERROS_DO_BANCO: Record<string, () => ErroHttp> = {
  saldo_insuficiente: () => new ErroHttp(409, 'saldo_insuficiente'),
  caixinha_com_saldo: () => new ErroHttp(409, 'caixinha_com_saldo'),
  caixinha_inexistente: () => new ErroHttp(404, 'nao_encontrado'),
  data_futura: () => new ErroHttp(400, 'dados_invalidos', [{ campo: 'data', problema: 'futura' }]),
  prazo_invalido: () => new ErroHttp(400, 'dados_invalidos', [{ campo: 'prazo', problema: 'fora_do_intervalo' }]),
};

interface ErroPg {
  code?: string;
  message?: string;
}

function paraErroHttp(e: unknown): ErroHttp {
  if (e instanceof ErroHttp) return e;
  const pg = e as ErroPg;
  if (pg?.code === 'P0001' && pg.message && ERROS_DO_BANCO[pg.message]) return ERROS_DO_BANCO[pg.message]();
  // check_violation, not_null, formato inválido: a validação da function deveria ter pego antes.
  if (pg?.code === '23514' || pg?.code === '23502' || pg?.code === '22P02' || pg?.code === '22007') {
    return new ErroHttp(400, 'dados_invalidos');
  }
  // RLS recusou ou FK de dono falhou: para quem chama, é algo que não existe.
  if (pg?.code === '42501' || pg?.code === '23503') return new ErroHttp(404, 'nao_encontrado');
  console.error('erro não tratado na function', e);
  return new ErroHttp(500, 'interno');
}

export function respostaDeErro(e: unknown): Response {
  const erro = paraErroHttp(e);
  const corpo = erro.detalhes?.length ? { erro: erro.codigo, detalhes: erro.detalhes } : { erro: erro.codigo };
  return json(corpo, erro.status, erro.cabecalhos);
}

const METODOS_SEGUROS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * R-00.7: escrita vinda de outro site é recusada. O cookie de sessão já é SameSite=Lax; isto
 * fecha o resto (ex.: subdomínio ou navegador antigo). Sem Origin (curl, testes), passa.
 */
export function exigirMesmaOrigem(req: Request): void {
  if (METODOS_SEGUROS.has(req.method)) return;
  const origem = req.headers.get('origin');
  if (!origem) return;
  const permitida = new URL(process.env['BETTER_AUTH_URL'] ?? req.url).origin;
  if (origem !== permitida) throw new ErroHttp(403, 'origem_invalida');
}

export type Handler = (req: Request, ctx: Context) => Promise<Response>;

/** Envolve o handler: confere a origem e converte qualquer erro na resposta JSON certa. */
export function tratar(handler: Handler): Handler {
  return async (req, ctx) => {
    try {
      exigirMesmaOrigem(req);
      return await handler(req, ctx);
    } catch (e) {
      return respostaDeErro(e);
    }
  };
}

export function metodoNaoPermitido(permitidos: string[]): never {
  throw new ErroHttp(405, 'metodo_nao_permitido', undefined, { allow: permitidos.join(', ') });
}

const LIMITE_CORPO = 16 * 1024;

/**
 * Lê o corpo JSON aceitando só os campos listados. Campo desconhecido (inclusive `user_id`)
 * é recusado: a API nunca deixa o cliente escolher o dono do dado.
 */
export async function lerCorpo(req: Request, campos: readonly string[]): Promise<Record<string, unknown>> {
  const tipo = req.headers.get('content-type') ?? '';
  if (!tipo.toLowerCase().startsWith('application/json')) {
    throw new ErroHttp(415, 'tipo_de_conteudo_invalido');
  }
  const texto = await req.text();
  if (texto.length > LIMITE_CORPO) throw new ErroHttp(413, 'corpo_grande_demais');
  let corpo: unknown;
  try {
    corpo = JSON.parse(texto);
  } catch {
    throw new ErroHttp(400, 'json_invalido');
  }
  if (typeof corpo !== 'object' || corpo === null || Array.isArray(corpo)) {
    throw new ErroHttp(400, 'json_invalido');
  }
  const extras = Object.keys(corpo).filter((c) => !campos.includes(c));
  if (extras.length) {
    throw new ErroHttp(400, 'dados_invalidos', extras.map((campo) => ({ campo, problema: 'nao_permitido' })));
  }
  return corpo as Record<string, unknown>;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Id de recurso da rota. Formato inválido responde como inexistente (404), sem dar pistas. */
export function idDaRota(ctx: Context): string {
  const id = ctx.params?.['id'];
  if (!id || !UUID.test(id)) throw new ErroHttp(404, 'nao_encontrado');
  return id.toLowerCase();
}
