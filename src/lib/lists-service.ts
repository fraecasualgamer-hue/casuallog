import { supabase } from './supabase'
import type { UserList, ListItem, ListType, ListStatus } from '../data/list-rules'

function rowToListItem(r: any): ListItem {
  return {
    id: r.id,
    mediaItemId: r.media_item_id ?? r.id,
    title: r.title,
    coverUrl: r.cover_url ?? '',
    kind: r.kind,
    platform: r.platform ?? undefined,
    role: r.role,
    classification: r.classification ?? null,
    obtained: r.obtained ?? false,
    runs: r.runs ?? null,
    status: r.status ?? 'quero',
    price: r.price ?? null,
    releaseYear: r.release_year ?? undefined,
    developer: r.developer ?? undefined,
    genre: r.genre ?? undefined,
    subgenre: r.subgenre ?? undefined,
    availablePlatforms: r.available_platforms ?? undefined,
    hltbMain: r.hltb_main ?? undefined,
    hltbCompletionist: r.hltb_completionist ?? undefined,
    canonical: r.canonical ?? undefined,
    consumed: r.consumed ?? undefined,
    startDate: r.start_date ?? undefined,
    doneDate: r.done_date ?? undefined,
    position: r.position ?? 0,
    note: r.note ?? undefined,
  }
}

function rowToList(r: any): UserList {
  return {
    id: r.id,
    ownerId: r.owner_id,
    type: r.type as ListType,
    title: r.title,
    description: r.description ?? '',
    theme: r.theme ?? '',
    visibility: r.visibility,
    coverUrl: r.cover_url ?? undefined,
    likeCount: r.like_count ?? 0,
    items: (r.list_items ?? []).map(rowToListItem).sort((a: ListItem, b: ListItem) => a.position - b.position),
    status: (r.status ?? 'building') as ListStatus,
    startedAt: r.started_at ?? undefined,
    completedAt: r.completed_at ?? undefined,
    pausedAt: r.paused_at ?? undefined,
    totalTimeMs: r.total_time_ms ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

export async function fetchUserLists(userId: string): Promise<UserList[]> {
  const { data, error } = await supabase
    .from('user_lists')
    .select('*, list_items(*)')
    .eq('owner_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar listas:', error)
    return []
  }
  return (data ?? []).map(rowToList)
}

export async function createList(userId: string, list: Omit<UserList, 'id' | 'ownerId' | 'items' | 'createdAt' | 'updatedAt'>): Promise<UserList | null> {
  const { data, error } = await supabase
    .from('user_lists')
    .insert({
      owner_id: userId,
      type: list.type,
      title: list.title,
      description: list.description,
      theme: list.theme,
      visibility: list.visibility,
      cover_url: list.coverUrl ?? null,
      like_count: list.likeCount ?? 0,
      status: list.status ?? 'building',
    })
    .select('*, list_items(*)')
    .single()

  if (error) {
    console.error('Erro ao criar lista:', error)
    return null
  }
  return rowToList(data)
}

export async function updateListRemote(listId: string, updates: Partial<UserList>) {
  const payload: any = { updated_at: new Date().toISOString() }
  if (updates.title !== undefined) payload.title = updates.title
  if (updates.description !== undefined) payload.description = updates.description
  if (updates.theme !== undefined) payload.theme = updates.theme
  if (updates.visibility !== undefined) payload.visibility = updates.visibility
  if (updates.coverUrl !== undefined) payload.cover_url = updates.coverUrl
  if (updates.likeCount !== undefined) payload.like_count = updates.likeCount
  if (updates.status !== undefined) payload.status = updates.status
  if (updates.startedAt !== undefined) payload.started_at = updates.startedAt
  if (updates.completedAt !== undefined) payload.completed_at = updates.completedAt
  if (updates.pausedAt !== undefined) payload.paused_at = updates.pausedAt
  if (updates.totalTimeMs !== undefined) payload.total_time_ms = updates.totalTimeMs

  const { error } = await supabase.from('user_lists').update(payload).eq('id', listId)
  if (error) console.error('Erro ao atualizar lista:', error)
}

export async function deleteListRemote(listId: string) {
  const { error } = await supabase.from('user_lists').delete().eq('id', listId)
  if (error) console.error('Erro ao deletar lista:', error)
}

export async function addListItemRemote(listId: string, item: ListItem): Promise<string | null> {
  const { data, error } = await supabase
    .from('list_items')
    .insert({
      list_id: listId,
      title: item.title,
      cover_url: item.coverUrl || null,
      kind: item.kind,
      platform: item.platform ?? null,
      release_year: item.releaseYear ?? null,
      genre: item.genre ?? null,
      subgenre: item.subgenre ?? null,
      developer: item.developer ?? null,
      hltb_main: item.hltbMain ?? null,
      hltb_completionist: item.hltbCompletionist ?? null,
      role: item.role,
      position: item.position,
      status: item.status ?? 'quero',
      classification: item.classification ?? null,
      obtained: item.obtained ?? false,
      runs: item.runs ?? null,
      price: item.price ?? null,
      note: item.note ?? null,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Erro ao adicionar obra na lista:', error)
    return null
  }
  return data?.id ?? null
}

export async function removeListItemRemote(itemId: string) {
  const { error } = await supabase.from('list_items').delete().eq('id', itemId)
  if (error) console.error('Erro ao remover obra da lista:', error)
}

export async function updateListItemRemote(itemId: string, updates: Partial<ListItem>) {
  const payload: any = {}
  if (updates.status !== undefined) payload.status = updates.status
  if (updates.classification !== undefined) payload.classification = updates.classification
  if (updates.obtained !== undefined) payload.obtained = updates.obtained
  if (updates.runs !== undefined) payload.runs = updates.runs
  if (updates.note !== undefined) payload.note = updates.note
  if (updates.canonical !== undefined) payload.canonical = updates.canonical
  if (updates.consumed !== undefined) payload.consumed = updates.consumed
  if (updates.startDate !== undefined) payload.start_date = updates.startDate || null
  if (updates.doneDate !== undefined) payload.done_date = updates.doneDate || null
  if (updates.price !== undefined) payload.price = updates.price
  if (updates.releaseYear !== undefined) payload.release_year = updates.releaseYear
  if (updates.position !== undefined) payload.position = updates.position
  if (updates.role !== undefined) payload.role = updates.role

  if (Object.keys(payload).length === 0) return
  const { error } = await supabase.from('list_items').update(payload).eq('id', itemId)
  if (error) console.error('Erro ao atualizar obra da lista:', error)
}

export async function reorderListItemsRemote(items: ListItem[]) {
  await Promise.all(
    items.map((item, idx) =>
      supabase.from('list_items').update({ position: idx }).eq('id', item.id),
    ),
  )
}
