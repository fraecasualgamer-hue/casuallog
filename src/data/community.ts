export interface CommunityProfile {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  bio: string
  banner_url?: string
  accent?: string
  follower_count: number
  following_count: number
  friend_count: number
  list_count: number
  game_count: number
}

export const communityProfiles: CommunityProfile[] = [
  {
    id: 'community-frae',
    username: 'fraecasual',
    display_name: 'Frae Casual',
    avatar_url: null,
    bio: 'Canal sobre consumo contemplativo de jogos. No seu tempo, sempre.',
    accent: '#e8764b',
    follower_count: 1240,
    following_count: 85,
    friend_count: 32,
    list_count: 8,
    game_count: 156,
  },
  {
    id: 'community-dark',
    username: 'darkplayer',
    display_name: 'DarkPlayer',
    avatar_url: null,
    bio: 'Especialista em Souls-like e ação difícil. Se não morri 50 vezes, não conta.',
    accent: '#a05252',
    follower_count: 890,
    following_count: 120,
    friend_count: 18,
    list_count: 5,
    game_count: 203,
  },
  {
    id: 'community-indie',
    username: 'indiehunter',
    display_name: 'IndieHunter',
    avatar_url: null,
    bio: 'Caçador de indie gems. Se tem menos de 100 reviews na Steam, eu já joguei.',
    accent: '#22b885',
    follower_count: 650,
    following_count: 310,
    friend_count: 45,
    list_count: 12,
    game_count: 412,
  },
  {
    id: 'community-jrpg',
    username: 'jrpgfan',
    display_name: 'JRPGFan',
    avatar_url: null,
    bio: 'Se tem turno e menu, eu jogo. Persona, Final Fantasy, Dragon Quest — tudo.',
    accent: '#5889b5',
    follower_count: 520,
    following_count: 95,
    friend_count: 22,
    list_count: 6,
    game_count: 178,
  },
  {
    id: 'community-retro',
    username: 'retrogamer',
    display_name: 'RetroGamer',
    avatar_url: null,
    bio: 'Saudade é combustível. SNES, PS1, GBA — os clássicos que fizeram a gente.',
    accent: '#e8a948',
    follower_count: 380,
    following_count: 60,
    friend_count: 15,
    list_count: 4,
    game_count: 267,
  },
]
