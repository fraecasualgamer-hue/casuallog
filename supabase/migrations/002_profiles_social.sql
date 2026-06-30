-- CasualLog — Migração 002: Perfil rico + Social
-- Rodar no SQL Editor do Supabase Dashboard

-- ============================================================
-- NOVOS CAMPOS EM PROFILES
-- ============================================================

alter table profiles add column if not exists birthdate date;
alter table profiles add column if not exists onboarded boolean default false;
alter table profiles add column if not exists banner_url text;
alter table profiles add column if not exists accent text;
alter table profiles add column if not exists favorite_genres text[] default '{}';
alter table profiles add column if not exists favorite_platforms text[] default '{}';
alter table profiles add column if not exists is_private boolean default false;
alter table profiles add column if not exists pinned text[] default '{}';

-- ============================================================
-- FOLLOWS (unilateral — seguir)
-- ============================================================

create table if not exists follows (
  follower_id uuid not null references profiles(id) on delete cascade,
  followee_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

alter table follows enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Qualquer um lê follows') then
    create policy "Qualquer um lê follows" on follows for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Usuário segue') then
    create policy "Usuário segue" on follows for insert with check (auth.uid() = follower_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Usuário deixa de seguir') then
    create policy "Usuário deixa de seguir" on follows for delete using (auth.uid() = follower_id);
  end if;
end $$;

-- ============================================================
-- FRIENDSHIPS (mútua — pedido → aceite)
-- ============================================================

do $$ begin
  create type friendship_status as enum ('pending', 'accepted');
exception when duplicate_object then null;
end $$;

create table if not exists friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references profiles(id) on delete cascade,
  addressee_id uuid not null references profiles(id) on delete cascade,
  status friendship_status not null default 'pending',
  created_at timestamptz default now(),
  unique (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

alter table friendships enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Partes leem amizade') then
    create policy "Partes leem amizade" on friendships for select
      using (auth.uid() = requester_id or auth.uid() = addressee_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Requester pede amizade') then
    create policy "Requester pede amizade" on friendships for insert
      with check (auth.uid() = requester_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Addressee aceita amizade') then
    create policy "Addressee aceita amizade" on friendships for update
      using (auth.uid() = addressee_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Partes removem amizade') then
    create policy "Partes removem amizade" on friendships for delete
      using (auth.uid() = requester_id or auth.uid() = addressee_id);
  end if;
end $$;

-- ============================================================
-- STORAGE
-- ============================================================
-- Criar manualmente no Dashboard:
-- 1. Storage → New bucket → nome: "avatars" → marcar como Public
-- 2. Clicar no bucket "avatars" → Policies → New policy → "Allow public read" (SELECT para todos)
-- 3. New policy → "Allow authenticated upload" (INSERT para authenticated, path = uid/*)
-- Não é possível criar via SQL nesta versão do Supabase.
