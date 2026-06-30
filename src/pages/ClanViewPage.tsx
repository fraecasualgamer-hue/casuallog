import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Shield, Users, Trophy, Crown, Star, User, Lock, MessageSquare, Target } from 'lucide-react'
import TopBar from '../components/TopBar'
import { useClan } from '../context/ClanContext'

type Tab = 'objetivos' | 'membros' | 'mural' | 'conquistas'

const REACTION_OPTIONS = ['🔥', '⚔️', '💀', '🎉', '💎', '🏆', '👀', '❤️']

export default function ClanViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getClan, addWallPost, toggleReaction, leaveClan } = useClan()
  const [tab, setTab] = useState<Tab>('objetivos')
  const [newPost, setNewPost] = useState('')
  const [showReactions, setShowReactions] = useState<string | null>(null)

  const clanData = getClan(id ?? '')
  if (!clanData) {
    return (
      <>
        <TopBar title="Clã" />
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-text-2">Clã não encontrado.</p>
        </div>
      </>
    )
  }

  const clan = clanData
  const isMember = clan.members.some((m) => m.userId === 'community-frae')
  const isLeader = clan.leaderId === 'community-frae'
  const wallUnlocked = clan.achievements.find((a) => a.code === 'first_journey')?.earned ?? false

  function handlePost() {
    if (!newPost.trim()) return
    addWallPost(clan.id, {
      id: `wp-${Date.now()}`,
      userId: 'community-frae',
      username: 'fraecasual',
      displayName: 'Frae Casual',
      avatarUrl: null,
      body: newPost.trim(),
      type: 'post',
      reactions: [],
      createdAt: new Date().toISOString(),
    })
    setNewPost('')
  }

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
  }

  const tabs: { key: Tab; label: string; icon: typeof Target; count?: number }[] = [
    { key: 'objetivos', label: 'Objetivos', icon: Target, count: clan.objectives.length },
    { key: 'membros', label: 'Membros', icon: Users, count: clan.memberCount },
    { key: 'mural', label: 'Mural', icon: MessageSquare, count: clan.wall.length },
    { key: 'conquistas', label: 'Conquistas', icon: Trophy },
  ]

  return (
    <>
      <TopBar title={clan.name} />
      <div className="animate-fade-in">
        <div className="relative">
          <div className="h-32 w-full" style={{
            background: clan.bannerUrl ? `url(${clan.bannerUrl}) center/cover` : `linear-gradient(135deg, ${clan.accent}22, ${clan.accent}08)`,
          }} />
          <div className="absolute -bottom-8 left-8">
            <div className="w-16 h-16 rounded-2xl border-4 border-bg-0 flex items-center justify-center" style={{ background: `${clan.accent}25` }}>
              <Shield size={28} style={{ color: clan.accent }} />
            </div>
          </div>
        </div>

        <div className="px-8 pt-12 pb-2">
          <button onClick={() => navigate('/clans')} className="flex items-center gap-1.5 text-[12px] text-text-2 hover:text-text-1 transition-colors mb-4">
            <ArrowLeft size={14} /> Voltar para clãs
          </button>

          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold">{clan.name}</h2>
              <p className="text-[13px] text-text-2 mt-1 max-w-lg">{clan.description}</p>
              <div className="flex items-center gap-5 mt-3 text-[11px] text-text-2">
                <span className="flex items-center gap-1"><Users size={13} /> {clan.memberCount}/{clan.memberLimit}</span>
                <span className="flex items-center gap-1"><Trophy size={13} /> Nível {clan.level}</span>
                <span className="font-mono">{clan.xp} XP</span>
                <span className="flex items-center gap-1">{clan.joinMode === 'approval' ? <><Lock size={11} /> Com aprovação</> : 'Aberto'}</span>
              </div>
            </div>
            {isMember && !isLeader && (
              <button onClick={() => leaveClan(clan.id)}
                className="text-[11px] px-3 py-1.5 rounded-card border border-bg-2 text-text-2 hover:border-status-abandoned/40 hover:text-status-abandoned transition-all">
                Sair do clã
              </button>
            )}
          </div>

          <div className="flex gap-1 border-b border-bg-2/30 mb-6">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`relative flex items-center gap-1.5 px-4 py-3 text-[12px] font-medium transition-all ${
                  tab === t.key ? 'text-accent-2' : 'text-text-2 hover:text-text-1'
                }`}>
                <t.icon size={14} />
                {t.label}
                {t.count != null && <span className="text-[10px] opacity-60">{t.count}</span>}
                {tab === t.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />}
              </button>
            ))}
          </div>
        </div>

        <div className="px-8 pb-8">
          {tab === 'objetivos' && (
            <div className="space-y-4">
              {clan.objectives.length === 0 ? (
                <p className="text-[13px] text-text-2 text-center py-12">Nenhum objetivo definido ainda.</p>
              ) : clan.objectives.map((obj) => {
                const totalMembers = clan.memberCount
                const allCompleted = obj.items.every((item) => item.completedBy.length >= totalMembers)
                return (
                  <div key={obj.id} className="rounded-card bg-bg-1/50 border border-bg-2/40 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-[15px] font-semibold">{obj.title}</h4>
                        {obj.deadline && <p className="text-[10px] text-text-2 mt-0.5">Prazo: {fmtDate(obj.deadline)}</p>}
                      </div>
                      {allCompleted && <span className="text-[10px] px-2.5 py-1 rounded-full bg-status-completed/15 text-status-completed font-semibold">Completo</span>}
                    </div>
                    <div className="space-y-3">
                      {obj.items.map((item) => {
                        const pct = totalMembers > 0 ? Math.round((item.completedBy.length / totalMembers) * 100) : 0
                        return (
                          <div key={item.id} className="flex items-center gap-4">
                            <div className="w-10 h-14 rounded-[8px] overflow-hidden bg-bg-2 shrink-0 ring-1 ring-white/[0.04]">
                              <img src={item.coverUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-medium truncate">{item.title}</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <div className="flex-1 h-1.5 rounded-full bg-bg-2 overflow-hidden">
                                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: clan.accent }} />
                                </div>
                                <span className="text-[10px] font-mono text-text-2 shrink-0">{item.completedBy.length}/{totalMembers}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {tab === 'membros' && (
            <div className="rounded-card bg-bg-1/30 border border-bg-2/30 divide-y divide-bg-2/20 overflow-hidden">
              {clan.members.sort((a, b) => {
                const order = { leader: 0, moderator: 1, member: 2 }
                return order[a.role] - order[b.role]
              }).map((m) => (
                <div key={m.userId} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-10 h-10 rounded-full bg-bg-2 flex items-center justify-center overflow-hidden shrink-0">
                    {m.avatarUrl ? <img src={m.avatarUrl} alt="" className="w-full h-full object-cover" /> : <User size={16} className="text-text-2" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-semibold truncate">{m.displayName}</p>
                      {m.role === 'leader' && <Crown size={13} style={{ color: clan.accent }} />}
                      {m.role === 'moderator' && <Star size={13} className="text-status-playing" />}
                    </div>
                    <p className="text-[11px] text-text-2">@{m.username}</p>
                  </div>
                  <div className="flex items-center gap-6 text-[11px] text-text-2 shrink-0">
                    <div className="text-center">
                      <p className="font-bold text-text-0">{m.gamesCompleted}</p>
                      <p className="text-[9px]">Zerados</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-text-0">{m.objectivesCompleted}</p>
                      <p className="text-[9px]">Objetivos</p>
                    </div>
                    {m.streak > 0 && (
                      <div className="text-center">
                        <p className="font-bold text-status-playing">{m.streak}d</p>
                        <p className="text-[9px]">Streak</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'mural' && (
            <div className="space-y-4">
              {wallUnlocked ? (
                <>
                  {isMember && (
                    <div className="flex gap-3">
                      <input type="text" value={newPost} onChange={(e) => setNewPost(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handlePost() }}
                        placeholder="Compartilhe algo com o clã..."
                        className="flex-1 bg-bg-1 border border-bg-2/60 rounded-card px-4 py-3 text-[13px] text-text-0 placeholder:text-text-2 focus:outline-none focus:border-accent/40" />
                      <button onClick={handlePost} disabled={!newPost.trim()}
                        className="px-4 py-3 rounded-card bg-accent text-bg-0 text-[12px] font-semibold hover:bg-accent-2 transition-all disabled:opacity-40">
                        Postar
                      </button>
                    </div>
                  )}
                  {clan.wall.map((post) => (
                    <div key={post.id} className="rounded-card bg-bg-1/50 border border-bg-2/40 p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-bg-2 flex items-center justify-center overflow-hidden shrink-0">
                          {post.avatarUrl ? <img src={post.avatarUrl} alt="" className="w-full h-full object-cover" /> : <User size={13} className="text-text-2" />}
                        </div>
                        <div className="flex-1">
                          <span className="text-[13px] font-semibold">{post.displayName}</span>
                          {post.type === 'activity' && <span className="text-[12px] text-text-2 ml-1">zerou</span>}
                          <span className="text-[10px] text-text-2/50 ml-2">{fmtDate(post.createdAt)}</span>
                        </div>
                      </div>
                      {post.body && <p className="text-[13px] text-text-1 mb-2 leading-relaxed">{post.body}</p>}
                      {post.mediaTitle && (
                        <div className="flex items-center gap-2 p-2 rounded-[8px] bg-bg-0/50 border border-bg-2/30 mb-2">
                          {post.mediaCoverUrl && (
                            <div className="w-7 h-10 rounded-[4px] overflow-hidden bg-bg-2 shrink-0">
                              <img src={post.mediaCoverUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <span className="text-[12px] text-text-1 font-medium">{post.mediaTitle}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 mt-1">
                        {post.reactions.map((r) => (
                          <button key={r.emoji} onClick={() => toggleReaction(clan.id, post.id, r.emoji)}
                            className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-full transition-all ${
                              r.userIds.includes('community-frae') ? 'bg-accent/15 text-accent-2' : 'bg-bg-2/40 text-text-2 hover:bg-bg-2/60'
                            }`}>
                            {r.emoji} {r.userIds.length}
                          </button>
                        ))}
                        <button onClick={() => setShowReactions(showReactions === post.id ? null : post.id)}
                          className="text-[11px] px-2 py-1 rounded-full bg-bg-2/30 text-text-2 hover:bg-bg-2/50 transition-all">
                          +
                        </button>
                        {showReactions === post.id && (
                          <div className="flex gap-1 ml-1 animate-fade-in">
                            {REACTION_OPTIONS.map((emoji) => (
                              <button key={emoji} onClick={() => { toggleReaction(clan.id, post.id, emoji); setShowReactions(null) }}
                                className="text-[14px] hover:scale-125 transition-transform">
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {clan.wall.length === 0 && <p className="text-[13px] text-text-2 text-center py-8">O mural está vazio. Seja o primeiro a postar.</p>}
                </>
              ) : (
                <div className="text-center py-16">
                  <Lock size={24} className="mx-auto mb-3 text-text-2" />
                  <p className="text-[14px] font-medium mb-1">Mural travado</p>
                  <p className="text-[12px] text-text-2">Complete o primeiro objetivo do clã para desbloquear o mural.</p>
                </div>
              )}
            </div>
          )}

          {tab === 'conquistas' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {clan.achievements.map((ach) => (
                <div key={ach.code}
                  className={`flex items-center gap-4 p-4 rounded-card border transition-all ${
                    ach.earned ? 'bg-bg-1/50 border-accent/20' : 'bg-bg-1/20 border-bg-2/30 opacity-50'
                  }`}>
                  <div className={`w-12 h-12 rounded-card flex items-center justify-center text-xl ${ach.earned ? 'bg-accent/10' : 'bg-bg-2'}`}>
                    {ach.earned ? ach.icon : <Lock size={16} className="text-text-2" />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-[13px] font-semibold ${ach.earned ? 'text-text-0' : 'text-text-2'}`}>{ach.title}</p>
                    <p className="text-[10px] text-text-2 mt-0.5">{ach.requirement}</p>
                    <p className="text-[10px] mt-1" style={{ color: ach.earned ? clan.accent : 'var(--color-text-2)' }}>
                      Desbloqueia: {ach.unlocks}
                    </p>
                  </div>
                  {ach.earned && <span className="text-[9px] px-2 py-0.5 rounded-full bg-accent/15 text-accent-2 shrink-0">Desbloqueada</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
