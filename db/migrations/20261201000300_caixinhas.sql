-- Plan 04 (spec 04): caixinhas e movimentos, com as regras de integridade no banco.
-- O nome da caixinha fica CIFRADO (AAD caixinhas.nome:<id>); o limite de 40 caracteres é
-- validado na function. Meta, prazo, ícone e valores ficam em claro para o banco somar o
-- saldo e barrar retirada acima dele.

create table public.caixinhas (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default app.usuario_id() references auth."user" (id) on delete cascade,
  nome_cifrado text not null check (app.eh_cifrado(nome_cifrado)),
  icone text not null check (icone in
    ('aparelho', 'viagem', 'reserva', 'estudos', 'casa', 'carro', 'presente', 'outro')),
  meta_centavos bigint not null check (meta_centavos between 1 and 99999999),
  prazo date not null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  -- Alvo da FK composta dos movimentos: garante que caixinha e movimento são do mesmo dono.
  unique (id, user_id)
);

create table public.movimentos_caixinha (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default app.usuario_id() references auth."user" (id) on delete cascade,
  caixinha_id uuid not null,
  tipo text not null check (tipo in ('guardar', 'retirar')),
  valor_centavos bigint not null check (valor_centavos between 1 and 99999999),
  data date not null,
  criado_em timestamptz not null default now(),
  foreign key (caixinha_id, user_id) references public.caixinhas (id, user_id) on delete cascade
);

create index caixinhas_usuario_prazo on public.caixinhas (user_id, prazo);
create index movimentos_caixinha_data on public.movimentos_caixinha (caixinha_id, data desc, criado_em desc);
create index movimentos_usuario_data on public.movimentos_caixinha (user_id, data);

alter table public.caixinhas enable row level security;
alter table public.caixinhas force row level security;
alter table public.movimentos_caixinha enable row level security;
alter table public.movimentos_caixinha force row level security;

create policy dono_le on public.caixinhas for select to nubanko_app
  using (user_id = app.usuario_id());
create policy dono_cria on public.caixinhas for insert to nubanko_app
  with check (user_id = app.usuario_id());
create policy dono_atualiza on public.caixinhas for update to nubanko_app
  using (user_id = app.usuario_id()) with check (user_id = app.usuario_id());
create policy dono_apaga on public.caixinhas for delete to nubanko_app
  using (user_id = app.usuario_id());

create policy dono_le on public.movimentos_caixinha for select to nubanko_app
  using (user_id = app.usuario_id());
create policy dono_cria on public.movimentos_caixinha for insert to nubanko_app
  with check (user_id = app.usuario_id());

grant select, insert, update, delete on public.caixinhas to nubanko_app;
-- Movimentos não são editados nem apagados um a um: só somem com a caixinha ou a conta.
grant select, insert on public.movimentos_caixinha to nubanko_app;

-- Prazo de hoje até +10 anos (R-04.3), checado ao criar e ao mudar o prazo.
-- Editar só o nome de uma caixinha com prazo vencido continua permitido.
create function public.validar_prazo_caixinha() returns trigger
  language plpgsql set search_path = ''
  as $$
begin
  if tg_op = 'INSERT' or new.prazo is distinct from old.prazo then
    if new.prazo < app.hoje() or new.prazo > (app.hoje() + interval '10 years')::date then
      raise exception 'prazo_invalido';
    end if;
  end if;
  return new;
end $$;

create trigger validar_prazo before insert or update on public.caixinhas
  for each row execute function public.validar_prazo_caixinha();
create trigger impedir_troca_de_dono before update on public.caixinhas
  for each row execute function public.impedir_troca_de_dono();
create trigger tocar_atualizado_em before update on public.caixinhas
  for each row execute function public.tocar_atualizado_em();

-- Movimento (R-04.5): caixinha visível para quem está na transação, data não futura e
-- retirada até o saldo. O "for update" serializa movimentos concorrentes da mesma caixinha.
create function public.validar_movimento() returns trigger
  language plpgsql set search_path = ''
  as $$
declare
  saldo bigint;
begin
  perform 1 from public.caixinhas c where c.id = new.caixinha_id for update;
  if not found then
    raise exception 'caixinha_inexistente';
  end if;
  if new.data > app.hoje() then
    raise exception 'data_futura';
  end if;
  if new.tipo = 'retirar' then
    select coalesce(sum(case m.tipo when 'guardar' then m.valor_centavos else -m.valor_centavos end), 0)
      into saldo
      from public.movimentos_caixinha m
     where m.caixinha_id = new.caixinha_id;
    if new.valor_centavos > saldo then
      raise exception 'saldo_insuficiente';
    end if;
  end if;
  return new;
end $$;

create trigger validar_movimento before insert on public.movimentos_caixinha
  for each row execute function public.validar_movimento();

-- Excluir só com saldo zero (R-04.7). Na exclusão da conta (cascata vinda de auth."user")
-- a trigger roda aninhada (pg_trigger_depth() > 1) e não bloqueia: a conta inteira some.
create function public.validar_exclusao_caixinha() returns trigger
  language plpgsql set search_path = ''
  as $$
begin
  if pg_trigger_depth() = 1 and exists (
    select 1 from public.movimentos_caixinha m
     where m.caixinha_id = old.id
    having sum(case m.tipo when 'guardar' then m.valor_centavos else -m.valor_centavos end) <> 0
  ) then
    raise exception 'caixinha_com_saldo';
  end if;
  return old;
end $$;

create trigger validar_exclusao before delete on public.caixinhas
  for each row execute function public.validar_exclusao_caixinha();

create view public.caixinhas_com_saldo with (security_invoker = true) as
select c.id, c.user_id, c.nome_cifrado, c.icone, c.meta_centavos, c.prazo, c.criado_em, c.atualizado_em,
       coalesce((
         select sum(case m.tipo when 'guardar' then m.valor_centavos else -m.valor_centavos end)
           from public.movimentos_caixinha m
          where m.caixinha_id = c.id
       ), 0)::bigint as saldo_centavos
  from public.caixinhas c;

grant select on public.caixinhas_com_saldo to nubanko_app;
