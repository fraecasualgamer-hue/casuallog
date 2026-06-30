import { useState, useRef } from 'react'
import { Camera, AlertTriangle, Check, ArrowRight, ArrowLeft } from 'lucide-react'
import { useAuth, isUnderage } from '../context/AuthContext'
import { uploadProfileImage } from '../lib/storage'

type Step = 'name' | 'birth' | 'photo'

export default function OnboardingFlow() {
  const { user, profile, updateProfile, checkUsername, signOut } = useAuth()
  const [step, setStep] = useState<Step>('name')
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [username, setUsername] = useState(profile?.username ?? '')
  const [usernameError, setUsernameError] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [birthError, setBirthError] = useState('')
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url ?? user?.user_metadata?.avatar_url ?? '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleNameNext() {
    if (!displayName.trim() || !username.trim()) return
    const handle = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
    if (handle.length < 3) {
      setUsernameError('Mínimo 3 caracteres')
      return
    }
    const available = await checkUsername(handle)
    if (!available) {
      setUsernameError('Esse nome já está em uso')
      return
    }
    setUsername(handle)
    setUsernameError('')
    setStep('birth')
  }

  function handleBirthNext() {
    if (!birthdate) {
      setBirthError('Informe sua data de nascimento')
      return
    }
    if (isUnderage(birthdate)) {
      setBirthError('O CasualLog é para pessoas com 14 anos ou mais.')
      return
    }
    setBirthError('')
    setStep('photo')
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleFinish() {
    if (!user) return
    setSaving(true)

    let avatarUrl = avatarPreview
    if (avatarFile) {
      const uploaded = await uploadProfileImage(user.id, avatarFile, 'avatar')
      if (uploaded) avatarUrl = uploaded
    }

    await updateProfile({
      display_name: displayName.trim(),
      username: username.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
      birthdate,
      avatar_url: avatarUrl || null,
      onboarded: true,
    } as any)

    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-bg-0 flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center">
              <span className="font-display text-xl font-bold text-bg-0">C</span>
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight mb-1">
            {step === 'name' && 'Como quer ser chamado?'}
            {step === 'birth' && 'Quando você nasceu?'}
            {step === 'photo' && 'Escolha sua foto'}
          </h1>
          <p className="text-text-2 text-[13px]">
            {step === 'name' && 'Seu nome e seu @. Pode mudar depois.'}
            {step === 'birth' && 'Precisamos confirmar sua idade.'}
            {step === 'photo' && 'A cara do seu perfil no CasualLog.'}
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          {(['name', 'birth', 'photo'] as Step[]).map((s) => (
            <div
              key={s}
              className={`h-1 rounded-full transition-all duration-300 ${
                s === step ? 'w-10 bg-accent' : 'w-6 bg-bg-2'
              }`}
            />
          ))}
        </div>

        {step === 'name' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="text-[11px] text-text-2 block mb-1.5">Nome de exibição</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Seu nome ou apelido"
                className="w-full bg-bg-1 border border-bg-2/60 rounded-card px-4 py-3 text-[14px] text-text-0 placeholder:text-text-2 focus:outline-none focus:border-accent/40 transition-colors"
                autoFocus
              />
            </div>
            <div>
              <label className="text-[11px] text-text-2 block mb-1.5">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-2 text-[14px]">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                    setUsernameError('')
                  }}
                  placeholder="seuuser"
                  className="w-full bg-bg-1 border border-bg-2/60 rounded-card pl-9 pr-4 py-3 text-[14px] text-text-0 placeholder:text-text-2 focus:outline-none focus:border-accent/40 transition-colors"
                />
              </div>
              {usernameError && (
                <p className="text-[11px] text-status-abandoned mt-1.5 flex items-center gap-1">
                  <AlertTriangle size={11} /> {usernameError}
                </p>
              )}
            </div>
            <button
              onClick={handleNameNext}
              disabled={!displayName.trim() || !username.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-card bg-accent text-bg-0 text-[13px] font-semibold hover:bg-accent-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-6"
            >
              Continuar <ArrowRight size={14} />
            </button>
          </div>
        )}

        {step === 'birth' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="text-[11px] text-text-2 block mb-1.5">Data de nascimento</label>
              <input
                type="date"
                value={birthdate}
                onChange={(e) => { setBirthdate(e.target.value); setBirthError('') }}
                className="w-full bg-bg-1 border border-bg-2/60 rounded-card px-4 py-3 text-[14px] text-text-0 focus:outline-none focus:border-accent/40 transition-colors [color-scheme:dark]"
                autoFocus
              />
              {birthError && (
                <div className={`mt-3 p-3 rounded-card border ${
                  birthError.includes('14') ? 'bg-status-abandoned/10 border-status-abandoned/30' : 'bg-bg-1 border-bg-2'
                }`}>
                  <p className={`text-[12px] flex items-center gap-1.5 ${
                    birthError.includes('14') ? 'text-status-abandoned' : 'text-text-2'
                  }`}>
                    <AlertTriangle size={13} /> {birthError}
                  </p>
                  {birthError.includes('14') && (
                    <button
                      onClick={signOut}
                      className="mt-2 text-[11px] text-text-2 hover:text-text-1 transition-colors"
                    >
                      Sair da conta
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setStep('name')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-card border border-bg-2 text-text-1 text-[13px] hover:bg-bg-2/30 transition-all"
              >
                <ArrowLeft size={14} /> Voltar
              </button>
              <button
                onClick={handleBirthNext}
                disabled={!birthdate}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-card bg-accent text-bg-0 text-[13px] font-semibold hover:bg-accent-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continuar <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {step === 'photo' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col items-center">
              <div
                className="relative w-28 h-28 rounded-full bg-bg-1 border-2 border-bg-2 overflow-hidden cursor-pointer group"
                onClick={() => fileRef.current?.click()}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera size={32} className="text-text-2" />
                  </div>
                )}
                <div className="absolute inset-0 bg-bg-0/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={20} className="text-text-0" />
                </div>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="mt-3 text-[12px] text-accent-2 hover:text-accent transition-colors"
              >
                {avatarPreview ? 'Trocar foto' : 'Escolher foto'}
              </button>
              {!avatarPreview && (
                <p className="text-[11px] text-text-2 mt-1">Ou continue sem foto por enquanto.</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep('birth')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-card border border-bg-2 text-text-1 text-[13px] hover:bg-bg-2/30 transition-all"
              >
                <ArrowLeft size={14} /> Voltar
              </button>
              <button
                onClick={handleFinish}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-card bg-accent text-bg-0 text-[13px] font-semibold hover:bg-accent-2 transition-all disabled:opacity-60"
              >
                {saving ? 'Salvando...' : (
                  <><Check size={14} /> Entrar no CasualLog</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
