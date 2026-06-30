import { useState, useEffect, useCallback } from 'react'
import { LayoutGrid, List, Plus, Gamepad2, Film, BookOpen, Tv, Clapperboard, Joystick, ArrowUpDown, Search, X } from 'lucide-react'
import TopBar from '../components/TopBar'
import { GameCardGrid, GameCardListGame, GameCardListAudio, GameCardListRead } from '../components/GameCard'
import GameDetailModal from '../components/GameDetailModal'
import SearchModal from '../components/SearchModal'
import { useBacklog } from '../context/BacklogContext'
import { type Status, type BacklogItem, type MediaKind } from '../data/mock'

type ViewMode = 'grid' | 'list'
type Category = 'games' | 'audiovisual' | 'leitura'
type SubFilter = 'all' | 'modern' | 'retro' | MediaKind
type SortField = 'title' | 'releaseYear' | 'price' | 'hltbMain' | 'status' | 'tier'
type SortDir = 'asc' | 'desc'

const SORT_OPTIONS: { key: SortField; label: string }[] = [
  { key: 'title', label: 'Nome' },
  { key: 'releaseYear', label: 'Lançamento' },
  { key: 'price', label: 'Preço' },
  { key: 'hltbMain', label: 'Tempo' },
  { key: 'status', label: 'Status' },
  { key: 'tier', label: 'Avaliação' },
]

const STATUS_ORDER: Record<string, number> = {
  jogando: 0, quero: 1, pausado: 2, zerado: 3, na_estante: 4, abandonado: 5,
}

function sortItems(items: BacklogItem[], field: SortField, dir: SortDir): BacklogItem[] {
  const sorted = [...items].sort((a, b) => {
    let cmp = 0
    if (field === 'title') {
      cmp = a.title.localeCompare(b.title, 'pt-BR')
    } else if (field === 'releaseYear') {
      cmp = (a.releaseYear ?? 9999) - (b.releaseYear ?? 9999)
    } else if (field === 'price') {
      cmp = (a.price ?? 9999) - (b.price ?? 9999)
    } else if (field === 'hltbMain') {
      cmp = (a.hltbMain ?? 9999) - (b.hltbMain ?? 9999)
    } else if (field === 'status') {
      cmp = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99)
    } else if (field === 'tier') {
      cmp = (b.tier ?? 0) - (a.tier ?? 0)
    }
    return dir === 'desc' ? -cmp : cmp
  })
  return sorted
}

const CATEGORY_KINDS: Record<Category, MediaKind[]> = {
  games: ['game'],
  audiovisual: ['movie', 'series', 'anime'],
  leitura: ['book', 'manga'],
}

const CATEGORY_TABS: { key: Category; label: string; icon: typeof Gamepad2 }[] = [
  { key: 'games', label: 'Games', icon: Gamepad2 },
  { key: 'audiovisual', label: 'Audiovisual', icon: Film },
  { key: 'leitura', label: 'Leitura', icon: BookOpen },
]

const SUB_FILTERS: Record<Category, { key: SubFilter; label: string; icon: typeof Film }[]> = {
  games: [
    { key: 'modern', label: 'Modernos', icon: Gamepad2 },
    { key: 'retro', label: 'Retrô', icon: Joystick },
  ],
  audiovisual: [
    { key: 'movie', label: 'Filmes', icon: Clapperboard },
    { key: 'series', label: 'Séries', icon: Tv },
    { key: 'anime', label: 'Animes', icon: Film },
  ],
  leitura: [
    { key: 'book', label: 'Livros', icon: BookOpen },
    { key: 'manga', label: 'Mangás', icon: BookOpen },
  ],
}

const RETRO_CUTOFF = 2005

function applySubFilter(items: BacklogItem[], sub: SubFilter): BacklogItem[] {
  if (sub === 'all') return items
  if (sub === 'modern') return items.filter((i) => !i.releaseYear || i.releaseYear >= RETRO_CUTOFF + 1)
  if (sub === 'retro') return items.filter((i) => i.releaseYear != null && i.releaseYear <= RETRO_CUTOFF)
  return items.filter((i) => i.kind === sub)
}

function countSubFilter(items: BacklogItem[], sub: SubFilter): number {
  return applySubFilter(items, sub).length
}

