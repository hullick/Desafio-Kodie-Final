-- Plan 03 (spec 03): resumo do mês agregado no banco. security invoker: respeita o RLS,
-- então só soma as linhas de quem está na transação (sem usuário, tudo dá 0).
-- Saldo = entradas − gastos − (guardar − retirar), tudo no mês.

create function public.resumo_mes(p_ano int, p_mes int) returns jsonb
  language sql stable security invoker set search_path = ''
  as $$
  with limites as (
    select make_date(p_ano, p_mes, 1) as inicio,
           (make_date(p_ano, p_mes, 1) + interval '1 month')::date as fim
  ),
  lanc as (
    select l.tipo, l.categoria, l.valor_centavos
      from public.lancamentos l, limites
     where l.data >= limites.inicio and l.data < limites.fim
  ),
  mov as (
    select coalesce(sum(case m.tipo when 'guardar' then m.valor_centavos else -m.valor_centavos end), 0) as liquido
      from public.movimentos_caixinha m, limites
     where m.data >= limites.inicio and m.data < limites.fim
  ),
  totais as (
    select coalesce(sum(valor_centavos) filter (where tipo = 'entrada'), 0) as entradas,
           coalesce(sum(valor_centavos) filter (where tipo = 'gasto'), 0) as gastos
      from lanc
  ),
  cats as (
    select categoria, sum(valor_centavos) as total
      from lanc where tipo = 'gasto'
     group by categoria
  )
  select jsonb_build_object(
    'entradas', t.entradas,
    'gastos', t.gastos,
    'guardado_liquido', m.liquido,
    'saldo', t.entradas - t.gastos - m.liquido,
    'por_categoria', coalesce(
      (select jsonb_agg(jsonb_build_object('categoria', categoria, 'total', total) order by total desc, categoria)
         from cats where total > 0),
      '[]'::jsonb)
  )
  from totais t, mov m
$$;

revoke execute on function public.resumo_mes(int, int) from public;
grant execute on function public.resumo_mes(int, int) to nubanko_app;
