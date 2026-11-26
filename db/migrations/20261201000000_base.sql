-- Base comum a todas as specs: o schema app e a função que liga a sessão ao RLS.
-- As functions executam set_config('app.user_id', <id>, true) dentro da transação
-- (helper comUsuario) e as políticas comparam user_id = app.usuario_id().

create schema app;

create function app.usuario_id() returns text
  language sql stable
  as $$ select nullif(current_setting('app.user_id', true), '') $$;

comment on function app.usuario_id() is
  'Id do usuário da transação atual (Better Auth), ou nulo sem sessão.';

grant usage on schema app to nubanko_app;
grant execute on function app.usuario_id() to nubanko_app;
grant usage on schema public to nubanko_app;
