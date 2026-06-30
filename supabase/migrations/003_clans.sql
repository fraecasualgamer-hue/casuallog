-- CasualLog — Migração 003: Sistema de Clãs

do $$ begin
  create type clan_join_mode as enum ('open', 'approval');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type clan_role as enum ('leader', 'moderator', 'member');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type wall_post_type as enum ('post', 'activity');
exception when duplicate_object then null;
end $$;

create table if not exists clans (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text,
  avatar_url text,
  banner_url text,
  accent text default '#22b885',
  leader_id uuid not null references profiles(id) on delete cascade,
  join_mode clan_join_mode not null default 'approval',
  member_limit int not null default 10,
  xp int not null default 0,
  level int not null default 1,
  created_at timestamptz default now()
);

alter table clans enable row level security;
create policy "Qualquer um lê clãs" on clans for select using (true);
create policy "Líder cria clã" on clans for insert with check (auth.uid() = leader_id);
create policy "Líder atualiza clã" on clans for update using (auth.uid() = leader_id);

create table if not exists clan_members (
  clan_id uuid not null references clans(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role clan_role not null default 'member',
  joined_at timestamptz default now(),
  primary key (clan_id, user_id)
);

alter table clan_members enable row level security;
create policy "Qualquer um lê membros" on clan_members for select using (true);
create policy "Membro entra" on clan_members for insert with check (auth.uid() = user_id);
create policy "Membro sai" on clan_members for delete using (auth.uid() = user_id);

create table if not exists clan_objectives (
  id uuid primary key default gen_random_uuid(),
  clan_id uuid not null references clans(id) on delete cascade,
  title text not null,
  deadline date,
  completed_at timestamptz,
  created_at timestamptz default now()
);

alter table clan_objectives enable row level security;
create policy "Membros leem objetivos" on clan_objectives for select using (
  exists (select 1 from clan_members where clan_members.clan_id = clan_objectives.clan_id and clan_members.user_id = auth.uid())
);

create table if not exists clan_objective_items (
  id uuid primary key default gen_random_uuid(),
  objective_id uuid not null references clan_objectives(id) on delete cascade,
  media_item_id uuid references media_items(id),
  title text not null,
  cover_url text
);

alter table clan_objective_items enable row level security;
create policy "Membros leem itens de objetivo" on clan_objective_items for select using (
  exists (
    select 1 from clan_objectives co
    join clan_members cm on cm.clan_id = co.clan_id
    where co.id = clan_objective_items.objective_id and cm.user_id = auth.uid()
  )
);

create table if not exists clan_objective_progress (
  objective_item_id uuid not null references clan_objective_items(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  completed_at timestamptz default now(),
  primary key (objective_item_id, user_id)
);

alter table clan_objective_progress enable row level security;
create policy "Membros leem progresso" on clan_objective_progress for select using (true);
create policy "Usuário marca progresso" on clan_objective_progress for insert with check (auth.uid() = user_id);

create table if not exists clan_achievements (
  clan_id uuid not null references clans(id) on delete cascade,
  achievement_code text not null,
  earned_at timestamptz default now(),
  primary key (clan_id, achievement_code)
);

alter table clan_achievements enable row level security;
create policy "Qualquer um lê conquistas do clã" on clan_achievements for select using (true);

create table if not exists clan_wall_posts (
  id uuid primary key default gen_random_uuid(),
  clan_id uuid not null references clans(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  body text,
  media_item_id uuid references media_items(id),
  type wall_post_type not null default 'post',
  created_at timestamptz default now()
);

alter table clan_wall_posts enable row level security;
create policy "Membros leem mural" on clan_wall_posts for select using (
  exists (select 1 from clan_members where clan_members.clan_id = clan_wall_posts.clan_id and clan_members.user_id = auth.uid())
);
create policy "Membro posta no mural" on clan_wall_posts for insert with check (
  exists (select 1 from clan_members where clan_members.clan_id = clan_wall_posts.clan_id and clan_members.user_id = auth.uid())
);

create table if not exists clan_wall_reactions (
  post_id uuid not null references clan_wall_posts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  emoji text not null,
  primary key (post_id, user_id, emoji)
);

alter table clan_wall_reactions enable row level security;
create policy "Membros leem reações" on clan_wall_reactions for select using (true);
create policy "Membro reage" on clan_wall_reactions for insert with check (auth.uid() = user_id);
create policy "Membro remove reação" on clan_wall_reactions for delete using (auth.uid() = user_id);
