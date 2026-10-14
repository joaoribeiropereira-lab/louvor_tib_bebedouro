-- =====================================================================
-- Grupo de Louvor TIB Bebedouro — Fase 1 (Fundação)
-- Perfis, papéis, instrumentos, configurações, auditoria e RLS.
-- Execute inteiro no SQL Editor do Supabase (ou via Supabase CLI).
-- =====================================================================

create type public.papel_usuario as enum ('admin', 'membro');

-- ---------------------------------------------------------------------
-- Perfis (1:1 com auth.users)
-- ---------------------------------------------------------------------
create table public.profiles (
  id                 uuid primary key references auth.users (id) on delete cascade,
  email              text not null,
  nome_exibicao      text not null check (char_length(nome_exibicao) between 2 and 80),
  papel              public.papel_usuario not null default 'membro',
  ativo              boolean not null default true,
  tom_preferido      text check (tom_preferido is null or tom_preferido ~ '^[A-G](#|b)?m?$'),
  primeiro_acesso_em timestamptz,
  criado_em          timestamptz not null default now(),
  atualizado_em      timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- ---------------------------------------------------------------------
-- Funções auxiliares (security definer evita recursão de RLS)
-- ---------------------------------------------------------------------
create or replace function public.is_ativo()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and ativo);
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and ativo and papel = 'admin'
  );
$$;

revoke all on function public.is_ativo() from public, anon;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_ativo() to authenticated;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------
-- Proteção de campos sensíveis do perfil (vale mesmo com acesso direto à API)
--  * membro não altera papel, ativo, e-mail nem id
--  * nunca deixa o grupo sem um administrador ativo
--  * chamadas sem usuário (service role / SQL Editor) são tratadas como servidor
-- ---------------------------------------------------------------------
create or replace function public.proteger_campos_perfil()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if new.papel is distinct from old.papel
       or new.ativo is distinct from old.ativo
       or new.email is distinct from old.email
       or new.id is distinct from old.id then
      raise exception 'Alteração não permitida.';
    end if;
  end if;

  if old.papel = 'admin' and old.ativo and (new.papel <> 'admin' or not new.ativo) then
    if not exists (
      select 1 from public.profiles
      where id <> old.id and papel = 'admin' and ativo
    ) then
      raise exception 'Deve existir ao menos um administrador ativo.';
    end if;
  end if;

  new.atualizado_em = now();
  return new;
end;
$$;

create trigger trg_proteger_campos_perfil
  before update on public.profiles
  for each row execute function public.proteger_campos_perfil();

-- ---------------------------------------------------------------------
-- Criação automática do perfil quando um usuário é criado/convidado.
-- O papel inicial é SEMPRE 'membro'. Promoção só por um administrador.
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, nome_exibicao)
  values (
    new.id,
    new.email,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'nome'), ''), split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Políticas de profiles
-- Membros enxergam só o próprio perfil. A lista de colegas (apenas nome)
-- fica na view public.diretorio, sem e-mail.
-- ---------------------------------------------------------------------
create policy "perfil: ler o proprio" on public.profiles
  for select to authenticated using (id = auth.uid());

create policy "perfil: admin le todos" on public.profiles
  for select to authenticated using (public.is_admin());

create policy "perfil: atualizar o proprio" on public.profiles
  for update to authenticated
  using (id = auth.uid() and ativo)
  with check (id = auth.uid());

create policy "perfil: admin atualiza todos" on public.profiles
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Sem política de INSERT/DELETE: perfis nascem pelo gatilho e saem por cascata.

create view public.diretorio as
  select id, nome_exibicao
  from public.profiles
  where ativo and public.is_ativo();

revoke all on public.diretorio from anon;
grant select on public.diretorio to authenticated;

-- ---------------------------------------------------------------------
-- Instrumentos e funções (configuráveis pelo administrador)
-- ---------------------------------------------------------------------
create table public.instrumentos (
  id    uuid primary key default gen_random_uuid(),
  nome  text not null unique check (char_length(nome) between 2 and 60),
  ativo boolean not null default true,
  ordem integer not null default 100
);
alter table public.instrumentos enable row level security;

create policy "instrumentos: ler" on public.instrumentos
  for select to authenticated using (public.is_ativo());
create policy "instrumentos: admin escreve" on public.instrumentos
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into public.instrumentos (nome, ordem) values
  ('Vocal principal', 10), ('Vocal de apoio', 20), ('Violão', 30), ('Guitarra', 40),
  ('Teclado', 50), ('Baixo', 60), ('Bateria', 70), ('Percussão', 80);

create table public.perfil_instrumentos (
  perfil_id      uuid not null references public.profiles (id) on delete cascade,
  instrumento_id uuid not null references public.instrumentos (id) on delete cascade,
  principal      boolean not null default false,
  primary key (perfil_id, instrumento_id)
);
alter table public.perfil_instrumentos enable row level security;

create policy "perfil_instrumentos: ler" on public.perfil_instrumentos
  for select to authenticated using (public.is_ativo());
create policy "perfil_instrumentos: proprio escreve" on public.perfil_instrumentos
  for all to authenticated
  using (perfil_id = auth.uid() and public.is_ativo())
  with check (perfil_id = auth.uid() and public.is_ativo());
create policy "perfil_instrumentos: admin escreve" on public.perfil_instrumentos
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- Configurações do grupo
-- ---------------------------------------------------------------------
create table public.configuracoes (
  chave         text primary key,
  valor         jsonb not null,
  atualizado_em timestamptz not null default now()
);
alter table public.configuracoes enable row level security;

create policy "configuracoes: ler" on public.configuracoes
  for select to authenticated using (public.is_ativo());
create policy "configuracoes: admin escreve" on public.configuracoes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into public.configuracoes (chave, valor)
values ('nome_grupo', to_jsonb('Grupo de Louvor TIB Bebedouro'::text));

-- ---------------------------------------------------------------------
-- Auditoria (somente o administrador lê; escrita só pela função abaixo)
-- ---------------------------------------------------------------------
create table public.auditoria (
  id          bigint generated always as identity primary key,
  ator_id     uuid references public.profiles (id) on delete set null,
  acao        text not null,
  entidade    text not null,
  entidade_id text,
  detalhes    jsonb not null default '{}'::jsonb,
  criado_em   timestamptz not null default now()
);
alter table public.auditoria enable row level security;
create index auditoria_criado_em_idx on public.auditoria (criado_em desc);

create policy "auditoria: admin le" on public.auditoria
  for select to authenticated using (public.is_admin());

create or replace function public.registrar_auditoria(
  p_acao text, p_entidade text, p_entidade_id text default null, p_detalhes jsonb default '{}'::jsonb
) returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_ativo() then
    raise exception 'Não autorizado.';
  end if;
  insert into public.auditoria (ator_id, acao, entidade, entidade_id, detalhes)
  values (auth.uid(), p_acao, p_entidade, p_entidade_id, coalesce(p_detalhes, '{}'::jsonb));
end;
$$;

revoke all on function public.registrar_auditoria(text, text, text, jsonb) from public, anon;
grant execute on function public.registrar_auditoria(text, text, text, jsonb) to authenticated;
