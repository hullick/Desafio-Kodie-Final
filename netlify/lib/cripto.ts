import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from 'node:crypto';

/**
 * Cifra os textos que as pessoas escrevem (nome do perfil, nome da caixinha, descrição do
 * lançamento) antes de irem para o banco. O banco só aceita esses campos no formato cifrado
 * (check app.eh_cifrado), então esquecer de cifrar quebra o insert em vez de vazar.
 *
 * - Algoritmo: AES-256-GCM (confidencialidade + integridade), IV aleatório de 12 bytes por valor.
 * - Chave por usuário: HKDF-SHA256(NUBANKO_CHAVE_DADOS, sal "nubanko", info "dados:v1:<usuarioId>").
 *   Um texto copiado para a linha de outra pessoa não decifra com a chave dela.
 * - AAD (dado associado) = "<tabela>.<coluna>:<id da linha>". Um texto movido para outra linha
 *   ou outra coluna, mesmo da mesma pessoa, também não decifra.
 * - Formato: "v1.<iv base64url>.<cifra || tag base64url>". O "v1" permite trocar a chave ou o
 *   algoritmo no futuro recifrando aos poucos (ver DESENVOLVIMENTO.md, 13.8).
 *
 * A chave mestra existe só nas variáveis de ambiente das functions (R-00.6).
 */

const VERSAO = 'v1';
const SAL = Buffer.from('nubanko');

let chaveMestra: Buffer | null = null;

function mestra(): Buffer {
  if (!chaveMestra) {
    const b64 = process.env['NUBANKO_CHAVE_DADOS'];
    const chave = b64 ? Buffer.from(b64, 'base64') : Buffer.alloc(0);
    if (chave.length !== 32) {
      throw new Error('NUBANKO_CHAVE_DADOS deve ter 32 bytes em base64 (openssl rand -base64 32)');
    }
    chaveMestra = chave;
  }
  return chaveMestra;
}

function chaveDoUsuario(usuarioId: string): Buffer {
  return Buffer.from(hkdfSync('sha256', mestra(), SAL, `dados:${VERSAO}:${usuarioId}`, 32));
}

/** Contexto que amarra o texto cifrado a uma coluna de uma linha. */
export type Contexto =
  | `perfis.nome:${string}`
  | `caixinhas.nome:${string}`
  | `lancamentos.descricao:${string}`;

export function cifrar(usuarioId: string, contexto: Contexto, texto: string): string {
  const iv = randomBytes(12);
  const cifra = createCipheriv('aes-256-gcm', chaveDoUsuario(usuarioId), iv);
  cifra.setAAD(Buffer.from(contexto, 'utf8'));
  const corpo = Buffer.concat([cifra.update(texto, 'utf8'), cifra.final(), cifra.getAuthTag()]);
  return `${VERSAO}.${iv.toString('base64url')}.${corpo.toString('base64url')}`;
}

export class ErroCripto extends Error {
  constructor() {
    super('texto cifrado inválido ou de outro dono');
  }
}

export function decifrar(usuarioId: string, contexto: Contexto, cifrado: string): string {
  const [versao, ivB64, corpoB64] = cifrado.split('.');
  if (versao !== VERSAO || !ivB64 || !corpoB64) throw new ErroCripto();
  const corpo = Buffer.from(corpoB64, 'base64url');
  if (corpo.length < 16) throw new ErroCripto();
  try {
    const decifra = createDecipheriv('aes-256-gcm', chaveDoUsuario(usuarioId), Buffer.from(ivB64, 'base64url'));
    decifra.setAAD(Buffer.from(contexto, 'utf8'));
    decifra.setAuthTag(corpo.subarray(corpo.length - 16));
    return Buffer.concat([decifra.update(corpo.subarray(0, corpo.length - 16)), decifra.final()]).toString('utf8');
  } catch {
    throw new ErroCripto();
  }
}

/** Só para testes: força reler a chave do ambiente. */
export function _esquecerChave(): void {
  chaveMestra = null;
}
