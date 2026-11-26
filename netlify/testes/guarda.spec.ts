import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * R-00.1: toda function de domínio passa por comUsuario (sessão + app.user_id + RLS).
 * Só auth (cria a sessão), saude e nao-encontrado (não tocam dados) ficam de fora.
 */
const PASTA = new URL('../functions/', import.meta.url).pathname;
const EXCECOES = new Set(['auth.mts', 'saude.mts', 'nao-encontrado.mts']);

export function semComUsuario(arquivos: Record<string, string>): string[] {
  return Object.entries(arquivos)
    .filter(([nome]) => !EXCECOES.has(nome))
    .filter(([, codigo]) => !/import\s*{[^}]*\bcomUsuario\b[^}]*}\s*from\s*'\.\.\/lib\/com-usuario\.ts'/.test(codigo)
      || !/\bcomUsuario\s*\(/.test(codigo))
    .map(([nome]) => nome);
}

describe('guarda das functions', () => {
  it('toda function de domínio usa comUsuario', () => {
    const arquivos = Object.fromEntries(
      readdirSync(PASTA).filter((f) => f.endsWith('.mts')).map((f) => [f, readFileSync(join(PASTA, f), 'utf8')]),
    );
    expect(Object.keys(arquivos).length).toBeGreaterThan(3);
    expect(semComUsuario(arquivos)).toEqual([]);
  });

  it('aponta uma function nova sem comUsuario', () => {
    expect(semComUsuario({
      'nova.mts': "import { pool } from '../lib/db.ts';\nexport default () => pool.query('select * from public.lancamentos');",
    })).toEqual(['nova.mts']);
  });
});
