export type ClanRole = 'leader' | 'moderator' | 'member'
export type JoinMode = 'open' | 'approval'

export interface ClanMember {
  userId: string
  username: string
  displayName: string
  avatarUrl: string | null
  role: ClanRole
  joinedAt: string
  gamesCompleted: number
  objectivesCompleted: number
  streak: number
}

export interface ClanObjectiveItem {
  id: string
  title: string
  coverUrl: string
  completedBy: string[]
}

export interface ClanObjective {
  id: string
  title: string
  items: ClanObjectiveItem[]
  deadline: string | null
  completedAt: string | null
}

export interface ClanWallPost {
  id: string
  userId: string
  username: string
  displayName: string
  avatarUrl: string | null
  body: string
  mediaTitle?: string
  mediaCoverUrl?: string
  type: 'post' | 'activity'
  reactions: { emoji: string; userIds: string[] }[]
  createdAt: string
}

export interface ClanAchievement {
  code: string
  title: string
  description: string
  requirement: string
  unlocks: string
  icon: string
  earned: boolean
}

export interface Clan {
  id: string
  name: string
  description: string
  avatarUrl: string | null
  bannerUrl: string | null
  accent: string
  leaderId: string
  joinMode: JoinMode
  memberLimit: number
  memberCount: number
  xp: number
  level: number
  members: ClanMember[]
  objectives: ClanObjective[]
  wall: ClanWallPost[]
  achievements: ClanAchievement[]
  createdAt: string
}

export const CLAN_ACHIEVEMENTS: Omit<ClanAchievement, 'earned'>[] = [
  { code: 'clan_formed', title: 'Clã formado', description: 'O clã foi criado', requirement: 'Criar o clã', unlocks: 'Capacidade base: 10 membros', icon: '🛡️' },
  { code: 'first_journey', title: 'Primeira jornada', description: 'O clã completou seu primeiro objetivo', requirement: '1 objetivo completado', unlocks: 'Mural do clã', icon: '🗺️' },
  { code: 'squad_assembled', title: 'Tropa reunida', description: '5 membros ativos no clã', requirement: '5 membros ativos', unlocks: 'Cor de acento custom', icon: '👥' },
  { code: 'running_together', title: 'Correndo juntos', description: '3 objetivos completados', requirement: '3 objetivos completados', unlocks: 'Capacidade: 15 membros', icon: '🏃' },
  { code: 'veterans', title: 'Veteranos', description: '10 objetivos completados', requirement: '10 objetivos completados', unlocks: '20 membros + emblema custom', icon: '⭐' },
  { code: 'legendary', title: 'Lendários', description: '25 objetivos + 10 membros', requirement: '25 objetivos + 10 membros', unlocks: 'Badge especial nos perfis', icon: '💎' },
]

