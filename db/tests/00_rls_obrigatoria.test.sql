-- R-00.1: toda tabela de public tem RLS habilitado e forçado, e o papel das functions
-- não consegue contorná-lo. O guarda vale para tabelas criadas por specs futuras.
begin;
select plan(7);

create function pg_temp.tabelas_sem_rls() returns setof name language sql as $$
  select c.relname
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind in ('r', 'p')
    and c.relname <> '_migracoes'
    and not (c.relrowsecurity and c.relforcerowsecurity)
  order by 1
$$;

select is_empty(
  'select * from pg_temp.tabelas_sem_rls()',
  'R-00.1: toda tabela de public tem RLS habilitado e forçado'
);

select ok(
  not (select rolbypassrls from pg_roles where rolname = 'nubanko_app'),
  'R-00.1: nubanko_app não tem BYPASSRLS'
);

select ok(
  not (select rolsuper from pg_roles where rolname = 'nubanko_app'),
  'R-00.1: nubanko_app não é superusuário'
);

select is_empty(
  $$ select c.relname from pg_class c
     join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and pg_get_userbyid(c.relowner) = 'nubanko_app' $$,
  'R-00.1: nubanko_app não é dono de nenhuma tabela de public'
);

select ok(
  not has_table_privilege('nubanko_app', 'public._migracoes', 'select'),
  'nubanko_app não lê a tabela interna _migracoes'
);

-- O guarda precisa apontar uma tabela nova sem RLS (o rollback a desfaz).
create table public._teste_sem_rls (id int);
select results_eq(
  'select * from pg_temp.tabelas_sem_rls()',
  $$ values ('_teste_sem_rls'::name) $$,
  'o guarda aponta uma tabela criada sem RLS'
);

-- E aceita a mesma tabela depois de habilitar e forçar o RLS.
alter table public._teste_sem_rls enable row level security;
alter table public._teste_sem_rls force row level security;
select is_empty(
  'select * from pg_temp.tabelas_sem_rls()',
  'o guarda aceita a tabela com RLS forçado'
);

select * from finish();
rollback;
