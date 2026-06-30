import { useState } from 'react'
import { Plus, Globe, Lock, Heart, Play, Check, Pause, Hammer, LayoutList } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import CreateListModal from '../components/CreateListModal'
import { useLists } from '../context/ListsContext'
import { getListTypeConfig, type ListStatus } from '../data/list-rules'

const STATUS_CARD_STYLES: Record<ListStatus, { border: string; badge: string; badgeText: string }> = {
  building: { border: 'border-bg-2/40', badge: 'bg-bg-2/40 text-text-2', badgeText: 'Planejando' },
  ready: { border: 'border-accent/30', badge: 'bg-accent/15 text-accent-2', badgeText: 'Pronta' },
  active: { border: 'border-status-playing/30', badge: 'bg-status-playing/15 text-status-playing', badgeText: 'Em andamento' },
  paused: { border: 'border-text-2/20', badge: 'bg-bg-2/40 text-text-2', badgeText: 'Pausada' },
  completed: { border: 'border-bg-2/30', badge: 'bg-bg-2/40 text-text-2', badgeText: 'Concluída' },
}

const STATUS_ICON: Record<ListStatus, typeof Play> = {
  building: Hammer,
  ready: Play,
  active: Play,
  paused: Pause,
  completed: Check,
}

export default function ListsPage() {
  const { lists, addList, startList } = useLists()
  const [showCreate, setShowCreate] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      <TopBar title="Minhas listas" />
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-[13px] text-text-1">
            Suas séries e listas temáticas.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-card bg-accent text-bg-0 text-[12px] font-semibold hover:bg-accent-2 transition-all"
          >
            <Plus size={14} strokeWidth={2.5} />
            Nova lista
          </button>
        </div>

        {lists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <p className="text-text-1 text-[14px] mb-1">
              Nenhuma lista ainda. Que tal um Correndo Atrás?
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-card bg-accent text-bg-0 text-[13px] font-semibold hover:bg-accent-2 transition-all"
            >
              <Plus size={14} />
              Criar primeira lista
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {([
              { key: 'active' as ListStatus, label: 'Em andamento', icon: Play },
              { key: 'ready' as ListStatus, label: 'Prontas', icon: Play },
              { key: 'building' as ListStatus, label: 'Planejando', icon: Hammer },
              { key: 'paused' as ListStatus, label: 'Pausadas', icon: Pause },
              { key: 'completed' as ListStatus, label: 'Concluídas', icon: Check },
            ]).map(({ key, label, icon: SectionIcon }) => {
              const sectionLists = lists.filter((l) => l.status === key)
              if (sectionLists.length === 0) return null
              return (
                <section key={key}>
                  <div className="flex items-center gap-2 mb-3">
                    <SectionIcon size={14} className="text-text-2" />
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-2">
                      {label}
                      <span className="ml-1.5 opacity-60">({sectionLists.length})</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {sectionLists.map((list) => {
              const config = getListTypeConfig(list.type)
              const style = STATUS_CARD_STYLES[list.status]
              const Icon = STATUS_ICON[list.status]
              const completedCount = list.items.filter((i) => i.status === 'zerado' || i.status === 'na_estante').length
              const totalCount = list.items.filter((i) => i.role === 'principal').length

              return (
                <div
                  key={list.id}
                  onClick={() => navigate(`/listas/${list.id}`)}
                  className={`group rounded-card bg-bg-1/50 border ${style.border} overflow-hidden hover:bg-bg-1/80 transition-all duration-200 cursor-pointer animate-fade-in ember-glow flex flex-col ${list.status === 'completed' ? 'opacity-50 hover:opacity-70' : ''}`}
                >
                  <div className="flex items-start gap-3 p-3 pb-0">
                    <div className="w-12 h-16 rounded-[8px] overflow-hidden bg-bg-2 shrink-0 flex items-center justify-center ring-1 ring-white/[0.04]">
                      {list.coverUrl ? (
                        <img src={list.coverUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <LayoutList size={16} className="text-text-2/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>
                        <Icon size={9} />
                        {style.badgeText}
                      </span>
                      <h3 className="text-[13px] font-semibold leading-snug mt-1.5 line-clamp-2">{list.title}</h3>
                    </div>
                  </div>

                  <div className="px-3 pb-3 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-text-2">
                      <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-accent-2/80 truncate">
                        {config.label}
                      </span>
                      {list.visibility === 'public' ? (
                        <Globe size={9} className="text-text-2/60 shrink-0" />
                      ) : (
                        <Lock size={9} className="text-text-2/60 shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[10px] text-text-2">
                      <span>{list.items.length} obra{list.items.length !== 1 && 's'}</span>
                      {list.likeCount > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Heart size={9} /> {list.likeCount}
                        </span>
                      )}
                    </div>

                    {list.status !== 'building' && totalCount > 0 && (
                      <div className="flex items-center gap-1.5 mt-auto pt-2">
                        <div className="flex-1 h-1 rounded-full bg-bg-2 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.round((completedCount / totalCount) * 100)}%`,
                              background: list.status === 'completed' ? 'var(--color-status-completed)' : 'var(--color-accent)',
                            }}
                          />
                        </div>
                        <span className="text-[9px] font-mono text-text-2/70 shrink-0">{completedCount}/{totalCount}</span>
                      </div>
                    )}

                    {list.status === 'ready' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); startList(list.id) }}
                        className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-[8px] bg-accent/10 text-accent-2 text-[10px] font-semibold hover:bg-accent/20 transition-all"
                      >
                        <Play size={10} /> Iniciar
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateListModal
          onClose={() => setShowCreate(false)}
          onCreate={addList}
        />
      )}
    </>
  )
}
