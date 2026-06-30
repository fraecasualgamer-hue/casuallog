-- CasualLog — Schema completo (Fase 2)
-- Rodar no SQL Editor do Supabase Dashboard

-- ============================================================
-- TIPOS ENUMERADOS
-- ============================================================

create type media_source as enum ('igdb', 'tmdb', 'anilist', 'books');
create type media_kind as enum ('game', 'movie', 'series', 'anime', 'manga', 'book');
create type list_type as enum ('correndo_atras', 'ca_pocket', 'para_quem_gosta', 'revisitando_infancia', 'livre');
create type list_visibility as enum ('private', 'public');
create type item_role as enum ('principal', 'upgrade');
create type item_classification as enum ('classico', 'desconhecido', 'retro', 'canone', 'spin_off');
create type progress_status as enum ('quero', 'jogando', 'zerado', 'na_estante', 'abandonado');

-- ============================================================
-- PROFILES (estende auth.users)
-- ============================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  is_curator boolean default false,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Perfil público: qualquer um lê"
  on profiles for select using (true);

create policy "Usuário edita próprio perfil"
  on profiles for update using (auth.uid() = id);

create policy "Usuário insere próprio perfil"
  on profiles for insert with check (auth.uid() = id);

-- Trigger: criar perfil automaticamente no signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'preferred_username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- MEDIA_ITEMS (cache leve das APIs externas)
-- ============================================================

create table media_items (
  id uuid primary key default gen_random_uuid(),
  source media_source not null,
  source_id text not null,
  kind media_kind not null,
  title text not null,
  cover_url text,
  release_year int,
  platform text,
  cached_at timestamptz default now(),
  unique (source, source_id)
);

alter table media_items enable row level security;

create policy "Qualquer um lê media_items"
  on media_items for select using (true);

create policy "Usuário autenticado insere media_items"
  on media_items for insert with check (auth.role() = 'authenticated');

-- ============================================================
-- LISTS (listas temáticas)
-- ============================================================

create table lists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  type list_type not null default 'livre',
  title text not null,
  description text,
  theme text,
  visibility list_visibility not null default 'private',
  cover_url text,
  like_count int default 0,
  copied_from uuid references lists(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table lists enable row level security;

create policy "Listas públicas: qualquer um lê"
  on lists for select using (visibility = 'public' or owner_id = auth.uid());

create policy "Dono gerencia próprias listas"
  on lists for insert with check (owner_id = auth.uid());

create policy "Dono atualiza próprias listas"
  on lists for update using (owner_id = auth.uid());

create policy "Dono deleta próprias listas"
  on lists for delete using (owner_id = auth.uid());

-- ============================================================
-- LIST_ITEMS (vínculo obra ↔ lista)
-- ============================================================

create table list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references lists(id) on delete cascade,
  media_item_id uuid not null references media_items(id) on delete cascade,
  role item_role not null default 'principal',
  classification item_classification,
  obtained boolean default false,
  runs boolean,
  price numeric,
  position int not null default 0,
  note text
);

alter table list_items enable row level security;

create policy "list_items: leitura segue visibilidade da lista"
  on list_items for select using (
    exists (
      select 1 from lists
      where lists.id = list_items.list_id
      and (lists.visibility = 'public' or lists.owner_id = auth.uid())
    )
  );

create policy "list_items: dono da lista gerencia"
  on list_items for insert with check (
    exists (select 1 from lists where lists.id = list_items.list_id and lists.owner_id = auth.uid())
  );

create policy "list_items: dono da lista atualiza"
  on list_items for update using (
    exists (select 1 from lists where lists.id = list_items.list_id and lists.owner_id = auth.uid())
  );

create policy "list_items: dono da lista deleta"
  on list_items for delete using (
    exists (select 1 from lists where lists.id = list_items.list_id and lists.owner_id = auth.uid())
  );

-- ============================================================
-- PROGRESS (status pessoal do usuário numa obra)
-- ============================================================

create table progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  media_item_id uuid not null references media_items(id) on delete cascade,
  status progress_status not null default 'quero',
  tier int check (tier >= 1 and tier <= 4),
  seals text[],
  review text,
  updated_at timestamptz default now(),
  unique (user_id, media_item_id)
);

alter table progress enable row level security;

create policy "Usuário lê próprio progresso"
  on progress for select using (user_id = auth.uid());

create policy "Usuário insere próprio progresso"
  on progress for insert with check (user_id = auth.uid());

create policy "Usuário atualiza próprio progresso"
  on progress for update using (user_id = auth.uid());

create policy "Usuário deleta próprio progresso"
  on progress for delete using (user_id = auth.uid());