export const mockClans: Clan[] = [
  {
    id: 'clan-1',
    name: 'Souls Veterans',
    description: 'Para quem gosta de morrer 50 vezes antes de aprender. Sem pressa, sem rage quit.',
    avatarUrl: null,
    bannerUrl: null,
    accent: '#a05252',
    leaderId: 'community-dark',
    joinMode: 'approval',
    memberLimit: 15,
    memberCount: 8,
    xp: 450,
    level: 3,
    members: [
      { userId: 'community-dark', username: 'darkplayer', displayName: 'DarkPlayer', avatarUrl: null, role: 'leader', joinedAt: '2026-03-01', gamesCompleted: 12, objectivesCompleted: 3, streak: 14 },
      { userId: 'community-indie', username: 'indiehunter', displayName: 'IndieHunter', avatarUrl: null, role: 'moderator', joinedAt: '2026-03-05', gamesCompleted: 8, objectivesCompleted: 2, streak: 7 },
      { userId: 'community-frae', username: 'fraecasual', displayName: 'Frae Casual', avatarUrl: null, role: 'member', joinedAt: '2026-03-10', gamesCompleted: 5, objectivesCompleted: 1, streak: 3 },
      { userId: 'mock-user-1', username: 'playerone', displayName: 'Player One', avatarUrl: null, role: 'member', joinedAt: '2026-03-15', gamesCompleted: 3, objectivesCompleted: 1, streak: 0 },
      { userId: 'mock-user-2', username: 'gamergirl', displayName: 'GamerGirl', avatarUrl: null, role: 'member', joinedAt: '2026-04-01', gamesCompleted: 6, objectivesCompleted: 2, streak: 5 },
    ],
    objectives: [
      {
        id: 'obj-1',
        title: 'Trilogia Souls',
        items: [
          { id: 'oi-1', title: 'Dark Souls', coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x78.webp', completedBy: ['community-dark', 'community-indie', 'mock-user-2'] },
          { id: 'oi-2', title: 'Dark Souls II', coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co20wy.webp', completedBy: ['community-dark', 'community-indie'] },
          { id: 'oi-3', title: 'Dark Souls III', coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1vcf.webp', completedBy: ['community-dark'] },
        ],
        deadline: '2026-12-31',
        completedAt: null,
      },
      {
        id: 'obj-2',
        title: 'Elden Ring completo',
        items: [
          { id: 'oi-4', title: 'Elden Ring', coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp', completedBy: ['community-dark', 'community-indie', 'community-frae', 'mock-user-2'] },
        ],
        deadline: null,
        completedAt: null,
      },
    ],
    wall: [
      { id: 'wp-1', userId: 'community-dark', username: 'darkplayer', displayName: 'DarkPlayer', avatarUrl: null, body: 'Finalmente zerei Dark Souls III sem morrer pro Nameless King. Só levou 47 tentativas.', mediaTitle: 'Dark Souls III', mediaCoverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1vcf.webp', type: 'post', reactions: [{ emoji: '🔥', userIds: ['community-indie', 'community-frae'] }, { emoji: '💀', userIds: ['mock-user-1'] }], createdAt: '2026-06-25T14:30:00Z' },
      { id: 'wp-2', userId: 'community-indie', username: 'indiehunter', displayName: 'IndieHunter', avatarUrl: null, body: '', type: 'activity', mediaTitle: 'Dark Souls II', mediaCoverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co20wy.webp', reactions: [], createdAt: '2026-06-24T10:00:00Z' },
      { id: 'wp-3', userId: 'community-frae', username: 'fraecasual', displayName: 'Frae Casual', avatarUrl: null, body: 'Começando Elden Ring agora. Desejem-me sorte (vou precisar).', type: 'post', reactions: [{ emoji: '⚔️', userIds: ['community-dark', 'community-indie', 'mock-user-2'] }], createdAt: '2026-06-20T18:00:00Z' },
    ],
    achievements: CLAN_ACHIEVEMENTS.map((a) => ({
      ...a,
      earned: ['clan_formed', 'first_journey', 'squad_assembled'].includes(a.code),
    })),
    createdAt: '2026-03-01',
  },
  {
    id: 'clan-2',
    name: 'JRPG Nights',
    description: 'Turnos, menus e 100+ horas de história. Se tem JRPG, a gente joga.',
    avatarUrl: null,
    bannerUrl: null,
    accent: '#5889b5',
    leaderId: 'community-jrpg',
    joinMode: 'open',
    memberLimit: 10,
    memberCount: 4,
    xp: 120,
    level: 1,
    members: [
      { userId: 'community-jrpg', username: 'jrpgfan', displayName: 'JRPGFan', avatarUrl: null, role: 'leader', joinedAt: '2026-04-10', gamesCompleted: 9, objectivesCompleted: 1, streak: 10 },
      { userId: 'community-retro', username: 'retrogamer', displayName: 'RetroGamer', avatarUrl: null, role: 'member', joinedAt: '2026-04-15', gamesCompleted: 4, objectivesCompleted: 0, streak: 2 },
      { userId: 'mock-user-3', username: 'pixelart', displayName: 'PixelArt', avatarUrl: null, role: 'member', joinedAt: '2026-05-01', gamesCompleted: 2, objectivesCompleted: 0, streak: 0 },
    ],
    objectives: [
      {
        id: 'obj-3',
        title: 'Persona Marathon',
        items: [
          { id: 'oi-5', title: 'Persona 3 Reload', coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6wir.webp', completedBy: ['community-jrpg'] },
          { id: 'oi-6', title: 'Persona 4 Golden', coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5vew.webp', completedBy: ['community-jrpg', 'community-retro'] },
          { id: 'oi-7', title: 'Persona 5 Royal', coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2t97.webp', completedBy: [] },
        ],
        deadline: null,
        completedAt: null,
      },
    ],
    wall: [
      { id: 'wp-4', userId: 'community-jrpg', username: 'jrpgfan', displayName: 'JRPGFan', avatarUrl: null, body: 'Quem tá pronto pro Persona Marathon? 300+ horas nos esperam.', type: 'post', reactions: [{ emoji: '🎭', userIds: ['community-retro'] }], createdAt: '2026-06-22T20:00:00Z' },
    ],
    achievements: CLAN_ACHIEVEMENTS.map((a) => ({
      ...a,
      earned: a.code === 'clan_formed',
    })),
    createdAt: '2026-04-10',
  },
]
