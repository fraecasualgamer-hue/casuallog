import { useState } from 'react'
import { ArrowRight, Gamepad2, Film, BookOpen, Trophy, Flame, Clock, Target, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import TopBar from '../components/TopBar'
import GameDetailModal from '../components/GameDetailModal'
import SearchModal from '../components/SearchModal'
import { useBacklog } from '../context/BacklogContext'
import { useAuth } from '../context/AuthContext'
import { useLists } from '../context/ListsContext'
import { STATUS_LABELS, type BacklogItem } from '../data/mock'

export default function HomePage() {
  const { items, updateItem, addItem } = useBacklog()
  const { profile } = useAuth()
  const { lists } = useLists()
  const [selectedItem, setSelectedItem] = useState<BacklogItem | null>(null)
  const [showSearch, setShowSearch] = useState(false)

  const games = items.filter((i) => i.kind === 'game')
  const audiovisual = items.filter((i) => ['movie', 'series', 'anime'].includes(i.kind))
  const leitura = items.filter((i) => ['book', 'manga'].includes(i.kind))

  const playingGames = games.filter((i) => i.status === 'jogando')
  const watchingNow = audiovisual.filter((i) => i.status === 'jogando')
  const readingNow = leitura.filter((i) => i.status === 'jogando')

  const completedGames = games.filter((i) => i.status === 'zerado' || i.status === 'na_estante')
  const totalHltb = playingGames.reduce((sum, g) => sum + (g.hltbMain ?? 0), 0)

  const activeLists = lists.filter((l) => l.status === 'active')
  const recentCompleted = items.filter((i) => i.status === 'zerado' || i.status === 'na_estante').slice(0, 6)

  const tieredItems = items.filter((i) => i.tier !== null)
  const avgTier = tieredItems.length > 0
    ? tieredItems.reduce((sum, i) => sum + (i.tier || 0), 0) / tieredItems.length
    : 0

  return (
    <>
      <TopBar title="Início" onSearchClick={() => setShowSearch(true)} />
      <div className="p-8 space-y-8">

        {/* Hero — saudação + stats rápidos */}
        <div className="animate-fade-in">
          <h3 className="font-display text-[26px] font-bold tracking-tight mb-1 leading-tight">
            Bom te ver de volta{profile?.display_name ? `, ${profile.display_name.split(' ')[0]}` : ''}.
          </h3>
          <p className="text-text-2 text-[13px] mb-5">Sua jornada continua no seu tempo.</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-card bg-bg-1/50 border border-bg-2/40">
              <div className="flex items-center gap-2 mb-2">
                <Gamepad2 size={14} className="text-accent-2" />
                <span className="text-[10px] uppercase tracking-[0.1em] text-text-2">Games</span>
              </div>
              <p className="text-[22px] font-bold">{games.length}</p>
              <p className="text-[10px] text-text-2">{completedGames.length} concluídos</p>
            </div>
            <div className="p-4 rounded-card bg-bg-1/50 border border-bg-2/40">
              <div className="flex items-center gap-2 mb-2">
                <Film size={14} className="text-accent-2" />
                <span className="text-[10px] uppercase tracking-[0.1em] text-text-2">Audiovisual</span>
              </div>
              <p className="text-[22px] font-bold">{audiovisual.length}</p>
              <p className="text-[10px] text-text-2">{audiovisual.filter((i) => i.status === 'zerado').length} assistidos</p>
            </div>
            <div className="p-4 rounded-card bg-bg-1/50 border border-bg-2/40">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={14} className="text-accent-2" />
                <span className="text-[10px] uppercase tracking-[0.1em] text-text-2">Leitura</span>
              </div>
              <p className="text-[22px] font-bold">{leitura.length}</p>
              <p className="text-[10px] text-text-2">{leitura.filter((i) => i.status === 'zerado').length} lidos</p>
            </div>
            <div className="p-4 rounded-card bg-bg-1/50 border border-bg-2/40">
              <div className="flex items-center gap-2 mb-2">
                <Trophy size={14} className="text-accent-2" />
                <span className="text-[10px] uppercase tracking-[0.1em] text-text-2">Média</span>
              </div>
              <p className="text-[14px] font-bold" style={{ color: avgTier > 0 ? '#FFE600' : undefined }}>
                {avgTier > 0
                  ? `★ ${avgTier.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
                  : '—'}
              </p>
              <p className="text-[10px] text-text-2">{tieredItems.length} avaliados</p>
            </div>
          </div>
        </div>

        {/* Seção principal — 2 colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Coluna esquerda — atividade atual (2/3) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Jogando agora — cards compactos horizontais */}
            {playingGames.length > 0 && (
              <section className="animate-fade-in stagger-1">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="flex items-center gap-2 text-[11px] font-semibold uppercase text-text-2 tracking-[0.12em]">
                    <Flame size={13} className="text-status-playing" /> Jogando agora
                  </h4>
                  <Link to="/backlog" className="text-[11px] text-accent-2/60 hover:text-accent-2 flex items-center gap-1 transition-colors">
                    Ver backlog <ArrowRight size={11} />
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {playingGames.slice(0, 4).map((item, i) => (
                    <div key={item.id}
                      className="flex items-center gap-3 p-3 rounded-card bg-bg-1/50 border border-bg-2/40 hover:border-status-playing/20 cursor-pointer transition-all animate-fade-in"
                      style={{ animationDelay: `${i * 0.05}s` }}
                      onClick={() => setSelectedItem(item)}>
                      <div className="w-10 h-14 rounded-[6px] overflow-hidden bg-bg-2 shrink-0 ring-1 ring-white/[0.04]">
                        <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold truncate">{item.title}</p>
                        <p className="text-[10px] text-text-2/60 font-mono">{item.platform}</p>
                        {item.hltbMain && <p className="text-[9px] text-text-2/50 mt-0.5">~{item.hltbMain}h para zerar</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Assistindo / Lendo — compacto lado a lado */}
            {(watchingNow.length > 0 || readingNow.length > 0) && (
              <div className="grid grid-cols-2 gap-4 animate-fade-in stagger-2">
                {watchingNow.length > 0 && (
                  <section>
                    <h4 className="flex items-center gap-2 text-[11px] font-semibold uppercase text-text-2 tracking-[0.12em] mb-3">
                      <Film size={12} className="text-status-playing" /> Assistindo
                    </h4>
                    <div className="space-y-2">
                      {watchingNow.slice(0, 3).map((item) => (
                        <div key={item.id}
                          className="flex items-center gap-2.5 p-2.5 rounded-[10px] bg-bg-1/40 border border-bg-2/30 hover:border-bg-2/50 cursor-pointer transition-all"
                          onClick={() => setSelectedItem(item)}>
                          <div className="w-8 h-11 rounded-[4px] overflow-hidden bg-bg-2 shrink-0">
                            <img src={item.coverUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium truncate">{item.title}</p>
                            {item.duration && <p className="text-[9px] text-text-2/50">{item.duration}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                {readingNow.length > 0 && (
                  <section>
                    <h4 className="flex items-center gap-2 text-[11px] font-semibold uppercase text-text-2 tracking-[0.12em] mb-3">
                      <BookOpen size={12} className="text-status-playing" /> Lendo
                    </h4>
                    <div className="space-y-2">
                      {readingNow.slice(0, 3).map((item) => (
                        <div key={item.id}
                          className="flex items-center gap-2.5 p-2.5 rounded-[10px] bg-bg-1/40 border border-bg-2/30 hover:border-bg-2/50 cursor-pointer transition-all"
                          onClick={() => setSelectedItem(item)}>
                          <div className="w-8 h-11 rounded-[4px] overflow-hidden bg-bg-2 shrink-0">
                            <img src={item.coverUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium truncate">{item.title}</p>
                            {item.volumes && <p className="text-[9px] text-text-2/50">{item.volumes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* Listas em andamento */}
            {activeLists.length > 0 && (
              <section className="animate-fade-in stagger-3">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="flex items-center gap-2 text-[11px] font-semibold uppercase text-text-2 tracking-[0.12em]">
                    <Target size={13} className="text-status-playing" /> Listas em andamento
                  </h4>
                  <Link to="/listas" className="text-[11px] text-accent-2/60 hover:text-accent-2 flex items-center gap-1 transition-colors">
                    Ver listas <ArrowRight size={11} />
                  </Link>
                </div>
                <div className="space-y-2">
                  {activeLists.slice(0, 3).map((list) => {
                    const total = list.items.filter((i) => i.role === 'principal').length
                    const done = list.items.filter((i) => i.role === 'principal' && (i.status === 'zerado' || i.status === 'na_estante')).length
                    const pct = total > 0 ? Math.round((done / total) * 100) : 0
                    return (
                      <Link key={list.id} to={`/listas/${list.id}`}
                        className="flex items-center gap-4 p-3.5 rounded-card bg-bg-1/40 border border-status-playing/15 hover:border-status-playing/30 transition-all">
                        {list.coverUrl && (
                          <div className="w-9 h-12 rounded-[6px] overflow-hidden bg-bg-2 shrink-0">
                            <img src={list.coverUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold truncate">{list.title}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="flex-1 h-1.5 rounded-full bg-bg-2 overflow-hidden">
                              <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[10px] font-mono text-text-2/60">{done}/{total}</span>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Coluna direita — sidebar stats (1/3) */}
          <div className="space-y-5">

            {/* Tempo estimado restante */}
            {totalHltb > 0 && (
              <div className="p-4 rounded-card bg-bg-1/50 border border-bg-2/40 animate-fade-in stagger-2">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={14} className="text-accent-2" />
                  <span className="text-[10px] uppercase tracking-[0.1em] text-text-2">Tempo restante</span>
                </div>
                <p className="text-[20px] font-bold">~{totalHltb}h</p>
                <p className="text-[10px] text-text-2">para zerar {playingGames.length} game{playingGames.length !== 1 && 's'} em andamento</p>
              </div>
            )}

            {/* Distribuição por status */}
            <div className="p-4 rounded-card bg-bg-1/50 border border-bg-2/40 animate-fade-in stagger-3">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={14} className="text-accent-2" />
                <span className="text-[10px] uppercase tracking-[0.1em] text-text-2">Progresso geral</span>
              </div>
              {(['jogando', 'quero', 'zerado', 'na_estante', 'abandonado'] as const).map((status) => {
                const count = items.filter((i) => i.status === status).length
                const pct = items.length > 0 ? Math.round((count / items.length) * 100) : 0
                const COLORS: Record<string, string> = {
                  jogando: 'var(--color-status-playing)',
                  quero: 'var(--color-status-want)',
                  zerado: 'var(--color-status-completed)',
                  na_estante: 'var(--color-status-platinum)',
                  abandonado: 'var(--color-status-abandoned)',
                }
                if (count === 0) return null
                return (
                  <div key={status} className="mb-2 last:mb-0">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-text-1">{STATUS_LABELS[status]}</span>
                      <span className="text-text-2 font-mono">{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-bg-2/60 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: COLORS[status] }} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Concluídos recentes — mini grid de capas */}
            {recentCompleted.length > 0 && (
              <div className="p-4 rounded-card bg-bg-1/50 border border-bg-2/40 animate-fade-in stagger-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase tracking-[0.1em] text-text-2">Concluídos</span>
                  <Link to="/backlog" className="text-[10px] text-accent-2/60 hover:text-accent-2 transition-colors">Ver todos</Link>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {recentCompleted.map((item) => (
                    <div key={item.id}
                      className="aspect-[3/4] rounded-[6px] overflow-hidden bg-bg-2 cursor-pointer hover:ring-1 hover:ring-accent/30 transition-all"
                      onClick={() => setSelectedItem(item)}>
                      <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" title={item.title} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
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
          onAdd={addItem}
          existingIds={new Set(items.map((i) => i.id))}
        />
      )}
    </>
  )
}
