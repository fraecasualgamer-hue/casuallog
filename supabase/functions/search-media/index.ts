import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TMDB_KEY = Deno.env.get('TMDB_API_KEY') ?? ''
const IGDB_CLIENT_ID = Deno.env.get('IGDB_CLIENT_ID') ?? ''
const IGDB_TOKEN = Deno.env.get('IGDB_TOKEN') ?? ''
const GOOGLE_BOOKS_KEY = Deno.env.get('GOOGLE_BOOKS_API_KEY') ?? ''

interface SearchResult {
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
  _pop?: number // popularidade interna para ordenação, removido antes de retornar
}

// Categorias IGDB: 0=jogo principal, 8=remake, 9=remaster, 10=versão expandida,
// 11=porte — essas vêm primeiro. Edições/DLCs/updates (1,2,3,4,14...) ficam depois.
const IGDB_CATEGORY_PRIORITY = new Set([0, 8, 9, 10, 11])

async function searchIGDB(query: string): Promise<SearchResult[]> {
  if (!IGDB_CLIENT_ID || !IGDB_TOKEN) return []
  try {
    const res = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': IGDB_CLIENT_ID,
        Authorization: `Bearer ${IGDB_TOKEN}`,
        'Content-Type': 'text/plain',
      },
      body: `search "${query}"; fields name,cover.image_id,first_release_date,platforms.abbreviation,genres.name,involved_companies.company.name,involved_companies.developer,category,rating_count,summary; limit 15;`,
    })
    const data = await res.json()
    if (!Array.isArray(data)) return []

    const mapped = data.map((g: any) => {
      const developer = g.involved_companies?.find((c: any) => c.developer)?.company?.name
        ?? g.involved_companies?.[0]?.company?.name
        ?? null
      const platforms: string[] = (g.platforms ?? []).map((p: any) => p.abbreviation).filter(Boolean)
      const preferred = platforms.find((p) => p === 'PC') ?? platforms[0] ?? null
      return {
        category: g.category as number,
        pop: (IGDB_CATEGORY_PRIORITY.has(g.category) ? 10000 : 0) + (g.rating_count ?? 0),
        result: {
          source: 'igdb',
          sourceId: String(g.id),
          kind: 'game',
          title: g.name,
          coverUrl: g.cover?.image_id
            ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${g.cover.image_id}.webp`
            : null,
          releaseYear: g.first_release_date
            ? new Date(g.first_release_date * 1000).getFullYear()
            : null,
          platform: preferred,
          genre: g.genres?.[0]?.name ?? null,
          developer,
          availablePlatforms: platforms.length > 0 ? platforms : undefined,
          synopsis: g.summary ? g.summary.slice(0, 300) : null,
          _pop: (IGDB_CATEGORY_PRIORITY.has(g.category) ? 10000 : 0) + (g.rating_count ?? 0),
        } as SearchResult,
      }
    })

    mapped.sort((a, b) => b.pop - a.pop)

    return mapped.slice(0, 8).map((m) => m.result)
  } catch {
    return []
  }
}

const TMDB_GENRES: Record<number, string> = {
  28: 'Ação', 12: 'Aventura', 16: 'Animação', 35: 'Comédia', 80: 'Crime',
  99: 'Documentário', 18: 'Drama', 10751: 'Família', 14: 'Fantasia', 36: 'História',
  27: 'Terror', 10402: 'Música', 9648: 'Mistério', 10749: 'Romance',
  878: 'Ficção Científica', 10770: 'Cinema TV', 53: 'Thriller', 10752: 'Guerra', 37: 'Faroeste',
  10759: 'Ação e Aventura', 10762: 'Infantil', 10763: 'Notícias', 10764: 'Reality',
  10765: 'Ficção Científica e Fantasia', 10766: 'Novela', 10767: 'Talk Show', 10768: 'Guerra e Política',
}

async function searchTMDB(query: string): Promise<SearchResult[]> {
  if (!TMDB_KEY) return []
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&language=pt-BR&page=1`,
    )
    const data = await res.json()
    return (data.results ?? [])
      .filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv')
      .slice(0, 6)
      .map((r: any) => ({
        source: 'tmdb',
        sourceId: String(r.id),
        kind: r.media_type === 'movie' ? 'movie' : 'series',
        title: r.title ?? r.name,
        coverUrl: r.poster_path
          ? `https://image.tmdb.org/t/p/w300${r.poster_path}`
          : null,
        releaseYear: (r.release_date ?? r.first_air_date)
          ? parseInt((r.release_date ?? r.first_air_date).substring(0, 4))
          : null,
        genre: r.genre_ids?.[0] ? TMDB_GENRES[r.genre_ids[0]] ?? null : null,
        platform: null,
        synopsis: r.overview ? r.overview.slice(0, 300) : null,
        _pop: r.popularity ?? 0,
      }))
  } catch {
    return []
  }
}

async function searchAniList(query: string): Promise<SearchResult[]> {
  try {
    const gql = {
      query: `query ($search: String) {
        Page(perPage: 6) {
          media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
            id title { romaji } coverImage { large } startDate { year } format episodes genres popularity description
            studios(isMain: true) { nodes { name } }
          }
        }
      }`,
      variables: { search: query },
    }
    const gqlManga = {
      query: `query ($search: String) {
        Page(perPage: 4) {
          media(search: $search, type: MANGA, sort: POPULARITY_DESC) {
            id title { romaji } coverImage { large } startDate { year } format volumes chapters genres popularity description
            staff(perPage: 1, sort: RELEVANCE) { edges { node { name { full } } } }
          }
        }
      }`,
      variables: { search: query },
    }
    const [animeRes, mangaRes] = await Promise.all([
      fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gql),
      }),
      fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gqlManga),
      }),
    ])
    const animeData = await animeRes.json()
    const mangaData = await mangaRes.json()
    const anime = (animeData.data?.Page?.media ?? []).map((m: any, i: number) => ({
      source: 'anilist',
      sourceId: String(m.id),
      kind: 'anime',
      title: m.title.romaji,
      coverUrl: m.coverImage?.large ?? null,
      releaseYear: m.startDate?.year ?? null,
      platform: null,
      genre: m.genres?.[0] ?? null,
      director: m.studios?.nodes?.[0]?.name ?? null,
      duration: m.episodes ? `${m.episodes} episódios` : null,
      synopsis: m.description ? m.description.replace(/<[^>]*>/g, '').slice(0, 300) : null,
      _pop: m.popularity ?? (1000 - i * 100),
    }))
    const manga = (mangaData.data?.Page?.media ?? []).map((m: any, i: number) => ({
      source: 'anilist',
      sourceId: String(m.id),
      kind: 'manga',
      title: m.title.romaji,
      coverUrl: m.coverImage?.large ?? null,
      releaseYear: m.startDate?.year ?? null,
      platform: null,
      genre: m.genres?.[0] ?? null,
      author: m.staff?.edges?.[0]?.node?.name?.full ?? null,
      volumes: m.volumes ? `${m.volumes} volumes` : m.chapters ? `${m.chapters} capítulos` : null,
      synopsis: m.description ? m.description.replace(/<[^>]*>/g, '').slice(0, 300) : null,
      _pop: m.popularity ?? (1000 - i * 100),
    }))
    return [...anime, ...manga]
  } catch {
    return []
  }
}

