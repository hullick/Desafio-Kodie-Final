-- R-00.1: app.usuario_id() devolve o usuário da transação e nada vaza depois dela.
begin;
select plan(4);

select is(app.usuario_id(), null, 'sem set_config, não há usuário');

select tests.autenticar_como('usuario-a');
select is(app.usuario_id(), 'usuario-a', 'autenticar_como define o usuário da transação');
select is(current_user::text, 'nubanko_app', 'e troca para o papel das functions');

select tests.anonimo();
select is(app.usuario_id(), null, 'anonimo() deixa a transação sem usuário');

select tests.resetar();
select * from finish();
rollback;