const STATUS_LABELS_BY_CATEGORY: Record<Category, Record<Status, string>> = {
  games: {
    quero: 'Quero jogar',
    jogando: 'Jogando',
    pausado: 'Pausado',
    zerado: 'Zerado',
    na_estante: 'Platinado',
    abandonado: 'Abandonado',
  },
  audiovisual: {
    quero: 'Quero assistir',
    jogando: 'Assistindo',
    pausado: 'Pausado',
    zerado: 'Assistido',
    na_estante: 'Platinado',
    abandonado: 'Abandonado',
  },
  leitura: {
    quero: 'Quero ler',
    jogando: 'Lendo',
    pausado: 'Pausado',
    zerado: 'Lido',
    na_estante: 'Platinado',
    abandonado: 'Abandonado',
  },
}

const STATUS_DOT: Record<string, string> = {
  quero: 'bg-status-want',
  jogando: 'bg-status-playing',
  pausado: 'bg-status-paused',
  zerado: 'bg-status-completed',
  na_estante: 'bg-status-platinum',
  abandonado: 'bg-status-abandoned',
}

export default function BacklogPage() {
  const { items, updateItem, addItem, removeItem } = useBacklog()
  const [view, setView] = useState<ViewMode>('list')
  const [category, setCategory] = useState<Category>('games')
  const [subFilter, setSubFilter] = useState<SubFilter>('all')
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all')
  const [selectedItem, setSelectedItem] = useState<BacklogItem | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>('title')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSortMenu, setShowSortMenu] = useState(false)

  const categoryItems = items.filter((i) => CATEGORY_KINDS[category].includes(i.kind))
  const subFiltered = applySubFilter(categoryItems, subFilter)
  const statusFiltered = statusFilter === 'all'
    ? subFiltered
    : subFiltered.filter((i) => i.status === statusFilter)
  const searched = searchQuery.length >= 2
    ? statusFiltered.filter((i) => i.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : statusFiltered
  const filtered = sortItems(searched, sortField, sortDir)

  const subCounts: Record<string, number> = {}
  for (const sf of SUB_FILTERS[category]) {
    subCounts[sf.key] = countSubFilter(categoryItems, sf.key)
  }

  const statusCounts = subFiltered.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const categoryCounts: Record<Category, number> = {
    games: items.filter((i) => CATEGORY_KINDS.games.includes(i.kind)).length,
    audiovisual: items.filter((i) => CATEGORY_KINDS.audiovisual.includes(i.kind)).length,
    leitura: items.filter((i) => CATEGORY_KINDS.leitura.includes(i.kind)).length,
  }

  const statusLabels = STATUS_LABELS_BY_CATEGORY[category]

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === '/' && !showSearch && !selectedItem) {
        e.preventDefault()
        setShowSearch(true)
      }
    },
    [showSearch, selectedItem],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  function handleCategoryChange(cat: Category) {
    setCategory(cat)
    setSubFilter('all')
    setStatusFilter('all')
  }

  function handleRemove(id: string) {
    setConfirmDelete(id)
  }

  function renderListItem(item: BacklogItem, i: number) {
    const statusLabel = statusLabels[item.status]
    if (category === 'audiovisual') {
      return <GameCardListAudio item={item} index={i} statusLabel={statusLabel} onRemove={handleRemove} />
    }
    if (category === 'leitura') {
      return <GameCardListRead item={item} index={i} statusLabel={statusLabel} onRemove={handleRemove} />
    }
    return <GameCardListGame item={item} index={i} onRemove={handleRemove} />
  }

  return (
    <>
      <TopBar title="Meu backlog" onSearchClick={() => setShowSearch(true)} />
      <div className="p-8">
        {/* Abas de categoria */}
        <div className="flex items-center gap-1 mb-6 border-b border-bg-2/30">
          {CATEGORY_TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => handleCategoryChange(key)}
              className={`relative flex items-center gap-2 px-5 py-3 text-[13px] font-medium transition-all ${
                category === key ? 'text-accent-2' : 'text-text-2 hover:text-text-1'
              }`}
            >
              <Icon size={15} />
              {label}
              <span className={`text-[10px] ml-0.5 ${category === key ? 'text-accent-2/70' : 'text-text-2/50'}`}>
                {categoryCounts[key]}
              </span>
              {category === key && (
                <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent rounded-[2px] tab-neon" />
              )}
            </button>
          ))}
        </div>

        {/* Sub-filtros por tipo de mídia */}
        {SUB_FILTERS[category].length > 0 && (
          <div className="flex items-center gap-1.5 mb-5">
            <button
              onClick={() => { setSubFilter('all'); setStatusFilter('all') }}
              className={`text-[12px] font-medium px-3.5 py-1.5 rounded-[10px] border transition-all duration-200 ${
                subFilter === 'all'
                  ? 'bg-bg-2/60 text-text-0 border-bg-3'
                  : 'text-text-2 border-bg-3/50 bg-bg-1/40 hover:text-text-1 hover:border-bg-3'
              }`}
            >
              Todos
              <span className="ml-1.5 text-[10px] opacity-60">{categoryItems.length}</span>
            </button>
            {SUB_FILTERS[category].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => { setSubFilter(key); setStatusFilter('all') }}
                className={`flex items-center gap-1.5 text-[12px] font-medium px-3.5 py-1.5 rounded-[10px] border transition-all duration-200 ${
                  subFilter === key
                    ? 'bg-bg-2/60 text-text-0 border-bg-3'
                    : 'text-text-2 border-bg-3/50 bg-bg-1/40 hover:text-text-1 hover:border-bg-3'
                }`}
              >
                <Icon size={13} />
                {label}
                {subCounts[key] ? (
                  <span className="ml-1 text-[10px] opacity-60">{subCounts[key]}</span>
                ) : null}
              </button>
            ))}
          </div>
        )}

        {/* Filtros de status + controles */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setStatusFilter('all')}
              className={`text-[12px] font-medium px-3.5 py-1.5 rounded-[10px] border transition-all duration-200 ${
                statusFilter === 'all'
                  ? 'bg-accent/12 text-accent border-accent/40'
                  : 'text-text-2 border-bg-3/50 bg-bg-1/40 hover:text-text-1 hover:border-bg-3'
              }`}
              style={statusFilter === 'all' ? { boxShadow: '0 0 14px rgba(43,245,160,.14)' } : {}}
            >
              Todos
              <span className="ml-1.5 text-[10px] opacity-70">{subFiltered.length}</span>
            </button>
            {(Object.keys(statusLabels) as Status[]).filter((s) => s !== 'na_estante' || category === 'games').map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex items-center gap-1.5 text-[12px] font-medium px-3.5 py-1.5 rounded-[10px] border transition-all duration-200 ${
                  statusFilter === status
                    ? 'bg-accent/12 text-accent border-accent/40'
                    : 'text-text-2 border-bg-3/50 bg-bg-1/40 hover:text-text-1 hover:border-bg-3'
                }`}
                style={statusFilter === status ? { boxShadow: '0 0 14px rgba(43,245,160,.14)' } : {}}
              >
                <span className={`w-2 h-2 rounded-full ${STATUS_DOT[status]}`} />
                {statusLabels[status]}
                {statusCounts[status] ? (
                  <span className="ml-1 text-[10px] opacity-70">{statusCounts[status]}</span>
                ) : null}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-accent text-bg-0 text-[12px] font-display font-bold uppercase tracking-wide hover:brightness-110 transition-all duration-200 shrink-0"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 100% 45%, calc(100% - 12px) 100%, 0 100%)',
                boxShadow: '0 0 20px rgba(43,245,160,.35)',
              }}
            >
              <Plus size={13} strokeWidth={2.5} />
              Adicionar
            </button>
            <div className="flex items-center bg-bg-1/60 rounded-[10px] border border-bg-2/50 p-0.5">
              <button
                onClick={() => setView('grid')}
                className={`p-2 rounded-[8px] transition-all duration-200 ${
                  view === 'grid' ? 'bg-bg-2/80 text-text-0 shadow-sm' : 'text-text-2 hover:text-text-1'
                }`}
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2 rounded-[8px] transition-all duration-200 ${
                  view === 'list' ? 'bg-bg-2/80 text-text-0 shadow-sm' : 'text-text-2 hover:text-text-1'
                }`}
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Busca e ordenação */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-card bg-bg-1/50 border border-bg-2/40">
            <Search size={14} className="text-text-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrar por nome..."
              className="flex-1 bg-transparent text-[13px] text-text-0 placeholder:text-text-2 focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-0.5 text-text-2 hover:text-text-0 transition-colors">
                <X size={13} />
              </button>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-card bg-bg-1/50 border border-bg-2/40 text-[12px] text-text-1 hover:border-accent/30 transition-all"
            >
              <ArrowUpDown size={13} />
              {SORT_OPTIONS.find((s) => s.key === sortField)?.label}
              <span className="text-text-2/60">{sortDir === 'asc' ? '↑' : '↓'}</span>
            </button>
            {showSortMenu && (
              <div className="absolute top-full right-0 mt-1 py-1 rounded-card bg-bg-1 border border-bg-2/60 shadow-xl z-30 min-w-[150px] animate-fade-in">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      if (sortField === opt.key) {
                        setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                      } else {
                        setSortField(opt.key)
                        setSortDir('asc')
                      }
                      setShowSortMenu(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-[12px] transition-colors flex items-center justify-between ${
                      sortField === opt.key ? 'text-accent-2 font-semibold bg-accent/8' : 'text-text-1 hover:bg-bg-2/40'
                    }`}
                  >
                    {opt.label}
                    {sortField === opt.key && (
                      <span className="text-[10px] text-accent-2/70">{sortDir === 'asc' ? '↑ Cresc.' : '↓ Decresc.'}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-bg-1 border border-bg-2/50 flex items-center justify-center mb-4">
              <Plus size={20} className="text-text-2" />
            </div>
            <p className="text-text-1 text-[14px] mb-1">
              {searchQuery.length >= 2
                ? `Nenhum resultado para "${searchQuery}"`
                : statusFilter === 'all'
                  ? `Nenhuma obra de ${CATEGORY_TABS.find((t) => t.key === category)?.label.toLowerCase()} ainda.`
                  : 'Nenhuma obra com esse status.'}
            </p>
            {statusFilter === 'all' && (
              <>
                <p className="text-text-2 text-[12px] mb-5">Adicione a primeira.</p>
                <button
                  onClick={() => setShowSearch(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-card bg-accent text-bg-0 text-[13px] font-semibold hover:bg-accent-2 transition-all duration-200"
                >
                  <Plus size={14} />
                  Adicionar obra
                </button>
              </>
            )}
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {filtered.map((item, i) => (
              <div key={item.id} className="cursor-pointer" onClick={() => setSelectedItem(item)}>
                <GameCardGrid item={item} index={i} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-card bg-bg-1/20 border border-bg-2/30 divide-y divide-bg-2/15 overflow-hidden">
            {filtered.map((item, i) => (
              <div key={item.id} className="cursor-pointer" onClick={() => setSelectedItem(item)}>
                {renderListItem(item, i)}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedItem && (
        <GameDetailModal
          item={items.find((i) => i.id === selectedItem.id) || selectedItem}
          onClose={() => setSelectedItem(null)}
          onUpdate={updateItem}
        />
      )}

      {showSearch && (
        <SearchModal
          onClose={() => setShowSearch(false)}
          onAdd={(item) => addItem(item)}
          existingIds={new Set(items.map((i) => i.id))}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="absolute inset-0 bg-bg-0/85 backdrop-blur-md animate-backdrop" />
          <div className="relative bg-bg-1 border border-bg-2/60 rounded-xl p-6 max-w-sm w-full animate-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-[15px] font-semibold mb-2">Remover do backlog</h3>
            <p className="text-[13px] text-text-2 mb-5">Tem certeza que deseja remover essa obra do seu backlog?</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-card text-[12px] text-text-1 hover:bg-bg-2/30 transition-colors">
                Cancelar
              </button>
              <button onClick={() => { removeItem(confirmDelete); setConfirmDelete(null) }}
                className="px-4 py-2 rounded-card bg-status-abandoned/20 text-status-abandoned text-[12px] font-semibold hover:bg-status-abandoned/30 transition-colors">
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
