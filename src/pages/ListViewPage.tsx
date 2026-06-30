import { useState, useRef, type ReactNode } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Globe, Lock, Heart, Trash2, Plus, Search, X,
  Gamepad2, Film, BookOpen, Tv, GripVertical,
  Check, Pencil, Cpu, Clock, Play, Pause, RotateCcw, CheckCircle, Hammer, Camera,
} from 'lucide-react'
import { useLists } from '../context/ListsContext'
import { useBacklog } from '../context/BacklogContext'
import { uploadImage } from '../lib/storage'
import { getListTypeConfig, LIST_STATUS_LABELS, type ListItem } from '../data/list-rules'
import TopBar from '../components/TopBar'

const STATUS_NAMES: Record<string, string> = {
  quero: 'Quero jogar', jogando: 'Jogando', pausado: 'Pausado',
  zerado: 'Zerado', na_estante: 'Platinado', abandonado: 'Abandonado',
}
const CLASSIFICATION_LABELS: Record<string, string> = {
  classico: 'Clássico', desconhecido: 'Desconhecido', retro: 'Retrô', canone: 'Cânone', spin_off: 'Spin-off',
}
const CLASSIFICATION_OPTIONS = ['classico', 'desconhecido', 'retro', 'canone', 'spin_off'] as const
const KIND_LABELS: Record<string, string> = {
  game: 'Game', movie: 'Filme', series: 'Série', anime: 'Anime', manga: 'Mangá', book: 'Livro',
}
const KIND_ICON: Record<string, typeof Gamepad2> = {
  game: Gamepad2, movie: Film, series: Tv, anime: Tv, manga: BookOpen, book: BookOpen,
}


