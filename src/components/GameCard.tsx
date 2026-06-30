import { Cpu, Check, Clock, Trash2 } from 'lucide-react'
import { type BacklogItem, STATUS_LABELS } from '../data/mock'
import StarRating from './StarRating'

const STATUS_COLORS: Record<string, string> = {
  quero:      'bg-status-want/12 text-status-want border border-status-want/40 pill-glow-want',
  jogando:    'bg-status-playing/12 text-status-playing border border-status-playing/40 pill-glow-playing',
  pausado:    'bg-status-paused/12 text-status-paused border border-status-paused/40 pill-glow-paused',
  zerado:     'bg-status-completed/12 text-status-completed border border-status-completed/40 pill-glow-completed',
  na_estante: 'bg-status-platinum/12 text-status-platinum border border-status-platinum/40 pill-glow-platinum',
  abandonado: 'bg-status-abandoned/10 text-status-abandoned border border-status-abandoned/35',
}

const KIND_LABELS: Record<string, string> = {
  game: 'Game', movie: 'Filme', series: 'Série', anime: 'Anime', manga: 'Mangá', book: 'Livro',
}

function fmtPrice(value?: number | null) {
  if (value == null) return ''
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function Col({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-[0.12em] text-text-2/50 font-bold mb-1">{label}</p>
      <div className="text-[13px] text-text-1 leading-tight">{children}</div>
    </div>
  )
}

const EMPTY = <span className="text-text-2/30">—</span>

// ─── Grid card (igual para todas as categorias) ───

export function GameCardGrid({ item, index = 0 }: { item: BacklogItem; index?: number }) {
  return (
    <div
      className="group relative card-hover animate-fade-in"
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      <div className="relative aspect-[3/4] rounded-card overflow-hidden bg-bg-2 ring-1 ring-white/[0.04]">
        <img src={item.coverUrl} alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-0/95 via-bg-0/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-3.5 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
          {item.tier != null && <StarRating value={item.tier} readOnly size={12} className="mb-1.5" />}
        </div>
        {item.status === 'jogando' && (
          <div className="absolute top-2.5 left-2.5">
            <span className="text-[9px] font-semibold px-2 py-1 rounded-full bg-status-playing/25 text-status-playing backdrop-blur-sm border border-status-playing/20">
              {item.kind === 'game' ? 'Jogando' : item.kind === 'manga' || item.kind === 'book' ? 'Lendo' : 'Assistindo'}
            </span>
          </div>
        )}
      </div>
      <div className="mt-2.5 px-0.5">
        <p className="text-[13px] font-medium text-text-0 truncate leading-tight">{item.title}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`text-[10px] font-bold px-2 py-[3px] rounded-[7px] uppercase tracking-wide inline-flex items-center gap-1 font-display ${STATUS_COLORS[item.status]}`}>
            {item.status === 'jogando' && <span className="live-dot" style={{ width: 5, height: 5 }} />}
            {STATUS_LABELS[item.status]}
          </span>
          {item.kind !== 'game' && <span className="text-[10px] text-text-2">{KIND_LABELS[item.kind]}</span>}
          {item.platform && <span className="text-[10px] font-mono text-text-2/70">{item.platform}</span>}
        </div>
      </div>
    </div>
  )
}

// ─── Cabeçalho compartilhado (capa + nome) ───

function ListItemHeader({ item }: { item: BacklogItem }) {
  const isSpotlight = item.status === 'na_estante'
  return (
    <>
      <div
        className="w-14 h-[76px] rounded-[8px] overflow-hidden bg-bg-2 shrink-0 ring-1 ring-white/[0.04]"
        style={isSpotlight ? { boxShadow: '0 0 22px rgba(255,230,0,.25)' } : {}}
      >
        <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="w-48 min-w-0 shrink-0">
        <p
          className="text-[15px] font-semibold text-text-0 truncate leading-snug"
          style={isSpotlight ? { textShadow: '2px 0 0 rgba(255,45,143,.45), -2px 0 0 rgba(39,215,255,.45)' } : {}}
        >
          {item.title}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[11px] text-text-2/80">{KIND_LABELS[item.kind] ?? item.kind}</span>
          {item.platform && <span className="text-[11px] font-mono text-text-2/60">{item.platform}</span>}
          {item.releaseYear && <span className="text-[11px] font-mono text-text-2/60">{item.releaseYear}</span>}
        </div>
      </div>
    </>
  )
}

