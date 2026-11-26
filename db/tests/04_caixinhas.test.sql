-- Spec 04 e R-00.1: caixinhas, movimentos, saldo e isolamento entre A e B.
begin;
select plan(17);

select tests.criar_usuario('a@teste.com') as a \gset
select tests.criar_usuario('b@teste.com') as b \gset

select tests.autenticar_como(:'a');
insert into public.caixinhas (id, nome_cifrado, icone, meta_centavos, prazo)
values ('00000000-0000-0000-0000-0000000000c1', tests.cifrado('cel'), 'aparelho', 200000, app.hoje() + 90);

select throws_ok($$ insert into public.caixinhas (nome_cifrado, icone, meta_centavos, prazo)
  values ('Celular novo', 'aparelho', 1000, app.hoje() + 30) $$, '23514', null, 'nome em claro é recusado');
select throws_ok($$ insert into public.caixinhas (nome_cifrado, icone, meta_centavos, prazo)
  values (tests.cifrado(), 'aparelho', 1000, app.hoje() - 1) $$, 'P0001', 'prazo_invalido', 'prazo de ontem é recusado');
select throws_ok($$ insert into public.caixinhas (nome_cifrado, icone, meta_centavos, prazo)
  values (tests.cifrado(), 'aparelho', 1000, (app.hoje() + interval '10 years 1 day')::date) $$,
  'P0001', 'prazo_invalido', 'prazo depois de 10 anos é recusado');
select throws_ok($$ insert into public.caixinhas (nome_cifrado, icone, meta_centavos, prazo)
  values (tests.cifrado(), 'foguete', 1000, app.hoje()) $$, '23514', null, 'ícone fora da lista é recusado');

insert into public.movimentos_caixinha (caixinha_id, tipo, valor_centavos, data)
values ('00000000-0000-0000-0000-0000000000c1', 'guardar', 1000, app.hoje());
select throws_ok($$ insert into public.movimentos_caixinha (caixinha_id, tipo, valor_centavos, data)
  values ('00000000-0000-0000-0000-0000000000c1', 'retirar', 1001, app.hoje()) $$,
  'P0001', 'saldo_insuficiente', 'retirar acima do saldo é recusado');
select throws_ok($$ insert into public.movimentos_caixinha (caixinha_id, tipo, valor_centavos, data)
  values ('00000000-0000-0000-0000-0000000000c1', 'guardar', 10, app.hoje() + 1) $$,
  'P0001', 'data_futura', 'movimento com data futura é recusado');
select throws_ok($$ delete from public.caixinhas $$, 'P0001', 'caixinha_com_saldo', 'excluir com saldo é recusado');
select throws_ok($$ update public.movimentos_caixinha set valor_centavos = 1 $$, '42501', null,
  'movimentos não podem ser editados');

select tests.autenticar_como(:'b');
select is_empty('select * from public.caixinhas_com_saldo', 'B não vê a caixinha de A');
select is_empty('select * from public.movimentos_caixinha', 'B não vê os movimentos de A');
select throws_ok($$ insert into public.movimentos_caixinha (caixinha_id, tipo, valor_centavos, data)
  values ('00000000-0000-0000-0000-0000000000c1', 'guardar', 10, app.hoje()) $$,
  'P0001', 'caixinha_inexistente', 'B não movimenta a caixinha de A');
select is_empty($$ delete from public.caixinhas returning id $$, 'B não apaga a caixinha de A');

select tests.autenticar_como(:'a');
select is((select saldo_centavos from public.caixinhas_com_saldo)::int, 1000, 'a view soma o saldo de A');
select lives_ok($$ insert into public.movimentos_caixinha (caixinha_id, tipo, valor_centavos, data)
  values ('00000000-0000-0000-0000-0000000000c1', 'retirar', 1000, app.hoje()) $$, 'retirar o saldo exato passa');
select lives_ok($$ delete from public.caixinhas $$, 'com saldo zero, excluir passa');
select is_empty('select * from public.movimentos_caixinha', 'os movimentos vão junto');

-- Editar o nome de uma caixinha vencida continua permitido (o prazo não muda).
select tests.resetar();
insert into public.caixinhas (id, user_id, nome_cifrado, icone, meta_centavos, prazo)
values ('00000000-0000-0000-0000-0000000000c2', :'a', tests.cifrado(), 'casa', 100, app.hoje());
alter table public.caixinhas disable trigger validar_prazo;
update public.caixinhas set prazo = app.hoje() - 10 where id = '00000000-0000-0000-0000-0000000000c2';
alter table public.caixinhas enable trigger validar_prazo;
select tests.autenticar_como(:'a');
select lives_ok($$ update public.caixinhas set nome_cifrado = tests.cifrado('novo') $$,
  'renomear caixinha com prazo vencido passa');

select tests.resetar();
select * from finish();
rollback;
