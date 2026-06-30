import { useState } from 'react'
import { ArrowLeft, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { useClan } from '../context/ClanContext'
import { CLAN_ACHIEVEMENTS, type Clan, type JoinMode } from '../data/clan-data'

const ACCENT_OPTIONS = ['#22b885', '#e8764b', '#5889b5', '#e8a948', '#a05252', '#7c5cbf', '#5cad7f', '#c97dab', '#6e8fa5']

export default function CreateClanPage() {
  const navigate = useNavigate()
  const { createClan } = useClan()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [accent, setAccent] = useState('#22b885')
  const [joinMode, setJoinMode] = useState<JoinMode>('approval')

  function handleCreate() {
    if (!name.trim()) return
    const newClan: Clan = {
      id: `clan-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      avatarUrl: null,
      bannerUrl: null,
      accent,
      leaderId: 'community-frae',
      joinMode,
      memberLimit: 10,
      memberCount: 1,
      xp: 0,
      level: 1,
      members: [{
        userId: 'community-frae',
        username: 'fraecasual',
        displayName: 'Frae Casual',
        avatarUrl: null,
        role: 'leader',
        joinedAt: new Date().toISOString().split('T')[0],
        gamesCompleted: 0,
        objectivesCompleted: 0,
        streak: 0,
      }],
      objectives: [],
      wall: [],
      achievements: CLAN_ACHIEVEMENTS.map((a) => ({ ...a, earned: a.code === 'clan_formed' })),
      createdAt: new Date().toISOString().split('T')[0],
    }
    createClan(newClan)
    navigate(`/clans/${newClan.id}`)
  }

  return (
    <>
      <TopBar title="Criar clã" />
      <div className="p-8 max-w-lg animate-fade-in">
        <button onClick={() => navigate('/clans')} className="flex items-center gap-1.5 text-[12px] text-text-2 hover:text-text-1 transition-colors mb-6">
          <ArrowLeft size={14} /> Voltar para clãs
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${accent}20` }}>
            <Shield size={24} style={{ color: accent }} />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">Criar um clã</h2>
            <p className="text-[12px] text-text-2">Um grupo para correr atrás junto.</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-[10px] text-text-2 uppercase tracking-[0.1em] block mb-1.5">Nome do clã</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Souls Veterans, JRPG Nights..."
              className="w-full bg-bg-1 border border-bg-2/60 rounded-card px-4 py-3 text-[14px] text-text-0 placeholder:text-text-2 focus:outline-none focus:border-accent/40" />
          </div>

          <div>
            <label className="text-[10px] text-text-2 uppercase tracking-[0.1em] block mb-1.5">Descrição</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} maxLength={200}
              placeholder="Do que se trata esse clã?"
              className="w-full bg-bg-1 border border-bg-2/60 rounded-card px-4 py-3 text-[13px] text-text-0 placeholder:text-text-2 resize-none focus:outline-none focus:border-accent/40" />
            <p className="text-[10px] text-text-2/50 text-right mt-0.5">{description.length}/200</p>
          </div>

          <div>
            <label className="text-[10px] text-text-2 uppercase tracking-[0.1em] block mb-2">Cor do clã</label>
            <div className="flex gap-2 flex-wrap">
              {ACCENT_OPTIONS.map((c) => (
                <button key={c} onClick={() => setAccent(c)}
                  className={`w-8 h-8 rounded-full transition-all ${accent === c ? 'ring-2 ring-offset-2 ring-offset-bg-1' : 'hover:scale-110'}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-text-2 uppercase tracking-[0.1em] block mb-2">Modo de entrada</label>
            <div className="flex gap-2">
              <button onClick={() => setJoinMode('approval')}
                className={`flex-1 py-3 rounded-card border text-[12px] font-medium transition-all ${
                  joinMode === 'approval' ? 'border-accent/40 bg-accent/8 text-accent-2' : 'border-bg-2 text-text-2 hover:border-text-2/30'
                }`}>
                Com aprovação
              </button>
              <button onClick={() => setJoinMode('open')}
                className={`flex-1 py-3 rounded-card border text-[12px] font-medium transition-all ${
                  joinMode === 'open' ? 'border-accent/40 bg-accent/8 text-accent-2' : 'border-bg-2 text-text-2 hover:border-text-2/30'
                }`}>
                Aberto
              </button>
            </div>
          </div>

          <button onClick={handleCreate} disabled={!name.trim()}
            className="w-full py-3 rounded-card bg-accent text-bg-0 text-[13px] font-semibold hover:bg-accent-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-4">
            Criar clã
          </button>
        </div>
      </div>
    </>
  )
}
