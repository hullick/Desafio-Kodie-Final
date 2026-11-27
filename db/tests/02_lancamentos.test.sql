-- Spec 02 e R-00.1: regras de lançamentos e isolamento entre A e B.
begin;
select plan(14);

select tests.criar_usuario('a@teste.com') as a \gset
select tests.criar_usuario('b@teste.com') as b \gset

select tests.autenticar_como(:'a');
select lives_ok($$ insert into public.lancamentos (id, tipo, valor_centavos, categoria, descricao_cifrada, data)
  values ('00000000-0000-0000-0000-0000000000a1', 'gasto', 1250, 'alimentacao', tests.cifrado('d'), app.hoje()) $$,
  'A cria um gasto válido');
select throws_ok($$ insert into public.lancamentos (tipo, valor_centavos, categoria, data)
  values ('gasto', 0, 'alimentacao', app.hoje()) $$, '23514', null, 'valor 0 é recusado');
select throws_ok($$ insert into public.lancamentos (tipo, valor_centavos, categoria, data)
  values ('gasto', 100000000, 'alimentacao', app.hoje()) $$, '23514', null, 'valor acima do máximo é recusado');
select throws_ok($$ insert into public.lancamentos (tipo, valor_centavos, categoria, data)
  values ('gasto', 100, 'salario', app.hoje()) $$, '23514', null, 'categoria de entrada num gasto é recusada');
select throws_ok($$ insert into public.lancamentos (tipo, valor_centavos, categoria, descricao_cifrada, data)
  values ('gasto', 100, 'lazer', 'descricao em claro', app.hoje()) $$, '23514', null,
  'descrição em claro é recusada');
select throws_ok($$ insert into public.lancamentos (tipo, valor_centavos, categoria, data)
  values ('gasto', 100, 'lazer', app.hoje() + 1) $$, 'P0001', 'data_futura', 'data futura é recusada');
select throws_ok(format($$ insert into public.lancamentos (user_id, tipo, valor_centavos, categoria, data)
  values (%L, 'gasto', 100, 'lazer', app.hoje()) $$, :'b'), '42501', null,
  'A não cria lançamento em nome de B');
select throws_ok(format($$ update public.lancamentos set user_id = %L $$, :'b'), 'P0001', 'troca_de_dono',
  'A não passa o lançamento para B');

select tests.autenticar_como(:'b');
select is_empty('select * from public.lancamentos', 'B não vê o lançamento de A');
select is_empty($$ update public.lancamentos set valor_centavos = 1 returning id $$, 'B não altera o de A');
select is_empty($$ delete from public.lancamentos returning id $$, 'B não apaga o de A');

select tests.anonimo();
select is_empty('select * from public.lancamentos', 'sem sessão, nada aparece');

select tests.autenticar_como(:'a');
select is((select valor_centavos from public.lancamentos)::int, 1250, 'o de A continua intacto');
select lives_ok($$ update public.lancamentos set data = app.hoje() - 3 $$, 'A edita a data para o passado');

select tests.resetar();
select * from finish();
rollback;
