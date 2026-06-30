import { useState, useEffect } from 'react'
import { User, UserPlus, UserCheck, UserX, Heart, Rss, Zap, Users } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { useSocial } from '../context/SocialContext'

type MainTab = 'feed' | 'amigos' | 'atividade'
type FriendsTab = 'amigos' | 'seguindo' | 'seguidores' | 'pedidos' | 'sugeridos'

export default function ConnectionsPage() {
  const {
    followedIds, friendIds, pendingSentIds, pendingReceivedIds,
    follow, unfollow, sendFriendRequest, acceptFriendRequest,
    removeFriend, allProfiles, pendingCount,
  } = useSocial()

  const [searchParams, setSearchParams] = useSearchParams()
  const [mainTab, setMainTab] = useState<MainTab>((searchParams.get('tab') as MainTab) || 'feed')
  const [friendsTab, setFriendsTab] = useState<FriendsTab>('amigos')

  useEffect(() => {
    const t = (searchParams.get('tab') as MainTab) || 'feed'
    setMainTab(t)
  }, [searchParams])

  const followedProfiles  = allProfiles.filter((p) => followedIds.has(p.id))
  const friendProfiles    = allProfiles.filter((p) => friendIds.has(p.id))
  const pendingRecProfiles = allProfiles.filter((p) => pendingReceivedIds.has(p.id))
  const suggestedProfiles = allProfiles.filter(
    (p) => !followedIds.has(p.id) && !friendIds.has(p.id) && !pendingSentIds.has(p.id),
  )

  const mainTabs: { key: MainTab; label: string; icon: typeof Rss; badge?: number }[] = [
    { key: 'feed',      label: 'Feed',      icon: Rss },
    { key: 'amigos',    label: 'Amigos',    icon: Users,  badge: pendingCount > 0 ? pendingCount : undefined },
    { key: 'atividade', label: 'Atividade', icon: Zap },
  ]

  const friendsTabs: { key: FriendsTab; label: string; count?: number }[] = [
    { key: 'amigos',     label: 'Amigos',    count: friendIds.size },
    { key: 'seguindo',   label: 'Seguindo',  count: followedIds.size },
    { key: 'seguidores', label: 'Seguidores', count: 0 },
    { key: 'pedidos',    label: 'Pedidos',   count: pendingCount },
    { key: 'sugeridos',  label: 'Sugeridos' },
  ]

  function renderProfile(p: typeof allProfiles[0], actions: React.ReactNode) {
    return (
      <div key={p.id} className="flex items-center gap-4 px-5 py-4 hover:bg-bg-2/20 transition-colors">
        <Link to={`/u/${p.username}`} className="shrink-0">
          <div className="w-12 h-12 rounded-full bg-bg-2 flex items-center justify-center overflow-hidden">
            {p.avatar_url
              ? <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
              : <User size={20} className="text-text-2" />}
          </div>
        </Link>
        <Link to={`/u/${p.username}`} className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold truncate">{p.display_name}</p>
          <p className="text-[11px] text-text-2">@{p.username}</p>
          <p className="text-[11px] text-text-2/70 mt-0.5 truncate">{p.bio}</p>
        </Link>
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      </div>
    )
  }

  return (
    <>
      <TopBar title="Social" />
      <div className="p-8">

        {/* ── Abas principais ── */}
        <div className="flex gap-1 mb-6 border-b border-bg-2/30">
          {mainTabs.map((t) => {
            const Icon = t.icon
            const active = mainTab === t.key
            return (
              <button
                key={t.key}
                onClick={() => { setMainTab(t.key); setSearchParams({ tab: t.key }) }}
                className={`relative flex items-center gap-2 px-5 py-3 text-[13px] font-medium transition-all ${
                  active ? 'text-accent-2' : 'text-text-2 hover:text-text-1'
                }`}
              >
                <Icon size={14} strokeWidth={1.8} />
                {t.label}
                {t.badge != null && (
                  <span className="ml-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-accent/15 text-accent-2">
                    {t.badge}
                  </span>
                )}
                {active && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full tab-neon" />
                )}
              </button>
            )
          })}
        </div>

        {/* ── FEED ── */}
        {mainTab === 'feed' && (
          <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-card bg-bg-1 border border-bg-2/50 flex items-center justify-center mb-5">
              <Rss size={24} className="text-text-2" />
            </div>
            <p className="text-[15px] font-semibold text-text-0 mb-2">Feed em breve</p>
            <p className="text-[13px] text-text-2 max-w-sm leading-relaxed">
              Aqui você verá o que seus amigos estão jogando, zerando e adicionando ao backlog — em tempo real.
            </p>
          </div>
        )}

        {/* ── AMIGOS ── */}
        {mainTab === 'amigos' && (
          <div className="animate-fade-in">
            {/* Sub-abas */}
            <div className="flex gap-1 mb-5 border-b border-bg-2/20 pb-0">
              {friendsTabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setFriendsTab(t.key)}
                  className={`relative px-4 py-2.5 text-[12px] font-medium transition-all ${
                    friendsTab === t.key ? 'text-accent-2' : 'text-text-2 hover:text-text-1'
                  }`}
                >
                  {t.label}
                  {t.count != null && t.count > 0 && (
                    <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                      t.key === 'pedidos' ? 'bg-accent/15 text-accent-2' : 'text-text-2/60'
                    }`}>
                      {t.count}
                    </span>
                  )}
                  {friendsTab === t.key && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent/60 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            <div className="rounded-card bg-bg-1/30 border border-bg-2/30 divide-y divide-bg-2/20 overflow-hidden">
              {friendsTab === 'amigos' && (
                friendProfiles.length > 0
                  ? friendProfiles.map((p) => renderProfile(p,
                      <button onClick={() => removeFriend(p.id)}
                        className="text-[11px] px-3 py-1.5 rounded-full border border-bg-2 text-text-2 hover:border-status-abandoned/40 hover:text-status-abandoned transition-all">
                        <UserX size={12} className="inline mr-1" />Remover
                      </button>
                    ))
                  : <p className="text-[13px] text-text-2 text-center py-12">Sua lista de amigos está vazia. Envie pedidos de amizade.</p>
              )}

              {friendsTab === 'seguindo' && (
                followedProfiles.length > 0
                  ? followedProfiles.map((p) => renderProfile(p,
                      <button onClick={() => unfollow(p.id)}
                        className="text-[11px] px-3 py-1.5 rounded-full border border-bg-2 text-text-2 hover:border-status-abandoned/40 hover:text-status-abandoned transition-all">
                        Deixar de seguir
                      </button>
                    ))
                  : <p className="text-[13px] text-text-2 text-center py-12">Você ainda não segue ninguém.</p>
              )}

              {friendsTab === 'seguidores' && (
                <p className="text-[13px] text-text-2 text-center py-12">Seus seguidores aparecerão aqui.</p>
              )}

              {friendsTab === 'pedidos' && (
                pendingRecProfiles.length > 0
                  ? pendingRecProfiles.map((p) => renderProfile(p,
                      <>
                        <button onClick={() => acceptFriendRequest(p.id)}
                          className="text-[11px] px-3 py-1.5 rounded-full bg-accent text-bg-0 font-semibold hover:bg-accent-2 transition-all">
                          <UserCheck size={12} className="inline mr-1" />Aceitar
                        </button>
                        <button className="text-[11px] px-3 py-1.5 rounded-full border border-bg-2 text-text-2 hover:text-text-1 transition-all">
                          Recusar
                        </button>
                      </>
                    ))
                  : <p className="text-[13px] text-text-2 text-center py-12">Nenhum pedido de amizade pendente.</p>
              )}

              {friendsTab === 'sugeridos' && (
                suggestedProfiles.length > 0
                  ? suggestedProfiles.map((p) => renderProfile(p,
                      <>
                        <button onClick={() => follow(p.id)}
                          className="text-[11px] px-3 py-1.5 rounded-full bg-accent/15 text-accent-2 hover:bg-accent/25 transition-all">
                          <Heart size={12} className="inline mr-1" />Seguir
                        </button>
                        <button onClick={() => sendFriendRequest(p.id)}
                          className="text-[11px] px-3 py-1.5 rounded-full border border-bg-2 text-text-1 hover:border-accent/30 transition-all">
                          <UserPlus size={12} className="inline mr-1" />Amizade
                        </button>
                      </>
                    ))
                  : <p className="text-[13px] text-text-2 text-center py-12">Sem sugestões no momento.</p>
              )}
            </div>
          </div>
        )}

        {/* ── ATIVIDADE ── */}
        {mainTab === 'atividade' && (
          <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-card bg-bg-1 border border-bg-2/50 flex items-center justify-center mb-5">
              <Zap size={24} className="text-text-2" />
            </div>
            <p className="text-[15px] font-semibold text-text-0 mb-2">Atividade em breve</p>
            <p className="text-[13px] text-text-2 max-w-sm leading-relaxed">
              Seu histórico de atividade recente — conquistas desbloqueadas, obras zeradas, listas criadas — aparecerá aqui.
            </p>
          </div>
        )}

      </div>
    </>
  )
}
