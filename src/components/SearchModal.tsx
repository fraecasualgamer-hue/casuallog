import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, X, Plus, Gamepad2, Film, BookOpen, Tv, Loader2 } from 'lucide-react'
import type { BacklogItem, MediaKind } from '../data/mock'
import { searchMedia, type SearchResult } from '../lib/search-service'

const KIND_ICON: Record<string, typeof Gamepad2> = {
  game: Gamepad2,
  movie: Film,
  series: Tv,
  anime: Tv,
  manga: BookOpen,
  book: BookOpen,
}

interface Props {
  onClose: () => void
  onAdd: (item: BacklogItem) => void
  existingIds: Set<string>
}

export default function SearchModal({ onClose, onAdd, existingIds }: Props) {
  const [query, setQuery] = useState('')
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [apiResults, setApiResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setApiResults([])
      setSearched(false)
      return
    }
    setSearching(true)
    const results = await searchMedia(q)
    setApiResults(results)
    setSearched(true)
    setSearching(false)
  }, [])

  function handleQueryChange(value: string) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(value), 400)
  }

  const displayResults = apiResults.map((r) => ({
    id: `${r.source}-${r.sourceId}`,
    title: r.title,
    coverUrl: r.coverUrl ?? '',
    kind: r.kind,
    platform: r.platform ?? undefined,
    releaseYear: r.releaseYear ?? undefined,
    genre: r.genre,
    author: r.author,
    director: r.director,
    publisher: r.publisher,
    volumes: r.volumes,
    duration: r.duration,
    developer: r.developer,
    availablePlatforms: r.availablePlatforms,
    synopsis: r.synopsis,
  }))

  function handleAdd(item: typeof displayResults[0]) {
    const newItem: BacklogItem = {
      id: item.id,
      title: item.title,
      coverUrl: item.coverUrl,
      kind: item.kind as MediaKind,
      platform: item.platform,
      releaseYear: item.releaseYear,
      genre: item.genre ?? undefined,
      author: item.author ?? undefined,
      director: item.director ?? undefined,
      publisher: item.publisher ?? undefined,
      volumes: item.volumes ?? undefined,
      duration: item.duration ?? undefined,
      developer: item.developer ?? undefined,
      availablePlatforms: item.availablePlatforms,
      synopsis: item.synopsis ?? undefined,
      status: 'quero',
      tier: null,
      seals: [],
    }
    onAdd(newItem)
    setAddedIds((prev) => new Set(prev).add(item.id))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-bg-0/85 backdrop-blur-md animate-backdrop" />
      <div
        className="relative w-full max-w-lg bg-bg-1 border border-bg-2 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 border-b border-bg-2">
          {searching ? (
            <Loader2 size={16} className="text-accent-2 animate-spin shrink-0" />
          ) : (
            <Search size={16} className="text-text-2 shrink-0" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Buscar jogo, filme, série, mangá..."
            className="flex-1 bg-transparent py-4 text-sm text-text-0 placeholder:text-text-2 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-text-2 hover:text-text-0 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto">
          {query.length < 2 ? (
            <div className="py-12 text-center px-6">
              <Search size={20} className="text-text-2 mx-auto mb-3" />
              <p className="text-sm text-text-2">
                Digite ao menos 2 letras para buscar jogos, filmes, séries, animes, mangás ou livros.
              </p>
            </div>
          ) : searched && displayResults.length === 0 && !searching ? (
            <div className="py-12 text-center px-6">
              <p className="text-sm text-text-2">
                Nenhum resultado para "{query}"
              </p>
            </div>
          ) : (
            <div className="py-2">
              {displayResults.length > 0 && (
                <p className="px-4 py-2 text-[10px] uppercase tracking-[0.1em] text-accent-2">
                  Resultados
                </p>
              )}
              {displayResults.map((item) => {
                const Icon = KIND_ICON[item.kind] ?? Gamepad2
                const alreadyInBacklog = existingIds.has(item.id) || addedIds.has(item.id)
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-bg-2/40 transition-colors"
                  >
                    <div className="w-8 h-11 rounded-[4px] overflow-hidden bg-bg-2 shrink-0">
                      {item.coverUrl ? (
                        <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon size={14} className="text-text-2" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-0 truncate">{item.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Icon size={10} className="text-text-2" />
                        <span className="text-[10px] text-text-2/70">
                          {{ game: 'Game', movie: 'Filme', series: 'Série', anime: 'Anime', manga: 'Mangá', book: 'Livro' }[item.kind] ?? item.kind}
                        </span>
                        {(item.kind === 'book' || item.kind === 'manga') && item.author && (
                          <span className="text-[10px] text-text-2">· {item.author}</span>
                        )}
                        {item.platform && (
                          <span className="text-[10px] font-mono text-text-2">· {item.platform}</span>
                        )}
                        {item.releaseYear && (
                          <span className="text-[10px] text-text-2">· {item.releaseYear}</span>
                        )}
                      </div>
                    </div>
                    {alreadyInBacklog ? (
                      <span className="text-[11px] text-text-2 px-2.5 py-1.5">No backlog</span>
                    ) : (
                      <button
                        onClick={() => handleAdd(item)}
                        className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-full bg-accent/15 text-accent-2 hover:bg-accent/25 transition-colors"
                      >
                        <Plus size={12} />
                        Adicionar
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-bg-2 text-[10px] text-text-2 flex items-center gap-3">
          <kbd className="font-mono px-1.5 py-0.5 rounded bg-bg-0 border border-bg-2">esc</kbd>
          <span>para fechar</span>
        </div>
      </div>
    </div>
  )
}
