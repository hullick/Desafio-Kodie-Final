-- Spec 03: resumo_mes soma só o mês e só as linhas de quem está na transação.
begin;
select plan(6);

select tests.criar_usuario('a@teste.com') as a \gset
select tests.criar_usuario('b@teste.com') as b \gset

-- Seed de novembro/2026 (as triggers de data são desligadas para usar datas fixas).
alter table public.lancamentos disable trigger validar_data;
alter table public.movimentos_caixinha disable trigger validar_movimento;
alter table public.caixinhas disable trigger validar_prazo;
insert into public.lancamentos (user_id, tipo, valor_centavos, categoria, data) values
  (:'a', 'entrada', 141200, 'salario', '2026-11-05'),
  (:'a', 'gasto', 32000, 'alimentacao', '2026-11-10'),
  (:'a', 'gasto', 18000, 'transporte', '2026-11-11'),
  (:'a', 'gasto', 9999, 'lazer', '2026-12-01'),
  (:'b', 'gasto', 77700, 'alimentacao', '2026-11-10');
insert into public.caixinhas (id, user_id, nome_cifrado, icone, meta_centavos, prazo)
values ('00000000-0000-0000-0000-0000000000c1', :'a', tests.cifrado(), 'reserva', 100000, '2027-01-01');
insert into public.movimentos_caixinha (user_id, caixinha_id, tipo, valor_centavos, data) values
  (:'a', '00000000-0000-0000-0000-0000000000c1', 'guardar', 30000, '2026-11-12'),
  (:'a', '00000000-0000-0000-0000-0000000000c1', 'retirar', 5000, '2026-11-20');
alter table public.lancamentos enable trigger validar_data;
alter table public.movimentos_caixinha enable trigger validar_movimento;
alter table public.caixinhas enable trigger validar_prazo;

select tests.autenticar_como(:'a');
select is(public.resumo_mes(2026, 11) - 'por_categoria',
  '{"entradas":141200,"gastos":50000,"guardado_liquido":25000,"saldo":66200}'::jsonb,
  'totais de novembro de A (o lançamento de 01/12 e os de B não entram)');
select is(public.resumo_mes(2026, 11) -> 'por_categoria',
  '[{"categoria":"alimentacao","total":32000},{"categoria":"transporte","total":18000}]'::jsonb,
  'por categoria, só gastos, do maior para o menor');
select is(public.resumo_mes(2026, 10),
  '{"entradas":0,"gastos":0,"guardado_liquido":0,"saldo":0,"por_categoria":[]}'::jsonb, 'mês vazio dá zero');

select tests.autenticar_como(:'b');
select is((public.resumo_mes(2026, 11) ->> 'gastos')::int, 77700, 'B só soma os próprios gastos');

select tests.anonimo();
select is((public.resumo_mes(2026, 11) ->> 'saldo')::int, 0, 'sem sessão, tudo dá zero');

select tests.resetar();
select ok(not has_function_privilege('public', 'public.resumo_mes(int,int)', 'execute'),
  'resumo_mes não é executável por public');
select * from finish();
rollback;
