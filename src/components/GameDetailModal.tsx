import { useState } from 'react'
import { X, Cpu, Check, Monitor, RefreshCw } from 'lucide-react'
import { type BacklogItem, type Status, STATUS_LABELS } from '../data/mock'
import { refreshMediaItem } from '../lib/backlog-service'
import StarRating from './StarRating'

const STATUS_COLORS: Record<Status, string> = {
  quero: 'border-status-want/40 bg-status-want/10 text-status-want',
  jogando: 'border-status-playing/40 bg-status-playing/10 text-status-playing',
  pausado: 'border-status-paused/40 bg-status-paused/10 text-status-paused',
  zerado: 'border-status-completed/40 bg-status-completed/10 text-status-completed',
  na_estante: 'border-status-platinum/40 bg-status-platinum/10 text-status-platinum',
  abandonado: 'border-status-abandoned/40 bg-status-abandoned/10 text-status-abandoned',
}

const KIND_LABELS: Record<string, string> = {
  game: 'Game',
  movie: 'Filme',
  series: 'Série',
  anime: 'Anime',
  manga: 'Mangá',
  book: 'Livro',
}

interface Props {
  item: BacklogItem
  onClose: () => void
  onUpdate: (id: string, updates: Partial<BacklogItem>) => void
}

function getStatusLabels(kind: string): Record<Status, string> {
  const isAudio = ['movie', 'series', 'anime'].includes(kind)
  const isRead = ['book', 'manga'].includes(kind)
  return {
    quero:      isAudio ? 'Quero assistir' : isRead ? 'Quero ler'   : 'Quero jogar',
    jogando:    isAudio ? 'Assistindo'     : isRead ? 'Lendo'        : 'Jogando',
    pausado:    'Pausado',
    zerado:     isAudio ? 'Assistido'      : isRead ? 'Lido'         : 'Zerado',
    na_estante: 'Platinado',
    abandonado: 'Abandonado',
  }
}

