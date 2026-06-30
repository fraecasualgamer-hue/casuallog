-- CasualLog — Migração 004: Consolidação de todas as features
-- Rodar no SQL Editor do Supabase Dashboard

-- ============================================================
-- 1. PROFILES — colunas novas (IF NOT EXISTS para não conflitar)
-- ============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS accent TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS favorite_genres TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS favorite_platforms TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pinned TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarded BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birthdate DATE;

-- RLS de profiles (drop e recria para garantir consistência)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Perfil público: qualquer um lê" ON profiles;
DROP POLICY IF EXISTS "Perfis públicos visíveis por todos" ON profiles;
CREATE POLICY "Perfis públicos visíveis por todos"
  ON profiles FOR SELECT
  USING (is_private = false OR auth.uid() = id);

DROP POLICY IF EXISTS "Usuário edita próprio perfil" ON profiles;
CREATE POLICY "Usuário edita próprio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuário insere próprio perfil" ON profiles;
CREATE POLICY "Usuário insere próprio perfil"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- 2. USER_LISTS (substitui a tabela 'lists' se necessário)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_lists (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type          TEXT NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT DEFAULT '',
  theme         TEXT DEFAULT '',
  visibility    TEXT DEFAULT 'private',
  cover_url     TEXT,
  like_count    INT DEFAULT 0,
  status        TEXT DEFAULT 'building',
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  paused_at     TIMESTAMPTZ,
  total_time_ms BIGINT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_lists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Listas públicas visíveis por todos" ON user_lists;
CREATE POLICY "Listas públicas visíveis por todos"
  ON user_lists FOR SELECT
  USING (visibility = 'public' OR auth.uid() = owner_id);

DROP POLICY IF EXISTS "Dono gerencia suas listas" ON user_lists;
CREATE POLICY "Dono gerencia suas listas"
  ON user_lists FOR ALL
  USING (auth.uid() = owner_id);

-- ============================================================
-- 3. LIST_ITEMS
-- ============================================================

CREATE TABLE IF NOT EXISTS list_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id         UUID NOT NULL REFERENCES user_lists(id) ON DELETE CASCADE,
  media_item_id   UUID REFERENCES media_items(id),
  role            TEXT DEFAULT 'principal',
  position        INT DEFAULT 0,
  status          TEXT DEFAULT 'quero',
  classification  TEXT,
  note            TEXT,
  obtained        BOOLEAN DEFAULT false,
  runs            BOOLEAN DEFAULT false,
  price           NUMERIC,
  genre           TEXT,
  subgenre        TEXT,
  developer       TEXT,
  hltb_main       NUMERIC,
  hltb_completionist NUMERIC,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Items de listas públicas visíveis" ON list_items;
CREATE POLICY "Items de listas públicas visíveis"
  ON list_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_lists l
      WHERE l.id = list_id
        AND (l.visibility = 'public' OR l.owner_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Dono gerencia items" ON list_items;
CREATE POLICY "Dono gerencia items"
  ON list_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_lists l
      WHERE l.id = list_id AND l.owner_id = auth.uid()
    )
  );

-- ============================================================
-- 4. FOLLOWS
-- ============================================================

-- follows já existe com followee_id — apenas atualizar policies
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Qualquer um lê follows" ON follows;
DROP POLICY IF EXISTS "Usuário segue" ON follows;
DROP POLICY IF EXISTS "Usuário deixa de seguir" ON follows;
DROP POLICY IF EXISTS "Usuário vê e gerencia seus follows" ON follows;
DROP POLICY IF EXISTS "Usuário vê quem o segue" ON follows;

CREATE POLICY "Usuário vê e gerencia seus follows"
  ON follows FOR ALL USING (auth.uid() = follower_id);

CREATE POLICY "Usuário vê quem o segue"
  ON follows FOR SELECT USING (auth.uid() = followee_id);

-- ============================================================
-- 5. FRIEND_REQUESTS
-- ============================================================

CREATE TABLE IF NOT EXISTS friend_requests (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status     TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (from_id, to_id)
);

ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuário gerencia suas solicitações" ON friend_requests;
CREATE POLICY "Usuário gerencia suas solicitações"
  ON friend_requests FOR ALL
  USING (auth.uid() = from_id OR auth.uid() = to_id);
