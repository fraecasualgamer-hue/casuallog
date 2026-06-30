import { useState } from 'react'
import { User, Trophy, Star, Pencil, UserPlus, Gamepad2, Film, BookOpen, Tv, Calendar, Share2, Check, Globe } from 'lucide-react'
import { Link } from 'react-router-dom'

function IconX({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
}
function IconDiscord({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.1.135 18.115a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  )
}
function IconSteam({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.455 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.252 0-2.265-1.014-2.265-2.265z"/>
    </svg>
  )
}
import TopBar from '../components/TopBar'
import EditProfileModal from '../components/EditProfileModal'
import { useBacklog } from '../context/BacklogContext'
import { useAuth } from '../context/AuthContext'
import { useLists } from '../context/ListsContext'
import { useSocial } from '../context/SocialContext'
import { STATUS_LABELS, type Status } from '../data/mock'
import StarRating from '../components/StarRating'
import { ACHIEVEMENTS, checkAchievements } from '../data/achievements'

const KIND_ICONS: Record<string, typeof Gamepad2> = {
  game: Gamepad2, movie: Film, series: Tv, anime: Tv, manga: BookOpen, book: BookOpen,
}

export default function ProfilePage() {
  const { items } = useBacklog()
  const { profile } = useAuth()
  const { lists } = useLists()
  const { followedIds, friendIds, pendingReceivedIds } = useSocial()
  const [showEdit, setShowEdit] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)

  const accentColor = profile?.accent ?? '#22b885'

  function handleShare() {
    const url = `${window.location.origin}/u/${profile?.username}`
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    })
  }

  const socials = profile?.social_links ?? {}

  const statusCounts = items.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const kindCounts = items.reduce((acc, item) => {
    acc[item.kind] = (acc[item.kind] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const playing = items.filter((i) => i.status === 'jogando')
  const changedYear = items.filter((i) => i.tier !== null && i.tier >= 5)
  const tieredItems = items.filter((i) => i.tier !== null)
  const avgTier = tieredItems.length > 0
    ? tieredItems.reduce((sum, i) => sum + (i.tier || 0), 0) / tieredItems.length
    : 0

  const allSeals = items.flatMap((i) => i.seals)
  const sealCounts = allSeals.reduce((acc, seal) => {
    acc[seal] = (acc[seal] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const topSeals = Object.entries(sealCounts).sort((a, b) => b[1] - a[1]).slice(0, 6)

  const totalReviews = items.filter((i) => i.review && i.review.trim()).length
  const earnedCodes = checkAchievements({
    totalItems: items.length,
    completedItems: statusCounts['zerado'] || 0,
    totalLists: lists.length,
    totalReviews,
    totalSeals: allSeals.length,
    hasChangedYear: changedYear.length > 0,
    hasDiaryEntry: true,
    hasMultiMedia: new Set(items.map((i) => i.kind)).size >= 2,
  })

  return (
    <>
      <TopBar title="Meu perfil" />
      <div className="animate-fade-in">
        <div className="relative">
          <div
            className="aspect-[16/5] max-h-52 w-full overflow-hidden"
            style={{
              background: !profile?.banner_url
                ? `linear-gradient(135deg, ${accentColor}22, ${accentColor}08)`
                : undefined,
            }}
          >
            {profile?.banner_url && (
              <img src={profile.banner_url} alt="" className="w-full h-full object-cover object-center" />
            )}
          </div>
          <div className="absolute -bottom-12 left-8 flex items-end gap-5">
            <div className="w-24 h-24 rounded-full border-4 border-bg-0 bg-bg-1 overflow-hidden ring-2 ring-bg-2/50">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-bg-2">
                  <User size={36} className="text-text-2" />
                </div>
              )}
            </div>
          </div>
          <div className="absolute -bottom-12 right-8 flex items-center gap-2">
            <button
              onClick={handleShare}
              className={`flex items-center gap-2 px-4 py-2 rounded-card border text-[12px] font-medium transition-all bg-bg-0/80 backdrop-blur-sm ${
                shareCopied
                  ? 'border-accent/40 text-accent-2'
                  : 'border-bg-2 text-text-1 hover:bg-bg-2/30'
              }`}
            >
              {shareCopied ? <Check size={13} /> : <Share2 size={13} />}
              {shareCopied ? 'Copiado!' : 'Compartilhar'}
            </button>
            <button
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-card border border-bg-2 text-[12px] font-medium text-text-1 hover:bg-bg-2/30 transition-all bg-bg-0/80 backdrop-blur-sm"
            >
              <Pencil size={13} /> Editar perfil
            </button>
          </div>
        </div>

        <div className="px-8 pt-16 pb-8 space-y-8">
          <div>
            <h2 className="font-display text-2xl font-bold">{profile?.display_name || 'Jogador'}</h2>
            <p className="text-[13px] text-text-2 mt-0.5">@{profile?.username || 'jogador'}</p>
            {profile?.bio && <p className="text-[14px] text-text-1 mt-2 max-w-lg">{profile.bio}</p>}

            {/* Redes sociais */}
            {(socials.website || socials.discord || socials.steam || socials.twitter_x) && (
              <div className="flex items-center gap-3 mt-3">
                {socials.website && (
                  <a href={socials.website} target="_blank" rel="noopener noreferrer"
                    title="Site" className="text-text-2 hover:text-text-0 transition-colors">
                    <Globe size={17} strokeWidth={1.8} />
                  </a>
                )}
                {socials.discord && (
                  <a href={`https://discord.com/users/${socials.discord}`} target="_blank" rel="noopener noreferrer"
                    title="Discord" className="text-text-2 hover:text-[#5865F2] transition-colors">
                    <IconDiscord size={17} />
                  </a>
                )}
                {socials.steam && (
                  <a href={`https://steamcommunity.com/id/${socials.steam}`} target="_blank" rel="noopener noreferrer"
                    title="Steam" className="text-text-2 hover:text-[#c7d5e0] transition-colors">
                    <IconSteam size={17} />
                  </a>
                )}
                {socials.twitter_x && (
                  <a href={`https://x.com/${socials.twitter_x}`} target="_blank" rel="noopener noreferrer"
                    title="X" className="text-text-2 hover:text-text-0 transition-colors">
                    <IconX size={17} />
                  </a>
                )}
              </div>
            )}

            <div className="flex items-center gap-6 mt-4">
              <Link to="/conexoes" className="text-center hover:opacity-80 transition-opacity">
                <span className="text-[16px] font-bold block">{followedIds.size}</span>
                <span className="text-[11px] text-text-2">Seguindo</span>
              </Link>
              <Link to="/conexoes" className="text-center hover:opacity-80 transition-opacity">
                <span className="text-[16px] font-bold block">0</span>
                <span className="text-[11px] text-text-2">Seguidores</span>
              </Link>
              <Link to="/conexoes" className="text-center hover:opacity-80 transition-opacity">
                <span className="text-[16px] font-bold block">{friendIds.size}</span>
                <span className="text-[11px] text-text-2">Amigos</span>
              </Link>
              {pendingReceivedIds.size > 0 && (
                <Link to="/conexoes" className="flex items-center gap-1 text-[11px] text-accent-2">
                  <UserPlus size={13} /> {pendingReceivedIds.size} pedido{pendingReceivedIds.size !== 1 && 's'}
                </Link>
              )}
              <span className="flex items-center gap-1 text-[11px] text-text-2">
                <Calendar size={12} /> Membro desde 2026
              </span>
            </div>
          </div>

          {playing.length > 0 && (
            <section>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-2 mb-3">Jogando agora</h4>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {playing.map((item) => (
                  <div key={item.id} className="w-20 shrink-0">
                    <div className="aspect-[3/4] rounded-[10px] overflow-hidden bg-bg-2 ring-1 ring-white/[0.04]">
                      <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[10px] text-text-1 mt-1.5 truncate text-center">{item.title}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {changedYear.length > 0 && (
            <section>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-2 mb-3">
                Nota máxima ★
              </h4>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {changedYear.map((item) => (
                  <div key={item.id} className="w-20 shrink-0">
                    <div className="aspect-[3/4] rounded-[10px] overflow-hidden bg-bg-2 border-2" style={{ borderColor: accentColor + '60' }}>
                      <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[10px] text-text-1 mt-1.5 truncate text-center">{item.title}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-2 mb-3">Minha estante</h4>
            <div className="grid grid-cols-5 gap-3">
              {(Object.keys(STATUS_LABELS) as Status[]).map((status) => (
                <div key={status} className="p-4 rounded-card bg-bg-1/50 border border-bg-2/40 text-center">
                  <p className="font-display text-2xl font-bold">{statusCounts[status] || 0}</p>
                  <p className="text-[10px] text-text-2 mt-1">{STATUS_LABELS[status]}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-2 gap-6">
            <section>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-2 mb-3">Por mídia</h4>
              <div className="space-y-2">
                {Object.entries(kindCounts).sort((a, b) => b[1] - a[1]).map(([kind, count]) => {
                  const Icon = KIND_ICONS[kind] ?? Gamepad2
                  const pct = Math.round((count / items.length) * 100)
                  return (
                    <div key={kind} className="flex items-center gap-3">
                      <Icon size={14} className="text-text-2 shrink-0" />
                      <div className="flex-1">
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-text-1 capitalize">{kind === 'game' ? 'Games' : kind === 'movie' ? 'Filmes' : kind === 'manga' ? 'Mangás' : kind === 'anime' ? 'Animes' : kind}</span>
                          <span className="text-text-2">{count}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-bg-2 overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: accentColor }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {avgTier > 0 && (
              <section>
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-2 mb-3">Média de jornada</h4>
                <div className="flex items-center gap-4 p-4 rounded-card bg-bg-1/50 border border-bg-2/40">
                  <Trophy size={22} style={{ color: accentColor }} strokeWidth={1.5} />
                  <div>
                    <StarRating value={avgTier} readOnly size={16} showValue />
                    <p className="text-[11px] text-text-2">
                      {tieredItems.length} obra{tieredItems.length !== 1 && 's'} avaliada{tieredItems.length !== 1 && 's'}
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>

          {(profile?.favorite_genres?.length || profile?.favorite_platforms?.length) ? (
            <div className="grid grid-cols-2 gap-6">
              {profile?.favorite_genres?.length ? (
                <section>
                  <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-2 mb-3">Gêneros favoritos</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.favorite_genres.map((g) => (
                      <span key={g} className="text-[11px] px-2.5 py-1 rounded-full bg-bg-1/50 border border-bg-2/40 text-text-1">{g}</span>
                    ))}
                  </div>
                </section>
              ) : null}
              {profile?.favorite_platforms?.length ? (
                <section>
                  <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-2 mb-3">Plataformas</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.favorite_platforms.map((p) => (
                      <span key={p} className="text-[11px] px-2.5 py-1 rounded-full bg-bg-1/50 border border-bg-2/40 text-text-1 font-mono">{p}</span>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          ) : null}

          {topSeals.length > 0 && (
            <section>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-2 mb-3">Selos mais usados</h4>
              <div className="flex flex-wrap gap-2">
                {topSeals.map(([seal, count]) => (
                  <div key={seal} className="flex items-center gap-2 px-3 py-2 rounded-card bg-bg-1/50 border border-bg-2/40">
                    <Star size={12} style={{ color: accentColor }} />
                    <span className="text-[12px] text-text-0">{seal}</span>
                    <span className="text-[10px] font-mono text-text-2">{count}x</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-2">Conquistas</h4>
              <Link to="/conquistas" className="text-[11px] text-accent-2 hover:text-accent transition-colors">Ver todas</Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {ACHIEVEMENTS.filter((a) => earnedCodes.includes(a.code)).slice(0, 6).map((a) => (
                <div key={a.id} className="flex items-center gap-2 px-3 py-2 rounded-card bg-bg-1/50 border border-accent/20 shrink-0">
                  <span className="text-lg">{a.icon}</span>
                  <div>
                    <p className="text-[11px] font-medium">{a.title}</p>
                    <p className="text-[9px] text-text-2">{a.description}</p>
                  </div>
                </div>
              ))}
              {earnedCodes.length === 0 && (
                <p className="text-[12px] text-text-2">Nenhuma conquista desbloqueada ainda. Continue jogando.</p>
              )}
            </div>
          </section>
        </div>
      </div>

      {showEdit && <EditProfileModal onClose={() => setShowEdit(false)} />}
    </>
  )
}
