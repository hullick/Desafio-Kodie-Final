-- R-05.6: apagar o usuário leva perfil, sessões, lançamentos, caixinhas (mesmo com saldo)
-- e movimentos, e não toca nos dados de B.
begin;
select plan(3);

select tests.criar_usuario('a@teste.com') as a \gset
select tests.criar_usuario('b@teste.com') as b \gset

insert into auth."session" (id, "expiresAt", token, "updatedAt", "userId")
values ('s-a', now() + interval '1 day', 'tok-a', now(), :'a');
insert into public.lancamentos (user_id, tipo, valor_centavos, categoria, data) values
  (:'a', 'gasto', 100, 'lazer', current_date - 1), (:'b', 'gasto', 200, 'lazer', current_date - 1);
insert into public.caixinhas (id, user_id, nome_cifrado, icone, meta_centavos, prazo) values
  ('00000000-0000-0000-0000-0000000000a1', :'a', tests.cifrado(), 'casa', 1000, current_date + 30),
  ('00000000-0000-0000-0000-0000000000b1', :'b', tests.cifrado(), 'casa', 1000, current_date + 30);
insert into public.movimentos_caixinha (user_id, caixinha_id, tipo, valor_centavos, data) values
  (:'a', '00000000-0000-0000-0000-0000000000a1', 'guardar', 500, current_date - 1),
  (:'b', '00000000-0000-0000-0000-0000000000b1', 'guardar', 700, current_date - 1);

create function pg_temp.linhas_de(uid text) returns int language sql as $$
  select (select count(*) from public.perfis where id = uid)
       + (select count(*) from auth."session" where "userId" = uid)
       + (select count(*) from public.lancamentos where user_id = uid)
       + (select count(*) from public.caixinhas where user_id = uid)
       + (select count(*) from public.movimentos_caixinha where user_id = uid) $$;

select lives_ok(format($$ delete from auth."user" where id = %L $$, :'a'),
  'apagar A passa, mesmo com caixinha com saldo');
select is(pg_temp.linhas_de(:'a'), 0, 'nenhuma linha de A sobra');
select is(pg_temp.linhas_de(:'b'), 4, 'os dados de B continuam intactos');

select * from finish();
rollback;
