import { useParams, useNavigate } from 'react-router-dom'
import { User, ArrowLeft, Heart, UserPlus, UserCheck, Lock, Gamepad2 } from 'lucide-react'
import TopBar from '../components/TopBar'
import { useSocial } from '../context/SocialContext'

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const {
    allProfiles, followedIds, friendIds, pendingSentIds,
    follow, unfollow, sendFriendRequest, cancelFriendRequest,
  } = useSocial()

  const profile = allProfiles.find((p) => p.username === username)

  if (!profile) {
    return (
      <>
        <TopBar title="Perfil" />
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-text-2 text-[14px]">Perfil não encontrado.</p>
        </div>
      </>
    )
  }

  const isFollowing = followedIds.has(profile.id)
  const isFriend = friendIds.has(profile.id)
  const isPendingSent = pendingSentIds.has(profile.id)
  const accentColor = profile.accent ?? '#22b885'

  return (
    <>
      <TopBar title={profile.display_name} />
      <div className="animate-fade-in">
        <div className="relative">
          <div
            className="aspect-[16/5] max-h-52 w-full overflow-hidden"
            style={{
              background: !profile.banner_url
                ? `linear-gradient(135deg, ${accentColor}22, ${accentColor}08)`
                : undefined,
            }}
          >
            {profile.banner_url && (
              <img src={profile.banner_url} alt="" className="w-full h-full object-cover object-center" />
            )}
          </div>
          <div className="absolute -bottom-10 left-8 flex items-end gap-4">
            <div className="w-20 h-20 rounded-full border-4 border-bg-0 bg-bg-1 overflow-hidden ring-2 ring-bg-2/50">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-bg-2">
                  <User size={30} className="text-text-2" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-8 pt-14 pb-8 space-y-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-[12px] text-text-2 hover:text-text-1 transition-colors mb-4"
          >
            <ArrowLeft size={14} /> Voltar
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-xl font-bold">{profile.display_name}</h2>
              <p className="text-[13px] text-text-2">@{profile.username}</p>
              <p className="text-[13px] text-text-1 mt-2 max-w-md">{profile.bio}</p>
              <div className="flex items-center gap-6 mt-3">
                <div className="text-center">
                  <span className="text-[15px] font-bold block">{profile.following_count}</span>
                  <span className="text-[10px] text-text-2">Seguindo</span>
                </div>
                <div className="text-center">
                  <span className="text-[15px] font-bold block">{profile.follower_count}</span>
                  <span className="text-[10px] text-text-2">Seguidores</span>
                </div>
                <div className="text-center">
                  <span className="text-[15px] font-bold block">{profile.friend_count}</span>
                  <span className="text-[10px] text-text-2">Amigos</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => (isFollowing ? unfollow(profile.id) : follow(profile.id))}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-card text-[12px] font-semibold transition-all ${
                  isFollowing
                    ? 'border border-bg-2 text-text-1 hover:border-status-abandoned/30 hover:text-status-abandoned'
                    : 'bg-accent text-bg-0 hover:bg-accent-2'
                }`}
              >
                <Heart size={13} fill={isFollowing ? 'currentColor' : 'none'} />
                {isFollowing ? 'Seguindo' : 'Seguir'}
              </button>
              {isFriend ? (
                <span className="flex items-center gap-1.5 px-4 py-2 rounded-card border border-accent/30 text-accent-2 text-[12px] font-semibold">
                  <UserCheck size={13} /> Amigos
                </span>
              ) : isPendingSent ? (
                <button
                  onClick={() => cancelFriendRequest(profile.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-card border border-bg-2 text-text-2 text-[12px] hover:text-text-1 transition-all"
                >
                  Pedido enviado
                </button>
              ) : (
                <button
                  onClick={() => sendFriendRequest(profile.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-card border border-bg-2 text-text-1 text-[12px] font-medium hover:border-accent/30 transition-all"
                >
                  <UserPlus size={13} /> Amizade
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-card bg-bg-1/50 border border-bg-2/40 text-center">
              <Gamepad2 size={18} className="mx-auto mb-1" style={{ color: accentColor }} />
              <p className="text-xl font-bold">{profile.game_count}</p>
              <p className="text-[10px] text-text-2">Obras no backlog</p>
            </div>
            <div className="p-4 rounded-card bg-bg-1/50 border border-bg-2/40 text-center">
              <p className="text-xl font-bold">{profile.list_count}</p>
              <p className="text-[10px] text-text-2">Listas</p>
            </div>
            <div className="p-4 rounded-card bg-bg-1/50 border border-bg-2/40 text-center">
              <p className="text-xl font-bold">{profile.follower_count}</p>
              <p className="text-[10px] text-text-2">Seguidores</p>
            </div>
          </div>

          <div className="flex items-center justify-center py-12 text-center">
            <div>
              <Lock size={20} className="mx-auto mb-2 text-text-2" />
              <p className="text-[13px] text-text-2">A estante completa aparece quando houver obras reais.</p>
              <p className="text-[11px] text-text-2/60 mt-1">Nas próximas fases, listas públicas e atividade aparecerão aqui.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
