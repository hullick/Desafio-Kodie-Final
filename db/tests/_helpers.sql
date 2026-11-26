-- Helpers dos testes pgTAP. Aplicados pelo runner (docker/pgtap/run.sh) no banco de teste.
-- Cada arquivo de teste roda em begin ... rollback, então nada persiste.

create schema tests;
grant usage on schema tests to nubanko_app;

-- Cria um usuário do Better Auth (tabela do plan 01) e devolve o id.
create function tests.criar_usuario(
  email text,
  nome text default 'Teste',
  aceite_versao text default '2026-11'
) returns text language plpgsql as $$
declare
  novo_id text := gen_random_uuid()::text;
begin
  insert into auth."user" (id, name, email, "emailVerified", "aceiteVersao", "createdAt", "updatedAt")
  values (novo_id, nome, email, true, aceite_versao, now(), now());
  return novo_id;
end $$;

-- As tabelas temporárias do pgTAP pertencem a quem chamou plan(); libera para os papéis de teste.
create function tests._liberar_pgtap() returns void language plpgsql as $$
declare t record;
begin
  for t in
    select c.oid::regclass as rel from pg_class c
    where c.relnamespace = pg_my_temp_schema() and c.relkind in ('r', 'S')
      and c.relowner = (select oid from pg_roles where rolname = current_user)
  loop
    execute format('grant all on %s to public', t.rel);
  end loop;
end $$;

-- Age como o usuário uid: papel das functions + app.user_id local à transação.
create function tests.autenticar_como(uid text) returns void language plpgsql as $$
begin
  perform tests._liberar_pgtap();
  perform set_config('app.user_id', uid, true);
  set local role nubanko_app;
end $$;

-- Age como requisição sem sessão: papel das functions sem app.user_id.
create function tests.anonimo() returns void language plpgsql as $$
begin
  perform tests._liberar_pgtap();
  perform set_config('app.user_id', '', true);
  set local role nubanko_app;
end $$;

-- Volta ao superusuário do runner.
create function tests.resetar() returns void language plpgsql as $$
begin
  reset role;
  perform set_config('app.user_id', '', true);
end $$;

grant execute on all functions in schema tests to nubanko_app;