async function searchBooks(query: string): Promise<SearchResult[]> {
  try {
    const keyParam = GOOGLE_BOOKS_KEY ? `&key=${GOOGLE_BOOKS_KEY}` : ''
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=40&orderBy=relevance${keyParam}`,
    )
    const data = await res.json()
    const seenTitles = new Set<string>()
    const results: SearchResult[] = []

    for (const b of data.items ?? []) {
      if (!b.volumeInfo?.title) continue

      const normalizedTitle = b.volumeInfo.title.toLowerCase().trim()
      if (seenTitles.has(normalizedTitle)) continue
      seenTitles.add(normalizedTitle)

      const cover = b.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:')
        ?? b.volumeInfo.imageLinks?.smallThumbnail?.replace('http:', 'https:')
        ?? null

      results.push({
        source: 'books',
        sourceId: b.id,
        kind: 'book',
        title: b.volumeInfo.title,
        coverUrl: cover,
        releaseYear: b.volumeInfo.publishedDate
          ? parseInt(b.volumeInfo.publishedDate.substring(0, 4))
          : null,
        platform: null,
        author: b.volumeInfo.authors?.[0] ?? null,
        publisher: b.volumeInfo.publisher ?? null,
        genre: b.volumeInfo.categories?.[0] ?? null,
        volumes: b.volumeInfo.pageCount ? `${b.volumeInfo.pageCount} páginas` : null,
        synopsis: b.volumeInfo.description ? b.volumeInfo.description.replace(/<[^>]*>/g, '').slice(0, 300) : null,
        _pop: 1000 - results.length * 100,
      })

      if (results.length >= 8) break
    }

    return results
  } catch {
    return []
  }
}

async function translateToPtBR(text: string): Promise<string> {
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|pt-BR`,
    )
    const data = await res.json()
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText
    }
    return text
  } catch {
    return text
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    const { query, sources } = await req.json()
    if (!query || query.length < 2) {
      return new Response(JSON.stringify([]), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const enabledSources: string[] = sources ?? ['igdb', 'tmdb', 'anilist', 'books']
    const searches: Promise<SearchResult[]>[] = []

    if (enabledSources.includes('igdb')) searches.push(searchIGDB(query))
    if (enabledSources.includes('tmdb')) searches.push(searchTMDB(query))
    if (enabledSources.includes('anilist')) searches.push(searchAniList(query))
    if (enabledSources.includes('books')) searches.push(searchBooks(query))

    const raw = (await Promise.all(searches)).flat()

    // Traduz sinopses de IGDB e AniList para pt-BR em paralelo
    await Promise.all(
      raw.map(async (r) => {
        if (r.synopsis && (r.source === 'igdb' || r.source === 'anilist')) {
          r.synopsis = await translateToPtBR(r.synopsis)
        }
      }),
    )

    // Ordena por relevância ao título (primário) e popularidade (desempate)
    const q = query.toLowerCase()
    const titleScore = (title: string) => {
      const t = title.toLowerCase()
      if (t === q) return 4
      if (t.startsWith(q)) return 3
      const words = q.split(/\s+/)
      if (words.every((w) => t.includes(w))) return 2
      if (t.includes(q)) return 1
      return 0
    }
    raw.sort((a, b) => {
      const ts = titleScore(b.title) - titleScore(a.title)
      if (ts !== 0) return ts
      return (b._pop ?? 0) - (a._pop ?? 0)
    })

    // Remove campo interno antes de retornar
    const results = raw.map(({ _pop, ...r }) => r)

    return new Response(JSON.stringify(results), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }
})
