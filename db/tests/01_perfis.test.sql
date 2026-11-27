-- R-01.3/R-01.10 e R-00.1: perfil criado no cadastro, com nome cifrado e isolado por dono.
begin;
select plan(13);

select tests.criar_usuario('a@teste.com', tests.cifrado('nomea')) as a \gset
select tests.criar_usuario('b@teste.com', tests.cifrado('nomeb')) as b \gset

select is((select count(*)::int from public.perfis where id = :'a'), 1, 'o cadastro cria o perfil');
select is((select nome_cifrado from public.perfis where id = :'a'), tests.cifrado('nomea'),
  'o perfil recebe o nome cifrado');
select is((select name from auth."user" where id = :'a'), '', 'auth.user.name fica vazio (sem nome em claro)');
select is((select versao_politica from public.perfis where id = :'a'), '2026-11', 'guarda a versão do aceite');

select throws_ok(
  $$ select tests.criar_usuario('c@teste.com', tests.cifrado(), '') $$,
  'P0001', 'aceite_obrigatorio', 'sem aceite, o cadastro falha');
select throws_ok(
  $$ select tests.criar_usuario('d@teste.com', 'Nome em claro') $$,
  'P0001', 'nome_nao_cifrado', 'nome em claro é recusado pelo banco');

select tests.autenticar_como(:'a');
select results_eq('select id from public.perfis', array[:'a'], 'A só vê o próprio perfil');
select is_empty(format($$ update public.perfis set nome_cifrado = %L where id = %L returning id $$,
  tests.cifrado('x'), :'b'), 'A não altera o perfil de B');
select throws_ok($$ update public.perfis set versao_politica = 'x' $$, '42501', null,
  'A não altera a versão do aceite (grant só de nome)');
select throws_ok($$ update public.perfis set nome_cifrado = 'texto em claro' $$, '23514', null,
  'nome em claro é recusado no update');
select throws_ok($$ select * from auth."user" $$, '42501', null, 'nubanko_app não lê auth.user');
select results_eq('select email from public.meu_email_e_cadastro()', array['a@teste.com'],
  'meu_email_e_cadastro devolve só o e-mail de A');

select tests.anonimo();
select is_empty('select * from public.meu_email_e_cadastro()', 'sem sessão, não devolve ninguém');

select tests.resetar();
select * from finish();
rollback;
