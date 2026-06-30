import { useState, useRef } from 'react'
import { X, Camera } from 'lucide-react'
import { LIST_TYPES, type ListType, type UserList } from '../data/list-rules'
import { uploadImage } from '../lib/storage'
import { useAuth } from '../context/AuthContext'

interface Props {
  onClose: () => void
  onCreate: (list: UserList) => void
}

export default function CreateListModal({ onClose, onCreate }: Props) {
  const { user } = useAuth()
  const [step, setStep] = useState<'type' | 'details'>('type')
  const [selectedType, setSelectedType] = useState<ListType | null>(null)
  const [title, setTitle] = useState('')
  const [theme, setTheme] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<'private' | 'public'>('private')
  const [coverPreview, setCoverPreview] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const coverRef = useRef<HTMLInputElement>(null)

  const config = selectedType ? LIST_TYPES.find((t) => t.type === selectedType) : null

  function handleSelectType(type: ListType) {
    setSelectedType(type)
    setTitle(type === 'revisitando_infancia' ? 'Revisitando a Infância' : '')
    setStep('details')
  }

  async function handleCreate() {
    if (!selectedType || !title.trim()) return
    setSaving(true)

    let coverUrl: string | undefined
    if (coverFile) {
      const uploaded = await uploadImage(coverFile, 'avatars', `lists/new-${Date.now()}`)
      if (uploaded) coverUrl = uploaded
    }

    const newList: UserList = {
      id: `list-${Date.now()}`,
      ownerId: user?.id ?? 'current-user',
      type: selectedType,
      title: title.trim(),
      description: description.trim(),
      theme: theme.trim(),
      visibility,
      coverUrl,
      likeCount: 0,
      status: 'building',
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    onCreate(newList)
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-bg-0/85 backdrop-blur-md animate-backdrop" />
      <div
        className="relative w-full max-w-md bg-bg-1 border border-bg-2 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-bg-2">
          <h3 className="font-display text-base font-semibold">
            {step === 'type' ? 'Escolha o tipo da lista' : 'Detalhes da lista'}
          </h3>
          <button onClick={onClose} className="p-1 text-text-2 hover:text-text-0 transition-colors">
            <X size={18} />
          </button>
        </div>

        {step === 'type' ? (
          <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
            {LIST_TYPES.map((lt) => (
              <button
                key={lt.type}
                onClick={() => handleSelectType(lt.type)}
                className="w-full text-left p-4 rounded-card border border-bg-2 hover:border-accent/30 hover:bg-bg-2/30 transition-all"
              >
                <p className="text-sm font-semibold text-text-0">{lt.label}</p>
                <p className="text-[11px] text-text-2 mt-1">{lt.description}</p>
                {lt.rules.length > 0 && (
                  <div className="mt-2 space-y-0.5">
                    {lt.rules.slice(0, 2).map((r) => (
                      <p key={r} className="text-[10px] text-text-2 flex items-start gap-1.5">
                        <span className="text-accent-2">·</span> {r}
                      </p>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="px-3 py-2 rounded-card bg-accent/8 border border-accent/20">
              <p className="text-[11px] text-accent-2 font-medium">{config?.label}</p>
            </div>

            <div>
              <label className="text-[11px] font-medium text-text-2 block mb-1.5">Título</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  selectedType === 'correndo_atras'
                    ? 'Correndo Atrás: Nome da Franquia'
                    : selectedType === 'para_quem_gosta'
                      ? 'Para Quem Gosta De: Tema'
                      : 'Nome da sua lista'
                }
                className="w-full bg-bg-0 border border-bg-2 rounded-card px-3 py-2.5 text-sm text-text-0 placeholder:text-text-2 focus:outline-none focus:border-accent/40 transition-colors"
              />
            </div>

            {config?.requiresTheme && (
              <div>
                <label className="text-[11px] font-medium text-text-2 block mb-1.5">
                  Tema (franquia ou assunto)
                </label>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="Ex: Yakuza, Samurai, Metroidvania..."
                  className="w-full bg-bg-0 border border-bg-2 rounded-card px-3 py-2.5 text-sm text-text-0 placeholder:text-text-2 focus:outline-none focus:border-accent/40 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="text-[11px] font-medium text-text-2 block mb-1.5">
                Descrição (opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Do que se trata essa lista?"
                rows={2}
                className="w-full bg-bg-0 border border-bg-2 rounded-card px-3 py-2.5 text-sm text-text-0 placeholder:text-text-2 resize-none focus:outline-none focus:border-accent/40 transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-text-2 block mb-1.5">
                Capa da lista
              </label>
              <div
                className="relative w-full h-28 rounded-card bg-bg-0 border border-bg-2 overflow-hidden cursor-pointer group"
                onClick={() => coverRef.current?.click()}
              >
                {coverPreview ? (
                  <img src={coverPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
                    <Camera size={18} className="text-text-2" />
                    <span className="text-[10px] text-text-2">Clique para enviar</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-bg-0/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={14} className="text-text-0" />
                </div>
              </div>
              <input ref={coverRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)) }
                }} />
            </div>

            <div>
              <label className="text-[11px] font-medium text-text-2 block mb-1.5">
                Visibilidade
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setVisibility('private')}
                  className={`flex-1 text-[11px] font-medium py-2 rounded-card border transition-colors ${
                    visibility === 'private'
                      ? 'border-accent/40 bg-accent/8 text-accent-2'
                      : 'border-bg-2 text-text-2 hover:border-text-2/30'
                  }`}
                >
                  Privada
                </button>
                <button
                  onClick={() => setVisibility('public')}
                  className={`flex-1 text-[11px] font-medium py-2 rounded-card border transition-colors ${
                    visibility === 'public'
                      ? 'border-accent/40 bg-accent/8 text-accent-2'
                      : 'border-bg-2 text-text-2 hover:border-text-2/30'
                  }`}
                >
                  Pública
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStep('type')}
                className="flex-1 py-2.5 rounded-card border border-bg-2 text-sm text-text-1 hover:bg-bg-2/30 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleCreate}
                disabled={!title.trim() || saving}
                className="flex-1 py-2.5 rounded-card bg-accent text-bg-0 text-sm font-medium hover:bg-accent-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? 'Criando...' : 'Criar lista'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
