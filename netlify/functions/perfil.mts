import type { Config } from '@netlify/functions';
import { comUsuario } from '../lib/com-usuario.ts';
import { cifrar, decifrar } from '../lib/cripto.ts';
import { json, lerCorpo, metodoNaoPermitido, tratar } from '../lib/http.ts';
import { Validador } from '../lib/validacao.ts';

/**
 * /api/perfil (spec 05): nome (cifrado em perfis.nome_cifrado), e-mail e data do cadastro
 * (lidos de auth.user pela função meu_email_e_cadastro, que só devolve a própria linha) e
 * versão e data do aceite da política. Só o nome é editável.
 */

interface Linha {
  nome_cifrado: string;
  versao_politica: string;
  aceite_politica_em: Date;
  email: string;
  criado_em: Date;
}

export default tratar(async (req: Request) => {
  if (req.method !== 'GET' && req.method !== 'PATCH') return metodoNaoPermitido(['GET', 'PATCH']);

  let nome: string | undefined;
  if (req.method === 'PATCH') {
    const v = new Validador(await lerCorpo(req, ['nome']));
    nome = v.texto('nome', 2, 40);
    v.conferir();
  }

  return comUsuario(req, async (db, usuarioId) => {
    if (nome !== undefined) {
      await db.query('update public.perfis set nome_cifrado = $2 where id = $1', [
        usuarioId, cifrar(usuarioId, `perfis.nome:${usuarioId}`, nome),
      ]);
    }
    const r = await db.query<Linha>(
      `select p.nome_cifrado, p.versao_politica, p.aceite_politica_em, u.email, u.criado_em
         from public.perfis p, public.meu_email_e_cadastro() u
        where p.id = $1`,
      [usuarioId],
    );
    const p = r.rows[0];
    return json({
      nome: decifrar(usuarioId, `perfis.nome:${usuarioId}`, p.nome_cifrado),
      email: p.email,
      criadoEm: p.criado_em.toISOString(),
      versaoPolitica: p.versao_politica,
      aceitePoliticaEm: p.aceite_politica_em.toISOString(),
    });
  });
});

export const config: Config = { path: '/api/perfil' };
