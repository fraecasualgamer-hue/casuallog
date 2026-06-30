import { supabase, getSupabase } from './supabase'
import type { BacklogItem, Status, Tier } from '../data/mock'

// Mapeia uma linha de progress + media_items (join) para BacklogItem
function rowToItem(row: any): BacklogItem {
  const m = row.media_items
  return {
    id: m.id,
    source: m.source ?? undefined,
    sourceId: m.source_id ?? undefined,
    title: m.title,
    coverUrl: m.cover_url ?? '',
    kind: m.kind,
    platform: row.platform ?? m.platform ?? undefined,
    releaseYear: m.release_year ?? undefined,
    developer: m.developer ?? undefined,
    price: m.price ?? undefined,
    genre: m.genre ?? undefined,
    subgenre: m.subgenre ?? undefined,
    availablePlatforms: m.available_platforms ?? undefined,
    hltbMain: m.hltb_main ?? undefined,
    hltbCompletionist: m.hltb_completionist ?? undefined,
    director: m.director ?? undefined,
    duration: m.duration ?? undefined,
    whereToWatch: m.where_to_watch ?? undefined,
    author: m.author ?? undefined,
    volumes: m.volumes ?? undefined,
    publisher: m.publisher ?? undefined,
    synopsis: m.synopsis ?? undefined,
    runs: row.runs ?? undefined,
    obtained: row.obtained ?? undefined,
    status: row.status as Status,
    tier: (row.tier as Tier) ?? null,
    seals: row.seals ?? [],
    review: row.review ?? '',
  }
}

export async function fetchUserBacklog(userId: string): Promise<BacklogItem[]> {
  const { data, error } = await supabase
    .from('progress')
    .select(`*, media_items (*)`)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar backlog:', error)
    return []
  }
  return (data ?? []).filter((r: any) => r.media_items).map(rowToItem)
}

// Grava a obra (media_items) com todos os campos intrínsecos e devolve o uuid
export async function upsertMediaItem(
  source: string,
  sourceId: string,
  item: BacklogItem,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('media_items')
    .upsert(
      {
        source,
        source_id: sourceId,
        kind: item.kind,
        title: item.title,
        cover_url: item.coverUrl || null,
        release_year: item.releaseYear ?? null,
        platform: item.platform ?? null,
        developer: item.developer ?? null,
        price: item.price ?? null,
        genre: item.genre ?? null,
        subgenre: item.subgenre ?? null,
        available_platforms: item.availablePlatforms ?? null,
        hltb_main: item.hltbMain ?? null,
        hltb_completionist: item.hltbCompletionist ?? null,
        director: item.director ?? null,
        duration: item.duration ?? null,
        where_to_watch: item.whereToWatch ?? null,
        author: item.author ?? null,
        volumes: item.volumes ?? null,
        publisher: item.publisher ?? null,
        synopsis: item.synopsis ?? null,
        cached_at: new Date().toISOString(),
      },
      { onConflict: 'source,source_id' },
    )
    .select('id')
    .single()

  if (error) {
    console.error('Erro ao salvar media_item:', error)
    return null
  }
  return data?.id ?? null
}

// Grava o progresso do usuário (campos pessoais)
export async function upsertProgress(
  userId: string,
  mediaItemId: string,
  fields: Partial<BacklogItem>,
) {
  const payload: any = {
    user_id: userId,
    media_item_id: mediaItemId,
    updated_at: new Date().toISOString(),
  }
  if (fields.status !== undefined) payload.status = fields.status
  if (fields.tier !== undefined) payload.tier = fields.tier
  if (fields.seals !== undefined) payload.seals = fields.seals
  if (fields.review !== undefined) payload.review = fields.review
  if (fields.obtained !== undefined) payload.obtained = fields.obtained
  if (fields.runs !== undefined) payload.runs = fields.runs
  if (fields.platform !== undefined) payload.platform = fields.platform

  const { error } = await supabase
    .from('progress')
    .upsert(payload, { onConflict: 'user_id,media_item_id' })

  if (error) console.error('Erro ao salvar progresso:', error)
}

// Atualiza campos intrínsecos da obra (ex: usuário edita preço/gênero manualmente)
export async function updateMediaFields(mediaItemId: string, fields: Partial<BacklogItem>) {
  const payload: any = {}
  if (fields.platform !== undefined) payload.platform = fields.platform
  if (fields.developer !== undefined) payload.developer = fields.developer
  if (fields.price !== undefined) payload.price = fields.price
  if (fields.genre !== undefined) payload.genre = fields.genre
  if (fields.subgenre !== undefined) payload.subgenre = fields.subgenre
  if (fields.whereToWatch !== undefined) payload.where_to_watch = fields.whereToWatch
  if (Object.keys(payload).length === 0) return
  const { error } = await supabase.from('media_items').update(payload).eq('id', mediaItemId)
  if (error) console.error('Erro ao atualizar media_item:', error)
}

// Adiciona obra ao backlog (cria media_item + progress). Devolve o uuid real.
export async function addToBacklog(
  userId: string,
  item: BacklogItem,
  source: string,
  sourceId: string,
): Promise<string | null> {
  const mediaId = await upsertMediaItem(source, sourceId, item)
  if (!mediaId) return null
  await upsertProgress(userId, mediaId, {
    status: item.status,
    tier: item.tier,
    seals: item.seals,
    review: item.review,
    obtained: item.obtained,
    runs: item.runs,
    platform: item.platform,
  })
  return mediaId
}

export async function refreshMediaItem(item: BacklogItem): Promise<Partial<BacklogItem> | null> {
  if (!item.source || !item.sourceId) return null
  try {
    const sb = getSupabase()
    const source = item.source as 'igdb' | 'tmdb' | 'anilist' | 'books'
    const sourceMap: Record<string, string> = {
      igdb: 'igdb', tmdb: 'tmdb', anilist: 'anilist', books: 'books',
    }
    const { data, error } = await sb.functions.invoke('search-media', {
      body: { query: item.title, sources: [sourceMap[source]] },
    })
    if (error || !Array.isArray(data)) return null

    const match = data.find((r: any) => String(r.sourceId) === String(item.sourceId))
    if (!match) return null

    const updates: any = {
      genre: match.genre ?? null,
      subgenre: match.subgenre ?? null,
      developer: match.developer ?? null,
      director: match.director ?? null,
      duration: match.duration ?? null,
      where_to_watch: match.whereToWatch ?? null,
      author: match.author ?? null,
      publisher: match.publisher ?? null,
      volumes: match.volumes ?? null,
      synopsis: match.synopsis ?? null,
      available_platforms: match.availablePlatforms ?? null,
      cached_at: new Date().toISOString(),
    }
    await sb.from('media_items').update(updates).eq('id', item.id)

    return {
      genre: match.genre ?? undefined,
      subgenre: match.subgenre ?? undefined,
      developer: match.developer ?? undefined,
      director: match.director ?? undefined,
      duration: match.duration ?? undefined,
      whereToWatch: match.whereToWatch ?? undefined,
      author: match.author ?? undefined,
      publisher: match.publisher ?? undefined,
      volumes: match.volumes ?? undefined,
      synopsis: match.synopsis ?? undefined,
      availablePlatforms: match.availablePlatforms ?? undefined,
    }
  } catch {
    return null
  }
}

export async function removeFromBacklog(userId: string, mediaItemId: string) {
  const { error } = await supabase
    .from('progress')
    .delete()
    .eq('user_id', userId)
    .eq('media_item_id', mediaItemId)
  if (error) console.error('Erro ao remover do backlog:', error)
}
