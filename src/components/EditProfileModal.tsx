import { useState, useRef } from 'react'
import { X, Camera, Check, Globe } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { uploadProfileImage } from '../lib/storage'

function IconX({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
}
function IconDiscord({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.1.135 18.115a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  )
}
function IconSteam({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.455 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.252 0-2.265-1.014-2.265-2.265z"/>
    </svg>
  )
}

const GENRE_OPTIONS = [
  'Ação', 'Aventura', 'RPG', 'JRPG', 'Souls-like', 'Metroidvania',
  'Plataforma', 'Puzzle', 'Terror', 'Simulação', 'Estratégia',
  'Visual Novel', 'Roguelike', 'Indie', 'FPS', 'Luta',
]

const PLATFORM_OPTIONS = [
  'PC', 'PS5', 'PS4', 'Xbox Series', 'Xbox One', 'Switch', 'Steam Deck',
  'Mobile', 'PS3', 'PS2', 'PS1', 'SNES', 'N64', 'GBA', 'DS', '3DS',
]

const ACCENT_OPTIONS = [
  '#22b885', '#e8764b', '#5889b5', '#e8a948', '#a05252',
  '#7c5cbf', '#5cad7f', '#c97dab', '#6e8fa5',
]

interface Props {
  onClose: () => void
}

export default function EditProfileModal({ onClose }: Props) {
  const { user, profile, updateProfile } = useAuth()
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [accent, setAccent] = useState(profile?.accent ?? '#22b885')
  const [genres, setGenres] = useState<string[]>(profile?.favorite_genres ?? [])
  const [platforms, setPlatforms] = useState<string[]>(profile?.favorite_platforms ?? [])
  const [isPrivate, setIsPrivate] = useState(profile?.is_private ?? false)
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url ?? '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState(profile?.banner_url ?? '')
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [socialWebsite, setSocialWebsite] = useState(profile?.social_links?.website ?? '')
  const [socialDiscord, setSocialDiscord] = useState(profile?.social_links?.discord ?? '')
  const [socialSteam, setSocialSteam] = useState(profile?.social_links?.steam ?? '')
  const [socialX, setSocialX] = useState(profile?.social_links?.twitter_x ?? '')
  const [saving, setSaving] = useState(false)
  const avatarRef = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)

  function toggleItem(arr: string[], item: string, setter: (v: string[]) => void) {
    setter(arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item])
  }

  async function handleSave() {
    if (!user) return
    setSaving(true)

    let avatarUrl = avatarPreview
    let bannerUrl = bannerPreview

    if (avatarFile) {
      const uploaded = await uploadProfileImage(user.id, avatarFile, 'avatar')
      if (uploaded) avatarUrl = uploaded
    }
    if (bannerFile) {
      const uploaded = await uploadProfileImage(user.id, bannerFile, 'banner')
      if (uploaded) bannerUrl = uploaded
    }

    await updateProfile({
      display_name: displayName.trim() || null,
      bio: bio.trim() || null,
      avatar_url: avatarUrl || null,
      banner_url: bannerUrl || null,
      accent,
      favorite_genres: genres,
      favorite_platforms: platforms,
      is_private: isPrivate,
      social_links: {
        website:   socialWebsite.trim()  || undefined,
        discord:   socialDiscord.trim()  || undefined,
        steam:     socialSteam.trim()    || undefined,
        twitter_x: socialX.trim()        || undefined,
      },
    })

    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-bg-0/85 backdrop-blur-md animate-backdrop" />
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-bg-1 border border-bg-2/60 rounded-xl shadow-2xl animate-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-bg-2/40 sticky top-0 bg-bg-1 z-10">
          <h3 className="font-display text-[15px] font-semibold">Editar perfil</h3>
          <button onClick={onClose} className="p-1 text-text-2 hover:text-text-0 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <div>
            <label className="text-[10px] text-text-2 uppercase tracking-[0.1em] block mb-2">Banner</label>
            <div
              className="relative aspect-[16/5] rounded-card bg-bg-2 overflow-hidden cursor-pointer group"
              onClick={() => bannerRef.current?.click()}
            >
              {bannerPreview ? (
                <img src={bannerPreview} alt="" className="w-full h-full object-cover object-center" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera size={20} className="text-text-2" />
                </div>
              )}
              <div className="absolute inset-0 bg-bg-0/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={16} className="text-text-0" />
              </div>
            </div>
            <input ref={bannerRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) { setBannerFile(f); setBannerPreview(URL.createObjectURL(f)) }
              }} />
          </div>

          <div className="flex items-end gap-4 -mt-12 px-2 relative z-10">
            <div
              className="relative w-20 h-20 rounded-full bg-bg-1 border-4 border-bg-1 overflow-hidden cursor-pointer group shrink-0"
              onClick={() => avatarRef.current?.click()}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-bg-2 flex items-center justify-center">
                  <Camera size={20} className="text-text-2" />
                </div>
              )}
              <div className="absolute inset-0 bg-bg-0/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={14} className="text-text-0" />
              </div>
            </div>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)) }
              }} />
          </div>

          <div>
            <label className="text-[10px] text-text-2 uppercase tracking-[0.1em] block mb-1.5">Nome</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-bg-0 border border-bg-2/60 rounded-card px-3 py-2.5 text-[13px] text-text-0 focus:outline-none focus:border-accent/40" />
          </div>

          <div>
            <label className="text-[10px] text-text-2 uppercase tracking-[0.1em] block mb-1.5">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} maxLength={160}
              placeholder="Fale sobre você em uma frase..."
              className="w-full bg-bg-0 border border-bg-2/60 rounded-card px-3 py-2.5 text-[13px] text-text-0 placeholder:text-text-2 resize-none focus:outline-none focus:border-accent/40" />
            <p className="text-[10px] text-text-2/50 text-right mt-0.5">{bio.length}/160</p>
          </div>

          <div>
            <label className="text-[10px] text-text-2 uppercase tracking-[0.1em] block mb-2">Cor de acento</label>
            <div className="flex gap-2 flex-wrap">
              {ACCENT_OPTIONS.map((c) => (
                <button key={c} onClick={() => setAccent(c)}
                  className={`w-8 h-8 rounded-full transition-all ${accent === c ? 'ring-2 ring-offset-2 ring-offset-bg-1' : 'hover:scale-110'}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-text-2 uppercase tracking-[0.1em] block mb-2">Gêneros favoritos</label>
            <div className="flex flex-wrap gap-1.5">
              {GENRE_OPTIONS.map((g) => (
                <button key={g} onClick={() => toggleItem(genres, g, setGenres)}
                  className={`text-[11px] px-2.5 py-1.5 rounded-full transition-all ${
                    genres.includes(g) ? 'bg-accent/12 text-accent-2 ring-1 ring-accent/20' : 'bg-bg-0 text-text-2 hover:text-text-1'
                  }`}>
                  {genres.includes(g) && <Check size={10} className="inline mr-1" />}{g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-text-2 uppercase tracking-[0.1em] block mb-2">Plataformas</label>
            <div className="flex flex-wrap gap-1.5">
              {PLATFORM_OPTIONS.map((p) => (
                <button key={p} onClick={() => toggleItem(platforms, p, setPlatforms)}
                  className={`text-[11px] px-2.5 py-1.5 rounded-full transition-all ${
                    platforms.includes(p) ? 'bg-accent/12 text-accent-2 ring-1 ring-accent/20' : 'bg-bg-0 text-text-2 hover:text-text-1'
                  }`}>
                  {platforms.includes(p) && <Check size={10} className="inline mr-1" />}{p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-text-2 uppercase tracking-[0.1em] block mb-3">Redes sociais</label>
            <div className="space-y-2.5">
              {[
                { icon: <Globe size={14} className="text-text-2" />, label: 'Site', value: socialWebsite, set: setSocialWebsite, placeholder: 'https://seusite.com' },
                { icon: <IconDiscord size={14} />, label: 'Discord', value: socialDiscord, set: setSocialDiscord, placeholder: 'ID de usuário ou servidor' },
                { icon: <IconSteam size={14} />, label: 'Steam', value: socialSteam, set: setSocialSteam, placeholder: 'Nome de usuário Steam' },
                { icon: <IconX size={14} />, label: 'X', value: socialX, set: setSocialX, placeholder: '@usuario' },
              ].map(({ icon, label, value, set, placeholder }) => (
                <div key={label} className="flex items-center gap-2.5 bg-bg-0 border border-bg-2/60 rounded-card px-3 py-2 focus-within:border-accent/40 transition-colors">
                  <span className="text-text-2 shrink-0">{icon}</span>
                  <span className="text-[11px] text-text-2/60 w-14 shrink-0">{label}</span>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent text-[13px] text-text-0 placeholder:text-text-2/30 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-card bg-bg-0 border border-bg-2/40">
            <div>
              <p className="text-[13px] font-medium">Perfil privado</p>
              <p className="text-[10px] text-text-2">Só amigos veem seu backlog completo.</p>
            </div>
            <button onClick={() => setIsPrivate(!isPrivate)}
              className={`w-10 h-6 rounded-full transition-colors relative ${isPrivate ? 'bg-accent' : 'bg-bg-2'}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isPrivate ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-card border border-bg-2 text-[12px] text-text-1 hover:bg-bg-2/30 transition-colors">
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2.5 rounded-card bg-accent text-bg-0 text-[12px] font-semibold hover:bg-accent-2 transition-all disabled:opacity-60">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
