-- CasualLog — Migração 006: política de UPDATE faltando em media_items
-- Sem isso, o upsert (insert ... on conflict do update) falha silenciosamente
-- sempre que a obra já existe na tabela (RLS bloqueia o UPDATE).

DROP POLICY IF EXISTS "Usuário autenticado atualiza media_items" ON media_items;

CREATE POLICY "Usuário autenticado atualiza media_items"
  ON media_items FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