function fmtPrice(value?: number | null) {
  if (value == null) return ''
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function DataCol({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-[0.12em] text-text-2/50 font-bold mb-1">{label}</p>
      <div className="text-[13px] text-text-1 leading-tight">{children}</div>
    </div>
  )
}

const EMPTY = <span className="text-text-2/30">—</span>;

export default function ListViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { lists, updateList, removeItemFromList, addItemToList, updateListItem, reorderListItems, markReady, startList, pauseList, resumeList, completeList, resetList, deleteList } = useLists()
  const { items: backlogItems } = useBacklog()
  const [showAddModal, setShowAddModal] = useState(false)
  const [addQuery, setAddQuery] = useState('')
  const [addRole, setAddRole] = useState<'principal' | 'upgrade'>('principal')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Partial<ListItem>>({})
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [showStartWarning, setShowStartWarning] = useState(false)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const [openStatusDropdown, setOpenStatusDropdown] = useState<string | null>(null)
  const [statusDropdownPos, setStatusDropdownPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const [showEditList, setShowEditList] = useState(false)
  const [showDeleteListConfirm, setShowDeleteListConfirm] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editTheme, setEditTheme] = useState('')
  const [editCoverUrl, setEditCoverUrl] = useState('')
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null)
  const editCoverRef = useRef<HTMLInputElement>(null)

  // ── Drag & drop ──
  const [dragFrom, setDragFrom] = useState<{ idx: number; role: 'principal' | 'upgrade' } | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const dragRoleRef = useRef<'principal' | 'upgrade' | null>(null)

  function handleDragStart(idx: number, role: 'principal' | 'upgrade') {
    dragRoleRef.current = role
    setDragFrom({ idx, role })
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault()
    setDragOverIdx(idx)
  }

  function handleDrop(overIdx: number, role: 'principal' | 'upgrade') {
    if (!dragFrom || dragFrom.role !== role || dragFrom.idx === overIdx) {
      setDragFrom(null); setDragOverIdx(null); return
    }
    const group = role === 'upgrade' ? upgrades : principals
    const reordered = [...group]
    const [moved] = reordered.splice(dragFrom.idx, 1)
    reordered.splice(overIdx, 0, moved)
    const other = role === 'upgrade' ? principals : upgrades
    reorderListItems(list!.id, role === 'upgrade' ? [...other, ...reordered] : [...reordered, ...other])
    setDragFrom(null); setDragOverIdx(null)
  }

  function handleDragEnd() { setDragFrom(null); setDragOverIdx(null) }

  const list = lists.find((l) => l.id === id)
  if (!list) {
    return (
      <>
        <TopBar title="Lista" />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-text-1 text-[13px]">Lista não encontrada.</p>
        </div>
      </>
    )
  }

  const config = getListTypeConfig(list.type)
  const principals = [...list.items.filter((i) => i.role === 'principal')].sort((a, b) => a.position - b.position)
  const upgrades = [...list.items.filter((i) => i.role === 'upgrade')].sort((a, b) => a.position - b.position)

  function startEdit(item: ListItem) {
    setEditingId(item.id)
    setDraft({
      releaseYear: item.releaseYear,
      price: item.price,
      obtained: item.obtained,
      consumed: item.consumed,
      canonical: item.canonical,
      runs: item.runs,
      classification: item.classification,
      status: item.status,
      startDate: item.startDate,
      doneDate: item.doneDate,
      note: item.note,
    })
  }

  function saveEdit(itemId: string) {
    updateListItem(list!.id, itemId, draft)
    setEditingId(null)
    setDraft({})
  }

  function handleAddItem(item: (typeof backlogItems)[0]) {
    const newItem: ListItem = {
      id: `li-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      mediaItemId: item.id,
      title: item.title,
      coverUrl: item.coverUrl,
      kind: item.kind,
      platform: item.platform,
      role: addRole,
      obtained: false,
      releaseYear: item.releaseYear,
      developer: item.developer,
      position: list!.items.length,
    }
    addItemToList(list!.id, newItem)
  }

  const addResults = backlogItems.filter((s) =>
    addQuery.length < 2 || s.title.toLowerCase().includes(addQuery.toLowerCase())
  )

  function renderItem(item: ListItem, _group: ListItem[], groupIdx: number) {
    const Icon = KIND_ICON[item.kind] ?? Gamepad2
    const isEditing = editingId === item.id
    const showClassif = item.classification && item.classification !== 'canone'
    const itemSt = item.status ?? 'quero'
    const isPlatinum = itemSt === 'na_estante'
    const isAbandoned = itemSt === 'abandonado'
    const role = item.role as 'principal' | 'upgrade'
    const isDragging = dragFrom?.idx === groupIdx && dragFrom?.role === role
    const isDropTarget = dragOverIdx === groupIdx && dragFrom?.role === role && dragFrom?.idx !== groupIdx
    return (
      <div key={item.id} className="group">
        <div
          className={`flex items-center gap-3 px-5 py-4 transition-all relative ${
            isPlatinum
              ? 'bg-status-platinum/[0.04] hover:bg-status-platinum/[0.08]'
              : isAbandoned
                  ? 'opacity-40 hover:opacity-60'
                  : 'hover:bg-bg-2/20'
          } ${isDragging ? 'opacity-40 scale-[0.99]' : ''}`}
          style={isDropTarget ? { boxShadow: 'inset 0 2px 0 0 var(--color-accent)' } : {}}
          onDragOver={(e) => handleDragOver(e, groupIdx)}
          onDrop={() => handleDrop(groupIdx, role)}
        >
          {/* Grip handle */}
          <div
            draggable
            onDragStart={() => handleDragStart(groupIdx, role)}
            onDragEnd={handleDragEnd}
            className={`cursor-grab active:cursor-grabbing shrink-0 transition-opacity ${
              isAbandoned ? 'opacity-20' : 'opacity-0 group-hover:opacity-40 hover:!opacity-80'
            }`}
          >
            <GripVertical size={16} className="text-text-1" />
          </div>

          <span className="text-[13px] font-mono text-text-2/40 w-5 text-center shrink-0">
            {groupIdx + 1}
          </span>

          <div className={`w-14 h-[76px] rounded-[8px] overflow-hidden bg-bg-2 shrink-0 ring-1 ring-white/[0.04]${isPlatinum ? ' ring-2 ring-status-platinum/30' : ''}`}>
            <img src={item.coverUrl} alt="" className="w-full h-full object-cover" />
          </div>

          <div className="w-56 min-w-0 shrink-0">
            <p className="text-[15px] font-semibold truncate leading-snug">{item.title}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Icon size={12} className="text-text-2/60" />
              <span className="text-[11px] text-text-2/80">{KIND_LABELS[item.kind] || item.kind}</span>
              {item.platform && <span className="text-[11px] font-mono text-text-2/60">{item.platform}</span>}
              {item.classification === 'canone' && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-accent/10 text-accent-2 font-medium">Cânone</span>
              )}
              {showClassif && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-bg-2/60 text-text-1">
                  {CLASSIFICATION_LABELS[item.classification!]}
                </span>
              )}
            </div>
          </div>

          <div
            className={`flex-1 grid items-center gap-4 pl-5 border-l border-bg-2/30 `}
            style={{ gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,0.8fr) minmax(0,0.8fr) minmax(0,1fr) minmax(0,0.6fr) minmax(0,0.7fr) minmax(0,0.8fr) minmax(0,0.7fr) minmax(0,0.9fr)' }}
          >
            <DataCol label="Desenvolvedora">
              {item.developer ? <span className="text-[13px] truncate block">{item.developer}</span> : EMPTY}
            </DataCol>
            <DataCol label="Gênero">
              {item.genre ? <span className="text-[13px] text-text-1">{item.genre}</span> : EMPTY}
            </DataCol>
            <DataCol label="Subgênero">
              {item.subgenre ? <span className="text-[13px] text-text-1">{item.subgenre}</span> : EMPTY}
            </DataCol>
            <DataCol label="Tempo">
              {item.hltbMain || item.hltbCompletionist ? (
                <div className="flex flex-col gap-0.5">
                  {item.hltbMain && (
                    <span className="text-[11px] text-text-1 flex items-center gap-1">
                      <Clock size={10} className="text-text-2/60" /> ~{item.hltbMain}h zerar
                    </span>
                  )}
                  {item.hltbCompletionist && (
                    <span className="text-[10px] text-text-2/70">~{item.hltbCompletionist}h platinar</span>
                  )}
                </div>
              ) : EMPTY}
            </DataCol>
            <DataCol label="Roda">
              {item.runs == null ? EMPTY : (
                <span className={`flex items-center gap-1 text-[13px] ${item.runs ? 'text-status-completed' : 'text-status-abandoned'}`}>
                  <Cpu size={12} /> {item.runs ? 'Sim' : 'Não'}
                </span>
              )}
            </DataCol>
            <DataCol label="Adquirido">
              {item.obtained ? (
                <span className="text-[13px] text-status-completed font-medium flex items-center gap-1"><Check size={12} /> Sim</span>
              ) : (
                <span className="text-[13px] text-text-2/60">Não</span>
              )}
            </DataCol>
            <DataCol label="Preço">
              {item.price != null
                ? <span className="text-[13px] font-mono text-text-1">{fmtPrice(item.price)}</span>
                : <span className="text-[10px] text-text-2/40 italic">via Steam</span>}
            </DataCol>
            <DataCol label="Status">
              {(() => {
                const currentStatus = item.status ?? 'quero'
                const STATUS_QUICK: Record<string, string> = {
                  quero:      'bg-status-want/12 text-status-want border border-status-want/40 pill-glow-want',
                  jogando:    'bg-status-playing/12 text-status-playing border border-status-playing/40 pill-glow-playing',
                  pausado:    'bg-status-paused/12 text-status-paused border border-status-paused/40 pill-glow-paused',
                  zerado:     'bg-status-completed/12 text-status-completed border border-status-completed/40 pill-glow-completed',
                  na_estante: 'bg-status-platinum/12 text-status-platinum border border-status-platinum/40 pill-glow-platinum',
                  abandonado: 'bg-status-abandoned/10 text-status-abandoned border border-status-abandoned/35',
                }
                const pillClass = STATUS_QUICK[currentStatus] ?? STATUS_QUICK.quero
                const isOpen = openStatusDropdown === item.id
                return (
                  <div className="relative">
                    <span
                      onClick={(e) => {
                        e.stopPropagation()
                        if (isOpen) {
                          setOpenStatusDropdown(null)
                        } else {
                          const rect = e.currentTarget.getBoundingClientRect()
                          const dropdownHeight = 220
                          const openUpward = rect.bottom + dropdownHeight > window.innerHeight
                          setStatusDropdownPos({ top: openUpward ? -1 : 0, left: 0 })
                          setOpenStatusDropdown(item.id)
                        }
                      }}
                      className={`text-[11px] font-bold font-display tracking-[.06em] uppercase px-2.5 py-1 rounded-[7px] cursor-pointer inline-flex items-center gap-1.5 ${pillClass} hover:opacity-80 transition-all`}>
                      {currentStatus === 'jogando' && <span className="live-dot" />}
                      {STATUS_NAMES[currentStatus]}
                    </span>
                    {isOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setOpenStatusDropdown(null)} />
                        <div
                          className={`absolute left-0 py-1 rounded-card bg-bg-1 border border-bg-2/60 shadow-xl z-50 min-w-[140px] animate-fade-in ${
                            statusDropdownPos.top === -1 ? 'bottom-full mb-1' : 'top-full mt-1'
                          }`}>
                          {Object.entries(STATUS_NAMES).map(([key, label]) => (
                            <button key={key}
                              onClick={(e) => {
                                e.stopPropagation()
                                updateListItem(list!.id, item.id, { status: key as any })
                                setOpenStatusDropdown(null)
                              }}
                              className={`w-full text-left px-3 py-1.5 text-[11px] transition-colors ${
                                currentStatus === key ? 'text-accent-2 font-semibold bg-accent/8' : 'text-text-1 hover:bg-bg-2/40'
                              }`}>
                              {label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )
              })()}
            </DataCol>
          </div>

          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => (isEditing ? setEditingId(null) : startEdit(item))} title="Editar"
              className={`p-2 rounded-[8px] transition-all ${isEditing ? 'bg-accent/15 text-accent-2' : 'text-text-2 hover:bg-bg-2/40 hover:text-text-1'}`}>
              <Pencil size={14} />
            </button>
            <button onClick={() => setConfirmDelete(item.id)} title="Remover"
              className="p-2 rounded-[8px] text-text-2 hover:bg-status-abandoned/15 hover:text-status-abandoned transition-all">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {item.note && (
          <p className="text-[11px] text-text-2/70 italic px-5 pb-3 -mt-1 pl-[124px]">"{item.note}"</p>
        )}

        {isEditing && (
          <div className="px-14 pb-4 animate-fade-in">
            <div className="rounded-card bg-bg-0/60 border border-bg-2/50 p-4 space-y-4">
              <p className="text-[10px] text-text-2/70 flex items-center gap-1.5">
                <Cpu size={11} />
                Lançamento e preço vêm das APIs (IGDB/loja) e não são editados aqui.
              </p>

              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'obtained' as const, label: 'Adquirido' },
                  { key: 'runs' as const, label: 'Roda' },
                ].map(({ key, label }) => {
                  const active = !!draft[key]
                  return (
                    <button key={key}
                      onClick={() => setDraft({ ...draft, [key]: !draft[key] })}
                      className={`flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full transition-all ${
                        active ? 'bg-accent/12 text-accent-2 ring-1 ring-accent/20' : 'bg-bg-1 text-text-2 hover:text-text-1'
                      }`}>
                      {active && <Check size={11} />}
                      {label}
                    </button>
                  )
                })}
              </div>

              <div>
                <span className="text-[10px] text-text-2 block mb-1.5">Status</span>
                <div className="flex flex-wrap gap-1.5">
                  {([
                    { key: 'quero', label: 'Quero jogar', color: 'bg-status-want/15 text-status-want' },
                    { key: 'jogando', label: 'Jogando', color: 'bg-status-playing/15 text-status-playing' },
                    { key: 'pausado', label: 'Pausado', color: 'bg-status-paused/15 text-status-paused' },
                    { key: 'zerado', label: 'Zerado', color: 'bg-status-completed/15 text-status-completed' },
                    { key: 'na_estante', label: 'Platinado', color: 'bg-status-platinum/15 text-status-platinum' },
                    { key: 'abandonado', label: 'Abandonado', color: 'bg-status-abandoned/15 text-status-abandoned' },
                  ] as const).map(({ key, label, color }) => (
                    <button key={key}
                      onClick={() => setDraft({ ...draft, status: key })}
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-full transition-all ${
                        (draft.status ?? item.status ?? 'quero') === key
                          ? `${color} ring-1 ring-current/30`
                          : 'bg-bg-1 text-text-2 hover:text-text-1'
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-text-2 block mb-1.5">Classificação</span>
                <div className="flex flex-wrap gap-1.5">
                  {CLASSIFICATION_OPTIONS.map((c) => (
                    <button key={c}
                      onClick={() => setDraft({ ...draft, classification: draft.classification === c ? null : c })}
                      className={`text-[11px] px-2.5 py-1 rounded-full transition-all ${
                        draft.classification === c ? 'bg-accent/12 text-accent-2 ring-1 ring-accent/20' : 'bg-bg-1 text-text-2 hover:text-text-1'
                      }`}>
                      {CLASSIFICATION_LABELS[c]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[10px] text-text-2 block mb-1">Data de início</span>
                  <input type="date" value={draft.startDate ?? ''}
                    onChange={(e) => setDraft({ ...draft, startDate: e.target.value || undefined })}
                    className="w-full bg-bg-1 border border-bg-2/60 rounded-[8px] px-3 py-2 text-[13px] text-text-0 focus:outline-none focus:border-accent/40 [color-scheme:dark]" />
                </label>
                <label className="block">
                  <span className="text-[10px] text-text-2 block mb-1">Data de conclusão</span>
                  <input type="date" value={draft.doneDate ?? ''}
                    onChange={(e) => setDraft({ ...draft, doneDate: e.target.value || undefined })}
                    className="w-full bg-bg-1 border border-bg-2/60 rounded-[8px] px-3 py-2 text-[13px] text-text-0 focus:outline-none focus:border-accent/40 [color-scheme:dark]" />
                </label>
              </div>

              <label className="block">
                <span className="text-[10px] text-text-2 block mb-1">Nota</span>
                <input type="text" value={draft.note ?? ''}
                  onChange={(e) => setDraft({ ...draft, note: e.target.value || undefined })}
                  placeholder="Um comentário sobre essa obra..."
                  className="w-full bg-bg-1 border border-bg-2/60 rounded-[8px] px-3 py-2 text-[13px] text-text-0 placeholder:text-text-2 focus:outline-none focus:border-accent/40" />
              </label>

              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => setEditingId(null)}
                  className="px-4 py-2 rounded-[8px] text-[11px] text-text-2 hover:bg-bg-2/30 transition-colors">
                  Cancelar
                </button>
                <button onClick={() => saveEdit(item.id)}
                  className="px-4 py-2 rounded-[8px] bg-accent text-bg-0 text-[11px] font-semibold hover:bg-accent-2 transition-colors">
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <TopBar title={list.title} />
      <div className="p-8">
        <button onClick={() => navigate('/listas')}
          className="flex items-center gap-1.5 text-[13px] text-text-2 hover:text-text-1 transition-colors mb-6">
          <ArrowLeft size={14} />
          Voltar para listas
        </button>

        <div className="flex gap-6 mb-8 animate-fade-in">
          {list.coverUrl && (
            <div className="w-28 h-38 rounded-card overflow-hidden bg-bg-2 shrink-0 ring-1 ring-white/[0.04]">
              <img src={list.coverUrl} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-accent-2">{config.label}</span>
              {list.visibility === 'public' ? (
                <span className="flex items-center gap-1 text-[10px] text-text-2"><Globe size={10} /> Pública</span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-text-2"><Lock size={10} /> Privada</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-bold tracking-tight">{list.title}</h2>
              <button onClick={() => {
                setEditTitle(list.title)
                setEditDescription(list.description)
                setEditTheme(list.theme)
                setEditCoverUrl(list.coverUrl ?? '')
                setShowEditList(true)
              }} className="p-1.5 rounded-[8px] text-text-2 hover:bg-bg-2/40 hover:text-text-1 transition-all" title="Editar lista">
                <Pencil size={13} />
              </button>
              <button onClick={() => setShowDeleteListConfirm(true)}
                className="p-1.5 rounded-[8px] text-text-2 hover:bg-status-abandoned/15 hover:text-status-abandoned transition-all" title="Deletar lista">
                <Trash2 size={13} />
              </button>
            </div>
            {list.theme && <p className="text-[13px] text-text-1 mt-1">Tema: {list.theme}</p>}
            {list.description && <p className="text-[13px] text-text-2 mt-2">{list.description}</p>}
            <div className="flex items-center gap-4 mt-3">
              <span className="flex items-center gap-1 text-[11px] text-text-2"><Heart size={12} /> {list.likeCount}</span>
              <span className="text-[11px] text-text-2">{list.items.length} obra{list.items.length !== 1 && 's'}</span>
              <button
                onClick={() => updateList(list.id, { visibility: list.visibility === 'public' ? 'private' : 'public' })}
                className="text-[11px] text-accent-2 hover:text-accent transition-colors">
                Tornar {list.visibility === 'public' ? 'privada' : 'pública'}
              </button>
            </div>
          </div>
        </div>

        {/* Barra de estado */}
        {(() => {
          const completedCount = list.items.filter((i) => i.role === 'principal' && (i.status === 'zerado' || i.status === 'na_estante')).length
          const totalCount = list.items.filter((i) => i.role === 'principal').length
          const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
          const fmtTime = (ms?: number) => {
            if (!ms) return ''
            const hours = Math.floor(ms / 3600000)
            const days = Math.floor(hours / 24)
            if (days > 0) return `${days}d ${hours % 24}h`
            return `${hours}h`
          }

          return (
            <div className={`mb-6 p-4 rounded-card border animate-fade-in ${
              list.status === 'building' ? 'bg-bg-1/30 border-bg-2/40' :
              list.status === 'ready' ? 'bg-accent/5 border-accent/20' :
              list.status === 'active' ? 'bg-status-playing/5 border-status-playing/20' :
              list.status === 'paused' ? 'bg-bg-1/30 border-text-2/20' :
              'bg-status-completed/5 border-status-completed/20'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center ${
                    list.status === 'building' ? 'bg-bg-2/60 text-text-2' :
                    list.status === 'ready' ? 'bg-accent/15 text-accent-2' :
                    list.status === 'active' ? 'bg-status-playing/15 text-status-playing' :
                    list.status === 'paused' ? 'bg-bg-2/60 text-text-2' :
                    'bg-status-completed/15 text-status-completed'
                  }`}>
                    {list.status === 'building' && <Hammer size={15} />}
                    {list.status === 'ready' && <Play size={15} />}
                    {list.status === 'active' && <Play size={15} />}
                    {list.status === 'paused' && <Pause size={15} />}
                    {list.status === 'completed' && <CheckCircle size={15} />}
                  </div>
                  <div>
                    <p className={`text-[13px] font-semibold ${
                      list.status === 'ready' ? 'text-accent-2' :
                      list.status === 'active' ? 'text-status-playing' :
                      list.status === 'completed' ? 'text-status-completed' :
                      'text-text-1'
                    }`}>
                      {LIST_STATUS_LABELS[list.status]}
                    </p>
                    <p className="text-[10px] text-text-2">
                      {list.status === 'building' && `${list.items.length} obra${list.items.length !== 1 ? 's' : ''} adicionada${list.items.length !== 1 ? 's' : ''}`}
                      {list.status === 'ready' && 'Todas as obras definidas. Pronta para iniciar.'}
                      {list.status === 'active' && list.startedAt && `Iniciada em ${new Date(list.startedAt).toLocaleDateString('pt-BR')}`}
                      {list.status === 'paused' && `${fmtTime(list.totalTimeMs)} acumulados`}
                      {list.status === 'completed' && `Concluída em ${list.completedAt ? new Date(list.completedAt).toLocaleDateString('pt-BR') : ''} · ${fmtTime(list.totalTimeMs)}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {list.status === 'building' && (
                    <button onClick={() => markReady(list.id)} disabled={list.items.length === 0}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-card bg-accent text-bg-0 text-[13px] font-semibold hover:bg-accent-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                      <Check size={13} /> Marcar como pronta
                    </button>
                  )}
                  {list.status === 'ready' && (
                    <>
                      <button onClick={() => updateList(list.id, { status: 'building' })}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-card border border-bg-2 text-text-1 text-[13px] hover:bg-bg-2/30 transition-all">
                        <Hammer size={13} /> Voltar ao planejamento
                      </button>
                      <button onClick={() => {
                        const allObtained = list.items.filter((i) => i.role === 'principal').every((i) => i.obtained)
                        if (!allObtained) {
                          setShowStartWarning(true)
                        } else {
                          startList(list.id)
                        }
                      }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-card bg-accent text-bg-0 text-[13px] font-semibold hover:bg-accent-2 transition-all">
                        <Play size={13} /> Iniciar jornada
                      </button>
                    </>
                  )}
                  {list.status === 'active' && (
                    <>
                      <button onClick={() => pauseList(list.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-card border border-bg-2 text-text-1 text-[13px] hover:bg-bg-2/30 transition-all">
                        <Pause size={13} /> Pausar
                      </button>
                      <button onClick={() => setShowCompleteConfirm(true)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-card bg-status-completed text-bg-0 text-[13px] font-semibold hover:opacity-90 transition-all">
                        <CheckCircle size={13} /> Concluir
                      </button>
                    </>
                  )}
                  {list.status === 'paused' && (
                    <>
                      <button onClick={() => resumeList(list.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-card bg-accent text-bg-0 text-[13px] font-semibold hover:bg-accent-2 transition-all">
                        <Play size={13} /> Retomar
                      </button>
                      <button onClick={() => resetList(list.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-card border border-status-abandoned/30 text-status-abandoned text-[13px] hover:bg-status-abandoned/10 transition-all">
                        <RotateCcw size={13} /> Resetar
                      </button>
                    </>
                  )}
                  {list.status === 'completed' && (
                    <button onClick={() => resetList(list.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-card border border-bg-2 text-text-2 text-[13px] hover:bg-bg-2/30 transition-all">
                      <RotateCcw size={13} /> Resetar
                    </button>
                  )}
                </div>
              </div>

              {totalCount > 0 && list.status !== 'building' && (
                <>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex-1 h-2 rounded-full bg-bg-2/60 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{
                        width: `${pct}%`,
                        background: list.status === 'completed' ? 'var(--color-status-completed)' : 'var(--color-accent)',
                      }} />
                    </div>
                    <span className="text-[11px] font-mono text-text-2">{completedCount}/{totalCount} obras</span>
                  </div>
                  <p className="text-[10px] text-text-2/70 mt-1 text-right">
                    {pct}% concluído
                    {completedCount > 0 && (() => {
                      const zerados = list.items.filter((i) => i.role === 'principal' && i.status === 'zerado').length
                      const platinados = list.items.filter((i) => i.role === 'principal' && i.status === 'na_estante').length
                      const parts: string[] = []
                      if (zerados > 0) parts.push(`${zerados} zerado${zerados !== 1 ? 's' : ''}`)
                      if (platinados > 0) parts.push(`${platinados} platinado${platinados !== 1 ? 's' : ''}`)
                      return ` · ${parts.join(' · ')}`
                    })()}
                  </p>
                </>
              )}
            </div>
          )
        })()}

        {config.rules.length > 0 && (
          <div className="mb-6 p-4 rounded-card bg-bg-1/50 border border-bg-2/40 animate-fade-in stagger-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-2 mb-2">Regras da série</p>
            <ul className="space-y-1">
              {config.rules.map((rule) => (
                <li key={rule} className="text-[11px] text-text-1 flex items-start gap-2">
                  <span className="text-accent-2 mt-0.5">·</span>{rule}
                </li>
              ))}
            </ul>
            <p className="text-[10px] text-text-2/60 mt-3 italic">
              Feito com carinho, pode faltar ou sobrar coisa. Comenta aí o que você adicionaria.
            </p>
          </div>
        )}

        {principals.length > 0 && (
          <section className="mb-8 animate-fade-in stagger-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-text-2">
                {list.type === 'para_quem_gosta' ? 'Games' : 'Obras principais'}
                <span className="ml-2 opacity-60">({principals.length})</span>
              </h3>
              {list.status === 'building' && (
                <button onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-card bg-accent text-bg-0 text-[11px] font-semibold hover:bg-accent-2 transition-all">
                  <Plus size={12} strokeWidth={2.5} /> Adicionar obra
                </button>
              )}
            </div>
            <div className="rounded-card bg-bg-1/30 border border-bg-2/30 divide-y divide-bg-2/20">
              {principals.map((item, i) => renderItem(item, principals, i))}
            </div>
          </section>
        )}

        {upgrades.length > 0 && (
          <section className="animate-fade-in stagger-3">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-text-2 mb-3">
              Upgrades de experiência
              <span className="ml-2 opacity-60">({upgrades.length})</span>
            </h3>
            <div className="rounded-card bg-bg-1/30 border border-bg-2/30 divide-y divide-bg-2/20">
              {upgrades.map((item, i) => renderItem(item, upgrades, i))}
            </div>
          </section>
        )}

        {list.items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-bg-1 border border-bg-2/50 flex items-center justify-center mb-4">
              <Plus size={20} className="text-text-2" />
            </div>
            <p className="text-text-1 text-[13px] mb-1">Lista vazia.</p>
            <p className="text-text-2 text-[13px] mb-5">Adicione a primeira obra.</p>
            <button onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-card bg-accent text-bg-0 text-[13px] font-semibold hover:bg-accent-2 transition-all duration-200">
              <Plus size={14} /> Adicionar obra
            </button>
          </div>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="absolute inset-0 bg-bg-0/85 backdrop-blur-md animate-backdrop" />
          <div className="relative bg-bg-1 border border-bg-2/60 rounded-xl p-6 max-w-sm w-full animate-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-[15px] font-semibold mb-2">Remover obra</h3>
            <p className="text-[13px] text-text-2 mb-5">Tem certeza que deseja remover essa obra da lista?</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-card text-[13px] text-text-1 hover:bg-bg-2/30 transition-colors">
                Cancelar
              </button>
              <button onClick={() => { removeItemFromList(list.id, confirmDelete); setConfirmDelete(null); }}
                className="px-4 py-2 rounded-card bg-status-abandoned/20 text-status-abandoned text-[13px] font-semibold hover:bg-status-abandoned/30 transition-colors">
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {showCompleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCompleteConfirm(false)}>
          <div className="absolute inset-0 bg-bg-0/85 backdrop-blur-md animate-backdrop" />
          <div className="relative bg-bg-1 border border-bg-2/60 rounded-xl p-6 max-w-sm w-full animate-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-[15px] font-semibold mb-2">Concluir lista</h3>
            <p className="text-[13px] text-text-2 mb-5">Tem certeza que deseja concluir essa lista? O status de cada obra será mantido como está.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowCompleteConfirm(false)}
                className="px-4 py-2 rounded-card text-[13px] text-text-1 hover:bg-bg-2/30 transition-colors">
                Cancelar
              </button>
              <button onClick={() => { completeList(list!.id); setShowCompleteConfirm(false) }}
                className="px-4 py-2 rounded-card bg-status-completed text-bg-0 text-[13px] font-semibold hover:opacity-90 transition-colors">
                Concluir lista
              </button>
            </div>
          </div>
        </div>
      )}

      {showStartWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowStartWarning(false)}>
          <div className="absolute inset-0 bg-bg-0/85 backdrop-blur-md animate-backdrop" />
          <div className="relative bg-bg-1 border border-bg-2/60 rounded-xl p-6 max-w-sm w-full animate-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-[15px] font-semibold mb-2">Obras não adquiridas</h3>
            <p className="text-[13px] text-text-2 mb-2">
              Nem todas as obras foram marcadas como adquiridas. As obras não adquiridas ficarão desabilitadas durante a jornada.
            </p>
            <p className="text-[13px] text-text-2 mb-5">Tem certeza que deseja prosseguir mesmo assim?</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowStartWarning(false)}
                className="px-4 py-2 rounded-card text-[13px] text-text-1 hover:bg-bg-2/30 transition-colors">
                Cancelar
              </button>
              <button onClick={() => { startList(list!.id); setShowStartWarning(false) }}
                className="px-4 py-2 rounded-card bg-accent text-bg-0 text-[13px] font-semibold hover:bg-accent-2 transition-colors">
                Iniciar mesmo assim
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowEditList(false)}>
          <div className="absolute inset-0 bg-bg-0/85 backdrop-blur-md animate-backdrop" />
          <div className="relative w-full max-w-md bg-bg-1 border border-bg-2/60 rounded-xl shadow-2xl animate-modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-bg-2/40">
              <h3 className="font-display text-[15px] font-semibold">Editar lista</h3>
              <button onClick={() => setShowEditList(false)} className="p-1 text-text-2 hover:text-text-0 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-[10px] text-text-2 uppercase tracking-[0.1em] block mb-1.5">Título</label>
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-bg-0 border border-bg-2/60 rounded-card px-3 py-2.5 text-[13px] text-text-0 focus:outline-none focus:border-accent/40" />
              </div>
              <div>
                <label className="text-[10px] text-text-2 uppercase tracking-[0.1em] block mb-1.5">Tema</label>
                <input type="text" value={editTheme} onChange={(e) => setEditTheme(e.target.value)}
                  placeholder="Ex: Yakuza, Samurai..."
                  className="w-full bg-bg-0 border border-bg-2/60 rounded-card px-3 py-2.5 text-[13px] text-text-0 placeholder:text-text-2 focus:outline-none focus:border-accent/40" />
              </div>
              <div>
                <label className="text-[10px] text-text-2 uppercase tracking-[0.1em] block mb-1.5">Descrição</label>
                <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={2}
                  placeholder="Do que se trata essa lista?"
                  className="w-full bg-bg-0 border border-bg-2/60 rounded-card px-3 py-2.5 text-[13px] text-text-0 placeholder:text-text-2 resize-none focus:outline-none focus:border-accent/40" />
              </div>
              <div>
                <label className="text-[10px] text-text-2 uppercase tracking-[0.1em] block mb-1.5">Capa da lista</label>
                <div
                  className="relative w-full h-32 rounded-card bg-bg-0 border border-bg-2/60 overflow-hidden cursor-pointer group"
                  onClick={() => editCoverRef.current?.click()}
                >
                  {editCoverUrl ? (
                    <img src={editCoverUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      <Camera size={20} className="text-text-2" />
                      <span className="text-[11px] text-text-2">Clique para enviar uma imagem</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-bg-0/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={16} className="text-text-0" />
                  </div>
                </div>
                <input ref={editCoverRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) { setEditCoverFile(f); setEditCoverUrl(URL.createObjectURL(f)) }
                  }} />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowEditList(false)}
                  className="flex-1 py-2.5 rounded-card border border-bg-2 text-[13px] text-text-1 hover:bg-bg-2/30 transition-colors">
                  Cancelar
                </button>
                <button onClick={async () => {
                  let coverUrl = editCoverUrl
                  if (editCoverFile) {
                    const uploaded = await uploadImage(editCoverFile, 'avatars', `lists/${list!.id}`)
                    if (uploaded) coverUrl = uploaded
                  }
                  updateList(list!.id, {
                    title: editTitle.trim() || list!.title,
                    description: editDescription.trim(),
                    theme: editTheme.trim(),
                    coverUrl: coverUrl || undefined,
                  })
                  setEditCoverFile(null)
                  setShowEditList(false)
                }}
                  className="flex-1 py-2.5 rounded-card bg-accent text-bg-0 text-[13px] font-semibold hover:bg-accent-2 transition-all">
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteListConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteListConfirm(false)}>
          <div className="absolute inset-0 bg-bg-0/85 backdrop-blur-md animate-backdrop" />
          <div className="relative w-full max-w-sm bg-bg-1 border border-bg-2/60 rounded-xl shadow-2xl p-6 animate-modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-status-abandoned/15 text-status-abandoned shrink-0">
                <Trash2 size={16} />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-text-0">Deletar lista?</p>
                <p className="text-[12px] text-text-2 mt-0.5">Essa ação não pode ser desfeita.</p>
              </div>
            </div>
            <p className="text-[13px] text-text-1 mb-6">
              A lista <span className="font-semibold text-text-0">"{list.title}"</span> e todas as suas obras serão removidas permanentemente.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteListConfirm(false)}
                className="flex-1 py-2.5 rounded-card border border-bg-2 text-text-1 text-[13px] hover:bg-bg-2/30 transition-all">
                Cancelar
              </button>
              <button onClick={() => { deleteList(list.id); navigate('/listas') }}
                className="flex-1 py-2.5 rounded-card bg-status-abandoned/15 text-status-abandoned border border-status-abandoned/30 text-[13px] font-semibold hover:bg-status-abandoned/25 transition-all">
                Deletar
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] p-4" onClick={() => setShowAddModal(false)}>
          <div className="absolute inset-0 bg-bg-0/85 backdrop-blur-md animate-backdrop" />
          <div className="relative w-full max-w-lg bg-bg-1 border border-bg-2/60 rounded-xl shadow-2xl overflow-hidden animate-modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-4 border-b border-bg-2/40">
              <Search size={15} className="text-text-2 shrink-0" />
              <input type="text" value={addQuery} onChange={(e) => setAddQuery(e.target.value)}
                placeholder="Buscar obra para adicionar..."
                className="flex-1 bg-transparent py-4 text-[13px] text-text-0 placeholder:text-text-2 focus:outline-none" autoFocus />
              <button onClick={() => setShowAddModal(false)} className="p-1 text-text-2 hover:text-text-0 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex gap-2 px-4 py-3 border-b border-bg-2/30">
              <button onClick={() => setAddRole('principal')}
                className={`text-[11px] font-medium px-3 py-1.5 rounded-full transition-all ${addRole === 'principal' ? 'bg-accent/12 text-accent-2 ring-1 ring-accent/20' : 'text-text-2 hover:bg-bg-2/30'}`}>
                Principal
              </button>
              <button onClick={() => setAddRole('upgrade')}
                className={`text-[11px] font-medium px-3 py-1.5 rounded-full transition-all ${addRole === 'upgrade' ? 'bg-accent/12 text-accent-2 ring-1 ring-accent/20' : 'text-text-2 hover:bg-bg-2/30'}`}>
                Upgrade de experiência
              </button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto py-2">
              {addResults.map((item) => {
                const Icon = KIND_ICON[item.kind] ?? Gamepad2
                return (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-bg-2/30 transition-colors">
                    <div className="w-8 h-11 rounded-[4px] overflow-hidden bg-bg-2 shrink-0">
                      <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-text-0 truncate">{item.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Icon size={10} className="text-text-2" />
                        {item.platform && <span className="text-[10px] font-mono text-text-2/70">{item.platform}</span>}
                      </div>
                    </div>
                    <button onClick={() => handleAddItem(item)}
                      className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-full bg-accent/15 text-accent-2 hover:bg-accent/25 transition-colors">
                      <Plus size={12} /> Adicionar
                    </button>
                  </div>
                )
              })}
            </div>
            <div className="px-4 py-2.5 border-t border-bg-2/30 text-[10px] text-text-2 flex items-center gap-3">
              <kbd className="font-mono px-1.5 py-0.5 rounded-[6px] bg-bg-0/80 border border-bg-2/60">esc</kbd>
              <span>para fechar</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
