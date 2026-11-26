import { json } from '../lib/http.ts';

/** Destino do redirect de /api/* sem function: 404 em JSON (ver netlify.toml). */
export default async (): Promise<Response> => json({ erro: 'nao_encontrado' }, 404);