// ─── Games ───

export function GameCardListGame({ item, index = 0, onRemove }: { item: BacklogItem; index?: number; onRemove?: (id: string) => void }) {
  const isSpotlight = item.status === 'na_estante'
  return (
    <div
      className={`group flex items-center gap-4 px-5 py-4 transition-all duration-200 animate-fade-in relative ${!isSpotlight ? 'hover:bg-bg-2/20' : ''}`}
      style={{
        animationDelay: `${index * 0.03}s`,
        ...(isSpotlight ? {
          background: 'linear-gradient(90deg, rgba(255,230,0,.08), rgba(255,45,143,.04) 40%, transparent 78%), rgba(31,17,51,.55)',
          borderTop: '1px solid rgba(255,230,0,.22)',
          borderBottom: '1px solid rgba(255,230,0,.22)',
        } : {}),
      }}
    >
      <ListItemHeader item={item} />
      <div className="flex-1 grid items-center gap-4 pl-4 border-l border-bg-2/30"
        style={{ gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,0.8fr) minmax(0,0.8fr) minmax(0,1fr) minmax(0,0.6fr) minmax(0,0.7fr) minmax(0,0.8fr) minmax(0,0.7fr) minmax(0,0.9fr)' }}>
        <Col label="Desenvolvedora">
          {item.developer ? <span className="truncate block">{item.developer}</span> : EMPTY}
        </Col>
        <Col label="Gênero">
          {item.genre ? <span>{item.genre}</span> : EMPTY}
        </Col>
        <Col label="Subgênero">
          {item.subgenre ? <span>{item.subgenre}</span> : EMPTY}
        </Col>
        <Col label="Tempo">
          {item.hltbMain || item.hltbCompletionist ? (
            <div className="flex flex-col gap-0.5">
              {item.hltbMain && <span className="text-[11px] text-text-1 flex items-center gap-1"><Clock size={10} className="text-text-2/60" /> ~{item.hltbMain}h zerar</span>}
              {item.hltbCompletionist && <span className="text-[10px] text-text-2/70">~{item.hltbCompletionist}h platinar</span>}
            </div>
          ) : EMPTY}
        </Col>
        <Col label="Roda">
          {item.runs == null ? EMPTY : (
            <span className={`flex items-center gap-1 ${item.runs ? 'text-status-completed' : 'text-status-abandoned'}`}>
              <Cpu size={12} /> {item.runs ? 'Sim' : 'Não'}
            </span>
          )}
        </Col>
        <Col label="Adquirido">
          {item.obtained ? <span className="text-status-completed font-medium flex items-center gap-1"><Check size={12} /> Sim</span> : <span className="text-text-2/60">Não</span>}
        </Col>
        <Col label="Preço">
          {item.price != null ? <span className="font-mono">{fmtPrice(item.price)}</span> : <span className="text-[10px] text-text-2/40 italic">via Steam</span>}
        </Col>
        <Col label="Status">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-[7px] inline-flex items-center gap-1.5 font-display tracking-[.06em] uppercase ${STATUS_COLORS[item.status]}`}>
            {item.status === 'jogando' && <span className="live-dot" />}
            {STATUS_LABELS[item.status]}
          </span>
        </Col>
        <Col label="Avaliação">
          {item.tier != null ? <StarRating value={item.tier} readOnly size={13} /> : EMPTY}
        </Col>
      </div>
      {onRemove && (
        <button onClick={(e) => { e.stopPropagation(); onRemove(item.id) }} title="Remover do backlog"
          className="p-2 rounded-[8px] text-text-2 hover:bg-status-abandoned/15 hover:text-status-abandoned opacity-0 group-hover:opacity-100 transition-all shrink-0">
          <Trash2 size={14} />
        </button>
      )}
    </div>
  )
}

// ─── Audiovisual (filmes, séries, animes) ───

export function GameCardListAudio({ item, index = 0, statusLabel, onRemove }: { item: BacklogItem; index?: number; statusLabel?: string; onRemove?: (id: string) => void }) {
  return (
    <div className="group flex items-center gap-4 px-5 py-4 hover:bg-bg-2/20 transition-all duration-200 animate-fade-in"
      style={{ animationDelay: `${index * 0.03}s` }}>
      <ListItemHeader item={item} />
      <div className="flex-1 grid items-center gap-4 pl-4 border-l border-bg-2/30"
        style={{ gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr) minmax(0,1fr) minmax(0,0.8fr) minmax(0,1fr)' }}>
        <Col label={item.kind === 'movie' ? 'Diretor' : 'Estúdio'}>
          {item.director ? <span className="truncate block">{item.director}</span> : EMPTY}
        </Col>
        <Col label="Gênero">
          {item.genre ? <span>{item.genre}</span> : EMPTY}
        </Col>
        <Col label={item.kind === 'movie' ? 'Duração' : item.kind === 'series' ? 'Temporadas' : 'Episódios'}>
          {item.duration ? <span>{item.duration}</span> : EMPTY}
        </Col>
        <Col label="Status">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-[7px] inline-flex items-center gap-1.5 font-display tracking-[.06em] uppercase ${STATUS_COLORS[item.status]}`}>
            {item.status === 'jogando' && <span className="live-dot" />}
            {statusLabel ?? STATUS_LABELS[item.status]}
          </span>
        </Col>
        <Col label="Avaliação">
          {item.tier != null ? <StarRating value={item.tier} readOnly size={13} /> : EMPTY}
        </Col>
      </div>
      {onRemove && (
        <button onClick={(e) => { e.stopPropagation(); onRemove(item.id) }} title="Remover do backlog"
          className="p-2 rounded-[8px] text-text-2 hover:bg-status-abandoned/15 hover:text-status-abandoned opacity-0 group-hover:opacity-100 transition-all shrink-0">
          <Trash2 size={14} />
        </button>
      )}
    </div>
  )
}

