-- Plan 02 (spec 02): lançamentos com RLS de dono. A descrição é texto livre da pessoa e fica
-- CIFRADA (AAD lancamentos.descricao:<id>); o limite de 60 caracteres é validado na function,
-- antes de cifrar. Valor, tipo, categoria e data ficam em claro para filtrar e somar no banco.

create table public.lancamentos (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default app.usuario_id() references auth."user" (id) on delete cascade,
  tipo text not null check (tipo in ('gasto', 'entrada')),
  valor_centavos bigint not null check (valor_centavos between 1 and 99999999),
  categoria text not null,
  descricao_cifrada text check (descricao_cifrada is null or app.eh_cifrado(descricao_cifrada)),
  data date not null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint categoria_do_tipo check (
    (tipo = 'gasto' and categoria in
      ('alimentacao', 'transporte', 'lazer', 'compras', 'contas', 'saude', 'educacao', 'outros_gasto'))
    or (tipo = 'entrada' and categoria in ('salario', 'extra', 'presente', 'outros_entrada'))
  )
);

create index lancamentos_usuario_data on public.lancamentos (user_id, data desc, criado_em desc);

alter table public.lancamentos enable row level security;
alter table public.lancamentos force row level security;

create policy dono_le on public.lancamentos for select to nubanko_app
  using (user_id = app.usuario_id());
create policy dono_cria on public.lancamentos for insert to nubanko_app
  with check (user_id = app.usuario_id());
create policy dono_atualiza on public.lancamentos for update to nubanko_app
  using (user_id = app.usuario_id()) with check (user_id = app.usuario_id());
create policy dono_apaga on public.lancamentos for delete to nubanko_app
  using (user_id = app.usuario_id());

grant select, insert, update, delete on public.lancamentos to nubanko_app;

create function public.validar_data_lancamento() returns trigger
  language plpgsql set search_path = ''
  as $$
begin
  if new.data > app.hoje() then
    raise exception 'data_futura';
  end if;
  return new;
end $$;

create trigger validar_data before insert or update of data on public.lancamentos
  for each row execute function public.validar_data_lancamento();
create trigger impedir_troca_de_dono before update on public.lancamentos
  for each row execute function public.impedir_troca_de_dono();
create trigger tocar_atualizado_em before update on public.lancamentos
  for each row execute function public.tocar_atualizado_em();
