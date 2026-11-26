/** Resposta JSON com o status dado. */
export function json(dados: unknown, status = 200): Response {
  return Response.json(dados, {
    status,
    headers: { 'cache-control': 'no-store' },
  });
}