// ─── Leitura (livros, mangás) ───

export function GameCardListRead({ item, index = 0, statusLabel, onRemove }: { item: BacklogItem; index?: number; statusLabel?: string; onRemove?: (id: string) => void }) {
  return (
    <div className="group flex items-center gap-4 px-5 py-4 hover:bg-bg-2/20 transition-all duration-200 animate-fade-in"
      style={{ animationDelay: `${index * 0.03}s` }}>
      <ListItemHeader item={item} />
      <div className="flex-1 grid items-center gap-4 pl-4 border-l border-bg-2/30"
        style={{ gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,0.8fr) minmax(0,1fr)' }}>
        <Col label="Autor">
          {item.author ? <span className="truncate block">{item.author}</span> : EMPTY}
        </Col>
        <Col label="Gênero">
          {item.genre ? <span>{item.genre}</span> : EMPTY}
        </Col>
        <Col label={item.kind === 'manga' ? 'Volumes' : 'Páginas'}>
          {item.volumes ? <span>{item.volumes}</span> : EMPTY}
        </Col>
        <Col label="Editora">
          {item.publisher ? <span className="truncate block">{item.publisher}</span> : EMPTY}
        </Col>
        <Col label="Status">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-[7px] inline-flex items-center gap-1.5 font-display tracking-[.06em] uppercase ${STATUS_COLORS[item.status]}`}>
            {item.status === 'jogando' && <span className="live-dot" />}
            {statusLabel ?? STATUS_LABELS[item.status]}
          </span>
        </Col>
        <Col label="Avaliação">
          {item.tier != null ? <StarRating value={item.tier} readOnly size={13} /> : EMPTY}
        </Col>
      </div>
      {onRemove && (
        <button onClick={(e) => { e.stopPropagation(); onRemove(item.id) }} title="Remover do backlog"
          className="p-2 rounded-[8px] text-text-2 hover:bg-status-abandoned/15 hover:text-status-abandoned opacity-0 group-hover:opacity-100 transition-all shrink-0">
          <Trash2 size={14} />
        </button>
      )}
    </div>
  )
}

// ─── Export legado (alias para games) ───
export const GameCardList = GameCardListGame
