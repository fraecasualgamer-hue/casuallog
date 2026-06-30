-- CasualLog — Migração 005: Persistência completa de backlog e listas
-- Rodar no SQL Editor do Supabase Dashboard

-- ============================================================
-- 1. PROGRESS: converter status de enum para TEXT (aceita 'pausado'
--    e qualquer status futuro sem precisar mexer no enum)
-- ============================================================
ALTER TABLE progress ALTER COLUMN status DROP DEFAULT;
ALTER TABLE progress ALTER COLUMN status TYPE TEXT USING status::text;
ALTER TABLE progress ALTER COLUMN status SET DEFAULT 'quero';

-- ============================================================
-- 2. MEDIA_ITEMS: campos ricos vindos das APIs
-- ============================================================
ALTER TABLE media_items ADD COLUMN IF NOT EXISTS genre TEXT;
ALTER TABLE media_items ADD COLUMN IF NOT EXISTS subgenre TEXT;
ALTER TABLE media_items ADD COLUMN IF NOT EXISTS developer TEXT;
ALTER TABLE media_items ADD COLUMN IF NOT EXISTS hltb_main NUMERIC;
ALTER TABLE media_items ADD COLUMN IF NOT EXISTS hltb_completionist NUMERIC;
ALTER TABLE media_items ADD COLUMN IF NOT EXISTS author TEXT;
ALTER TABLE media_items ADD COLUMN IF NOT EXISTS publisher TEXT;
ALTER TABLE media_items ADD COLUMN IF NOT EXISTS volumes TEXT;
ALTER TABLE media_items ADD COLUMN IF NOT EXISTS duration TEXT;
ALTER TABLE media_items ADD COLUMN IF NOT EXISTS director TEXT;
ALTER TABLE media_items ADD COLUMN IF NOT EXISTS synopsis TEXT;
ALTER TABLE media_items ADD COLUMN IF NOT EXISTS where_to_watch TEXT;
ALTER TABLE media_items ADD COLUMN IF NOT EXISTS available_platforms TEXT[];
ALTER TABLE media_items ADD COLUMN IF NOT EXISTS price NUMERIC;

-- ============================================================
-- 3. PROGRESS: campos específicos do usuário
-- ============================================================
ALTER TABLE progress ADD COLUMN IF NOT EXISTS obtained BOOLEAN DEFAULT false;
ALTER TABLE progress ADD COLUMN IF NOT EXISTS runs BOOLEAN;
ALTER TABLE progress ADD COLUMN IF NOT EXISTS platform TEXT;

-- ============================================================
-- 4. Reconciliar tabelas de lista
-- As tabelas 'lists' e 'list_items' antigas (do schema.sql) apontam para
-- a estrutura errada. Como nunca houve dados reais persistidos, recriamos
-- 'list_items' ligado a 'user_lists' (criado na migração 004).
-- ============================================================
DROP TABLE IF EXISTS list_items CASCADE;
DROP TABLE IF EXISTS lists CASCADE;

CREATE TABLE list_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id         UUID NOT NULL REFERENCES user_lists(id) ON DELETE CASCADE,
  media_item_id   UUID REFERENCES media_items(id),
  -- display denormalizado (para não precisar de join)
  title           TEXT NOT NULL,
  cover_url       TEXT,
  kind            TEXT NOT NULL DEFAULT 'game',
  platform        TEXT,
  release_year    INT,
  genre           TEXT,
  subgenre        TEXT,
  developer       TEXT,
  hltb_main       NUMERIC,
  hltb_completionist NUMERIC,
  author          TEXT,
  publisher       TEXT,
  volumes         TEXT,
  duration        TEXT,
  director        TEXT,
  where_to_watch  TEXT,
  available_platforms TEXT[],
  -- estado específico da lista
  role            TEXT DEFAULT 'principal',
  position        INT DEFAULT 0,
  status          TEXT DEFAULT 'quero',
  classification  TEXT,
  canonical       BOOLEAN,
  consumed        BOOLEAN DEFAULT false,
  note            TEXT,
  obtained        BOOLEAN DEFAULT false,
  runs            BOOLEAN,
  price           NUMERIC,
  start_date      DATE,
  done_date       DATE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Items de listas públicas visíveis"
  ON list_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_lists l
      WHERE l.id = list_id
        AND (l.visibility = 'public' OR l.owner_id = auth.uid())
    )
  );

CREATE POLICY "Dono gerencia items"
  ON list_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_lists l
      WHERE l.id = list_id AND l.owner_id = auth.uid()
    )
  );
