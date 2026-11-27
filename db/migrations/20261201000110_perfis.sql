-- Plan 01 (R-01.3, R-01.10): perfil criado no cadastro, com o nome CIFRADO.
--
-- Fluxo do cadastro: o hook do Better Auth (netlify/lib/auth.ts) gera o id do usuário, cifra o
-- nome com a chave derivada desse id (AES-256-GCM, netlify/lib/cripto.ts) e grava o texto
-- cifrado em auth."user".name. A trigger abaixo move esse valor para perfis.nome_cifrado e
-- esvazia auth."user".name, para o nome não existir em claro em lugar nenhum do banco.

-- Formato do texto cifrado: v1.<iv base64url>.<cifra+tag base64url>. Usado nos checks de todas
-- as colunas *_cifrado: o banco recusa texto em claro mesmo se o código esquecer de cifrar.
create function app.eh_cifrado(t text) returns boolean
  language sql immutable
  as $$ select t ~ '^v1\.[A-Za-z0-9_-]{16}\.[A-Za-z0-9_-]{22,}$' $$;

grant execute on function app.eh_cifrado(text) to nubanko_app;

create table public.perfis (
  id text primary key references auth."user" (id) on delete cascade,
  nome_cifrado text not null check (app.eh_cifrado(nome_cifrado)),
  aceite_politica_em timestamptz not null,
  versao_politica text not null check (versao_politica <> ''),
  criado_em timestamptz not null default now()
);

comment on column public.perfis.nome_cifrado is
  'Nome cifrado (AES-256-GCM, chave derivada do id do usuário, AAD perfis.nome:<id>).';

alter table public.perfis enable row level security;
alter table public.perfis force row level security;

create policy dono_le on public.perfis for select to nubanko_app
  using (id = app.usuario_id());
create policy dono_atualiza on public.perfis for update to nubanko_app
  using (id = app.usuario_id()) with check (id = app.usuario_id());
-- Só a trigger de cadastro (security definer, roda como nubanko_owner) cria perfis.
create policy criado_no_cadastro on public.perfis for insert to nubanko_owner
  with check (true);

grant select on public.perfis to nubanko_app;
grant update (nome_cifrado) on public.perfis to nubanko_app;

create function public.criar_perfil() returns trigger
  language plpgsql security definer set search_path = ''
  as $$
begin
  if coalesce(new."aceiteVersao", '') = '' then
    raise exception 'aceite_obrigatorio';
  end if;
  if not app.eh_cifrado(new.name) then
    raise exception 'nome_nao_cifrado';
  end if;
  insert into public.perfis (id, nome_cifrado, aceite_politica_em, versao_politica)
  values (new.id, new.name, now(), new."aceiteVersao");
  update auth."user" set name = '' where id = new.id;
  return null;
end $$;

create trigger criar_perfil after insert on auth."user"
  for each row execute function public.criar_perfil();

-- Better Auth nunca deve regravar o nome: o nome muda só por PATCH /api/perfil.
create function public.manter_nome_vazio() returns trigger
  language plpgsql set search_path = ''
  as $$
begin
  new.name := '';
  return new;
end $$;

create trigger manter_nome_vazio before update of name on auth."user"
  for each row execute function public.manter_nome_vazio();

-- E-mail e data de cadastro de quem está na transação, para GET /api/perfil (R-05.1).
-- security definer: nubanko_app não lê auth."user"; esta função devolve só a própria linha.
create function public.meu_email_e_cadastro()
  returns table (email text, criado_em timestamptz)
  language sql stable security definer set search_path = ''
  as $$ select u.email, u."createdAt" from auth."user" u where u.id = app.usuario_id() $$;

revoke execute on function public.meu_email_e_cadastro() from public;
grant execute on function public.meu_email_e_cadastro() to nubanko_app;

-- Trigger genérica: ninguém troca o dono de uma linha (reutilizada nas tabelas de domínio).
create function public.impedir_troca_de_dono() returns trigger
  language plpgsql set search_path = ''
  as $$
begin
  if new.user_id is distinct from old.user_id then
    raise exception 'troca_de_dono';
  end if;
  return new;
end $$;

-- Atualiza atualizado_em em qualquer update (reutilizada nas tabelas de domínio).
create function public.tocar_atualizado_em() returns trigger
  language plpgsql set search_path = ''
  as $$
begin
  new.atualizado_em := now();
  return new;
end $$;

-- Hoje no fuso do app (America/Sao_Paulo), base das validações de data.
create function app.hoje() returns date
  language sql stable
  as $$ select (now() at time zone 'America/Sao_Paulo')::date $$;

grant execute on function app.hoje() to nubanko_app;