export default function GameDetailModal({ item, onClose, onUpdate }: Props) {
  const [status, setStatus] = useState<Status>(item.status)
  const [tier, setTier] = useState<number | null>(item.tier)
  const [selectedPlatform, setSelectedPlatform] = useState<string>(item.platform ?? '')
  const [review, setReview] = useState(item.review || '')
  const [obtained, setObtained] = useState<boolean>(item.obtained ?? false)
  const [runs, setRuns] = useState<boolean | null | undefined>(item.runs)
  const [refreshing, setRefreshing] = useState(false)
  const [localItem, setLocalItem] = useState<BacklogItem>(item)

  async function handleRefresh() {
    setRefreshing(true)
    const updates = await refreshMediaItem(localItem)
    if (updates) {
      const merged = { ...localItem, ...updates }
      setLocalItem(merged)
      onUpdate(item.id, updates)
    }
    setRefreshing(false)
  }

  function handleStatusChange(newStatus: Status) {
    setStatus(newStatus)
    onUpdate(item.id, { status: newStatus })
  }

  function handlePlatformSelect(platform: string) {
    setSelectedPlatform(platform)
    onUpdate(item.id, { platform })
  }

  function toggleObtained() {
    const next = !obtained
    setObtained(next)
    onUpdate(item.id, { obtained: next })
  }

  function handleReviewBlur() {
    onUpdate(item.id, { review })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-bg-0/85 backdrop-blur-md animate-backdrop" />
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-bg-1 border border-bg-2/60 rounded-xl shadow-2xl animate-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-4 right-4 flex items-center gap-1 z-10">
          {localItem.source && (
            <button onClick={handleRefresh} disabled={refreshing} title="Atualizar metadados"
              className="p-1.5 rounded-lg text-text-2 hover:text-accent-2 hover:bg-bg-2 transition-colors disabled:opacity-40">
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            </button>
          )}
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-text-2 hover:text-text-0 hover:bg-bg-2 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 pb-0">
          <div className="flex gap-6 mb-4">
            <div className="w-32 h-44 rounded-card overflow-hidden bg-bg-2 shrink-0">
              <img
                src={localItem.coverUrl}
                alt={localItem.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-text-2">
                {KIND_LABELS[localItem.kind]}
                {localItem.platform && (
                  <span className="font-mono ml-2">{localItem.platform}</span>
                )}
                {localItem.releaseYear && <span className="ml-2">{localItem.releaseYear}</span>}
              </span>
              <h2 className="font-display text-xl font-bold tracking-tight mt-1 pr-8">
                {localItem.title}
              </h2>

              {localItem.synopsis && (
                <p className="text-[12px] text-text-2 leading-relaxed mt-3 pr-8">
                  {localItem.synopsis}
                </p>
              )}

              {['movie', 'series', 'anime'].includes(localItem.kind) && (localItem.director || localItem.duration || localItem.whereToWatch) && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                  {localItem.director && (
                    <div>
                      <span className="text-[9px] uppercase tracking-[0.1em] text-text-2/50 font-bold block">Diretor</span>
                      <span className="text-[12px] text-text-1">{localItem.director}</span>
                    </div>
                  )}
                  {localItem.duration && (
                    <div>
                      <span className="text-[9px] uppercase tracking-[0.1em] text-text-2/50 font-bold block">Duração</span>
                      <span className="text-[12px] text-text-1">{localItem.duration}</span>
                    </div>
                  )}
                  {localItem.whereToWatch && (
                    <div>
                      <span className="text-[9px] uppercase tracking-[0.1em] text-text-2/50 font-bold block">Onde assistir</span>
                      <span className="text-[12px] text-text-1">{localItem.whereToWatch}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(STATUS_COLORS) as Status[])
              .filter((s) => s !== 'na_estante' || item.kind === 'game')
              .map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`text-[11px] font-medium px-3 py-1.5 rounded-full border transition-all duration-150 ${
                    status === s
                      ? STATUS_COLORS[s]
                      : 'border-bg-2 text-text-2 hover:border-text-2/40 hover:text-text-1'
                  }`}
                >
                  {getStatusLabels(item.kind)[s]}
                </button>
              ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {item.kind === 'game' && (
            <section className="space-y-2">
              <div className="flex items-center justify-between px-4 py-3 rounded-card border border-bg-2">
                <div className="flex items-center gap-2.5">
                  <Check size={15} className={obtained ? 'text-accent-2' : 'text-text-2'} />
                  <div>
                    <span className="text-[13px] font-medium block">Adquirido</span>
                    <span className="text-[10px] text-text-2 block">Já tenho esse jogo</span>
                  </div>
                </div>
                <button
                  onClick={toggleObtained}
                  role="switch"
                  aria-checked={obtained}
                  className={`relative w-10 h-6 rounded-full shrink-0 transition-colors duration-200 ${
                    obtained ? 'bg-accent' : 'bg-bg-2'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-bg-0 shadow-sm transition-transform duration-200 ${
                      obtained ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between px-4 py-3 rounded-card border border-bg-2">
                <div className="flex items-center gap-2.5">
                  <Cpu size={15} className={
                    runs === true ? 'text-status-completed' : runs === false ? 'text-status-abandoned' : 'text-text-2'
                  } />
                  <div>
                    <span className="text-[13px] font-medium block">Roda</span>
                    <span className="text-[10px] text-text-2 block">No seu PC ou console</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-bg-0 rounded-full p-0.5 border border-bg-2">
                  <button
                    onClick={() => { setRuns(true); onUpdate(item.id, { runs: true }) }}
                    className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                      runs === true ? 'bg-status-completed/15 text-status-completed' : 'text-text-2 hover:text-text-1'
                    }`}
                  >
                    Sim
                  </button>
                  <button
                    onClick={() => { setRuns(false); onUpdate(item.id, { runs: false }) }}
                    className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                      runs === false ? 'bg-status-abandoned/15 text-status-abandoned' : 'text-text-2 hover:text-text-1'
                    }`}
                  >
                    Não
                  </button>
                </div>
              </div>
            </section>
          )}

          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-2 mb-3">
              Como foi a jornada?
            </h3>
            <StarRating
              value={tier}
              onChange={(v) => { setTier(v); onUpdate(item.id, { tier: v }) }}
              size={28}
              showValue
            />
            <p className="text-[10px] text-text-2/50 mt-2">Clique na mesma estrela para remover a nota</p>
          </section>

          {item.kind === 'game' && item.availablePlatforms && item.availablePlatforms.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-text-2 mb-3">
                <Monitor size={13} />
                Em qual plataforma você vai jogar?
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {[...item.availablePlatforms, 'Emulador'].map((plat) => (
                  <button
                    key={plat}
                    onClick={() => handlePlatformSelect(plat)}
                    className={`text-[12px] px-3 py-2 rounded-card border transition-all duration-150 ${
                      selectedPlatform === plat
                        ? 'border-accent/50 bg-accent/8 text-accent-2 font-semibold'
                        : 'border-bg-2 text-text-2 hover:border-text-2/40 hover:text-text-1'
                    }`}
                  >
                    {plat}
                  </button>
                ))}
              </div>
              {selectedPlatform && (
                <p className="text-[11px] text-accent-2/70 mt-2">
                  Jogando em <span className="font-mono font-semibold">{selectedPlatform}</span>
                </p>
              )}
            </section>
          )}

          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-2 mb-3">
              Resenha
            </h3>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              onBlur={handleReviewBlur}
              placeholder="O que essa obra significou pra você?"
              rows={3}
              className="w-full bg-bg-0 border border-bg-2 rounded-card px-4 py-3 text-sm text-text-0 placeholder:text-text-2 resize-none focus:outline-none focus:border-accent/40 transition-colors"
            />
          </section>
        </div>
      </div>
    </div>
  )
}
