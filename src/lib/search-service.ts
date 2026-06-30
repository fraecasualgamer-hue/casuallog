import { isSupabaseConfigured, getSupabase } from './supabase'

export interface SearchResult {
  source: string
  sourceId: string
  kind: string
  title: string
  coverUrl: string | null
  releaseYear: number | null
  platform: string | null
  genre?: string | null
  author?: string | null
  director?: string | null
  publisher?: string | null
  volumes?: string | null
  duration?: string | null
  developer?: string | null
  availablePlatforms?: string[]
  synopsis?: string | null
  whereToWatch?: string | null
}

export async function searchMedia(
  query: string,
  sources?: string[],
): Promise<SearchResult[]> {
  if (!isSupabaseConfigured || query.length < 2) return []

  try {
    const supabase = getSupabase()
    const { data, error } = await supabase.functions.invoke('search-media', {
      body: { query, sources },
    })

    if (error) {
      console.warn('Edge function não disponível, usando busca local:', error)
      return []
    }

    return data as SearchResult[]
  } catch {
    return []
  }
}
