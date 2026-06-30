import { useState } from 'react'
import { Heart, Globe, User, Copy, Search } from 'lucide-react'
import TopBar from '../components/TopBar'
import { getListTypeConfig } from '../data/list-rules'

const mockCommunityLists = [
  {
    id: 'community-1',
    title: 'Correndo Atrás: Final Fantasy',
    type: 'correndo_atras' as const,
    theme: 'Final Fantasy',
    itemCount: 12,
    likeCount: 89,
    author: 'FraeCasual',
    authorAvatar: null,
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7k1d.webp',
  },
  {
    id: 'community-2',
    title: 'Para Quem Gosta De: Souls-like',
    type: 'para_quem_gosta' as const,
    theme: 'Souls-like',
    itemCount: 8,
    likeCount: 156,
    author: 'DarkPlayer',
    authorAvatar: null,
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp',
  },
  {
    id: 'community-3',
    title: 'Para Quem Gosta De: Metroidvania',
    type: 'para_quem_gosta' as const,
    theme: 'Metroidvania',
    itemCount: 8,
    likeCount: 73,
    author: 'IndieHunter',
    authorAvatar: null,
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rgi.webp',
  },
  {
    id: 'community-4',
    title: 'Correndo Atrás: Persona',
    type: 'correndo_atras' as const,
    theme: 'Persona',
    itemCount: 6,
    likeCount: 112,
    author: 'JRPGFan',
    authorAvatar: null,
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2t97.webp',
  },
  {
    id: 'community-5',
    title: 'Revisitando a Infância',
    type: 'revisitando_infancia' as const,
    theme: '',
    itemCount: 15,
    likeCount: 45,
    author: 'RetroGamer',
    authorAvatar: null,
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1nri.webp',
  },
  {
    id: 'community-6',
    title: 'C.A. Pocket: Zelda Essentials',
    type: 'ca_pocket' as const,
    theme: 'Zelda',
    itemCount: 3,
    likeCount: 201,
    author: 'FraeCasual',
    authorAvatar: null,
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co3p2d.webp',
  },
]

const mockCurators = [
  { id: 'c1', name: 'FraeCasual', bio: 'Canal sobre consumo contemplativo de jogos', listCount: 8, followerCount: 1240 },
  { id: 'c2', name: 'DarkPlayer', bio: 'Especialista em Souls-like e ação difícil', listCount: 5, followerCount: 890 },
  { id: 'c3', name: 'IndieHunter', bio: 'Caçador de indie gems', listCount: 12, followerCount: 650 },
]

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())

  const filtered = searchQuery.length >= 2
    ? mockCommunityLists.filter(
        (l) =>
          l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.author.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : mockCommunityLists

  function toggleLike(id: string) {
    setLikedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <>
      <TopBar title="Explorar" />
      <div className="p-8 space-y-8">
        <div className="flex items-center gap-3 px-4 py-3 rounded-card bg-bg-1 border border-bg-2">
          <Search size={16} className="text-text-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar listas, temas ou curadores..."
            className="flex-1 bg-transparent text-[13px] text-text-0 placeholder:text-text-2 focus:outline-none"
          />
        </div>

        <section>
          <h3 className="font-display text-[11px] font-bold uppercase text-text-2 tracking-[0.12em] mb-4">
            Curadores em destaque
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {mockCurators.map((curator) => (
              <div
                key={curator.id}
                className="flex items-center gap-3 p-4 rounded-card bg-bg-1 border border-bg-2 hover:border-accent/30 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-bg-2 flex items-center justify-center shrink-0">
                  <User size={16} className="text-text-2" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate">{curator.name}</p>
                  <p className="text-[10px] text-text-2 truncate">{curator.bio}</p>
                  <div className="flex gap-3 mt-1">
                    <span className="text-[10px] text-text-2">{curator.listCount} listas</span>
                    <span className="text-[10px] text-text-2">{curator.followerCount} seguidores</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="font-display text-[11px] font-bold uppercase text-text-2 tracking-[0.12em] mb-4">
            Listas da comunidade
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((list) => {
              const config = getListTypeConfig(list.type)
              const isLiked = likedIds.has(list.id)
              return (
                <div
                  key={list.id}
                  className="group p-4 rounded-card bg-bg-1 border border-bg-2 hover:border-accent/30 transition-all"
                >
                  <div className="flex gap-4">
                    <div className="w-14 h-20 rounded-[6px] overflow-hidden bg-bg-2 shrink-0">
                      <img src={list.coverUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-accent-2">
                          {config.label}
                        </span>
                        <Globe size={10} className="text-text-2" />
                      </div>
                      <h4 className="text-[13px] font-semibold mt-0.5 truncate">{list.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-text-2">por {list.author}</span>
                        <span className="text-[10px] text-text-2">· {list.itemCount} obras</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-bg-2">
                    <button
                      onClick={() => toggleLike(list.id)}
                      className={`flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-full transition-colors ${
                        isLiked
                          ? 'bg-accent/15 text-accent-2'
                          : 'text-text-2 hover:text-text-1 hover:bg-bg-2/50'
                      }`}
                    >
                      <Heart size={12} fill={isLiked ? 'currentColor' : 'none'} />
                      {list.likeCount + (isLiked ? 1 : 0)}
                    </button>
                    <button className="flex items-center gap-1 text-[11px] text-text-2 px-2.5 py-1.5 rounded-full hover:text-accent-2 hover:bg-accent/10 transition-colors">
                      <Copy size={12} />
                      Copiar pro meu backlog
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          {filtered.length === 0 && (
            <p className="text-[13px] text-text-2 text-center py-8">
              Nenhuma lista encontrada para "{searchQuery}"
            </p>
          )}
        </section>
      </div>
    </>
  )
}
