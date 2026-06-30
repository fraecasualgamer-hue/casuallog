export type ListType =
  | 'correndo_atras'
  | 'ca_pocket'
  | 'para_quem_gosta'
  | 'revisitando_infancia'
  | 'livre'

export interface ListTypeConfig {
  type: ListType
  label: string
  description: string
  rules: string[]
  minItems?: number
  maxItems?: number
  requiresTheme: boolean
}

export const LIST_TYPES: ListTypeConfig[] = [
  {
    type: 'correndo_atras',
    label: 'Correndo Atrás',
    description: 'Uma franquia grande para percorrer em ordem cronológica.',
    rules: [
      'Organize em ordem cronológica da franquia',
      'Inclua jogos principais e spin-offs relevantes',
      'Obras de upgrade (filmes, séries, livros) são opcionais mas enriquecem a jornada',
    ],
    requiresTheme: true,
  },
  {
    type: 'ca_pocket',
    label: 'C.A. Pocket',
    description: 'Uma versão compacta do Correndo Atrás — no máximo 3 jogos.',
    rules: [
      'No máximo 3 jogos',
      'Ideal para franquias menores ou para quem quer uma entrada rápida',
    ],
    maxItems: 3,
    requiresTheme: true,
  },
  {
    type: 'para_quem_gosta',
    label: 'Para Quem Gosta De',
    description: 'Uma curadoria temática com 5 games + 3 upgrades de mídia.',
    rules: [
      '5 games: 2 clássicos, 2 desconhecidos, 1 retrô',
      '3 upgrades de mídia (filme, série, anime, mangá ou livro)',
      'Sem repetir franquia entre as categorias',
    ],
    minItems: 8,
    maxItems: 8,
    requiresTheme: true,
  },
  {
    type: 'revisitando_infancia',
    label: 'Revisitando a Infância',
    description: 'Jogos que marcaram sua infância, para revisitar ou descobrir de novo.',
    rules: [
      'Games que você jogou quando criança',
      'Adicione o que vier ao coração — sem regras rígidas',
    ],
    requiresTheme: false,
  },
  {
    type: 'livre',
    label: 'Lista livre',
    description: 'Monte como quiser, sem regras.',
    rules: [],
    requiresTheme: false,
  },
]

export function getListTypeConfig(type: ListType): ListTypeConfig {
  return LIST_TYPES.find((t) => t.type === type) ?? LIST_TYPES[LIST_TYPES.length - 1]
}

export interface ListItem {
  id: string
  mediaItemId: string
  title: string
  coverUrl: string
  kind: string
  platform?: string
  role: 'principal' | 'upgrade'
  classification?: 'classico' | 'desconhecido' | 'retro' | 'canone' | 'spin_off' | null
  obtained: boolean
  runs?: boolean | null
  status?: 'quero' | 'jogando' | 'pausado' | 'zerado' | 'na_estante' | 'abandonado'
  price?: number | null
  releaseYear?: number
  developer?: string
  genre?: string
  subgenre?: string
  availablePlatforms?: string[]
  hltbMain?: number
  hltbCompletionist?: number
  canonical?: boolean
  consumed?: boolean
  startDate?: string
  doneDate?: string
  position: number
  note?: string
}

export function consumedVerb(kind: string): string {
  if (kind === 'game') return 'Jogado'
  if (kind === 'book' || kind === 'manga') return 'Lido'
  return 'Assistido'
}

export function consumedVerbInfinitive(kind: string): string {
  if (kind === 'game') return 'Jogar'
  if (kind === 'book' || kind === 'manga') return 'Ler'
  return 'Assistir'
}

export type ListStatus = 'building' | 'ready' | 'active' | 'paused' | 'completed'

export const LIST_STATUS_LABELS: Record<ListStatus, string> = {
  building: 'Planejando',
  ready: 'Pronta',
  active: 'Em andamento',
  paused: 'Pausada',
  completed: 'Concluída',
}

export interface UserList {
  id: string
  ownerId: string
  type: ListType
  title: string
  description: string
  theme: string
  visibility: 'private' | 'public'
  coverUrl?: string
  likeCount: number
  items: ListItem[]
  status: ListStatus
  startedAt?: string
  completedAt?: string
  pausedAt?: string
  totalTimeMs?: number
  createdAt: string
  updatedAt: string
}
