import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import YAML from 'yaml';

/** docs/api/openapi.yaml acompanha as functions: toda rota de function precisa estar documentada. */
const raiz = new URL('../../', import.meta.url);
const doc = YAML.parse(readFileSync(new URL('docs/api/openapi.yaml', raiz), 'utf8'));
const pasta = new URL('netlify/functions/', raiz);

function rotasDasFunctions(): string[] {
  return readdirSync(pasta)
    .filter((f) => f.endsWith('.mts') && f !== 'auth.mts' && f !== 'nao-encontrado.mts')
    .flatMap((f) => {
      const codigo = readFileSync(new URL(f, pasta), 'utf8');
      const config = codigo.match(/export const config[^=]*=\s*({[\s\S]*?});/)?.[1] ?? '';
      return [...config.matchAll(/'(\/api\/[^']+)'/g)].map((m) => m[1].replace(/:(\w+)/g, '{$1}'));
    });
}

describe('openapi', () => {
  it('documenta toda rota das functions de domínio', () => {
    const rotas = rotasDasFunctions();
    expect(rotas.length).toBeGreaterThanOrEqual(8);
    expect(rotas.filter((r) => !doc.paths[r])).toEqual([]);
  });

  it('toda $ref aponta para algo que existe', () => {
    const refs: string[] = [];
    (function andar(n: unknown) {
      if (n && typeof n === 'object') {
        for (const [k, v] of Object.entries(n)) k === '$ref' ? refs.push(v as string) : andar(v);
      }
    })(doc);
    const quebradas = refs.filter((r) => r.slice(2).split('/').reduce<any>((n, p) => n?.[p], doc) === undefined);
    expect(quebradas).toEqual([]);
  });

  it('o catálogo de erros do schema Erro cobre os códigos usados no código', () => {
    const codigo = ['netlify/lib/http.ts', 'netlify/lib/validacao.ts', ...readdirSync(pasta).map((f) => `netlify/functions/${f}`)]
      .map((f) => readFileSync(new URL(f, raiz), 'utf8')).join('\n');
    const usados = new Set([...codigo.matchAll(/ErroHttp\(\d{3}, '([a-z_]+)'/g)].map((m) => m[1]));
    usados.add('nao_encontrado');
    const documentados: string[] = doc.components.schemas.Erro.properties.erro.enum;
    expect([...usados].filter((c) => !documentados.includes(c))).toEqual([]);
  });
});
