export interface Achievement {
  id: string
  code: string
  title: string
  description: string
  icon: string
}

export interface UserAchievement {
  achievementId: string
  earnedAt: string
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    code: 'first_game',
    title: 'Primeira obra',
    description: 'Adicionou o primeiro jogo ao backlog',
    icon: '🎮',
  },
  {
    id: 'ach-2',
    code: 'first_complete',
    title: 'Primeira jornada',
    description: 'Zerou uma obra pela primeira vez',
    icon: '⭐',
  },
  {
    id: 'ach-3',
    code: 'five_complete',
    title: 'Mão cheia',
    description: 'Zerou 5 obras',
    icon: '✋',
  },
  {
    id: 'ach-4',
    code: 'first_list',
    title: 'Curador iniciante',
    description: 'Criou a primeira lista',
    icon: '📋',
  },
  {
    id: 'ach-5',
    code: 'first_review',
    title: 'Crítico de coração',
    description: 'Escreveu a primeira resenha',
    icon: '✍️',
  },
  {
    id: 'ach-6',
    code: 'ten_seals',
    title: 'Colecionador de selos',
    description: 'Usou 10 selos de sabor',
    icon: '🏷️',
  },
  {
    id: 'ach-7',
    code: 'changed_year',
    title: 'Ano transformado',
    description: 'Deu 5 estrelas a uma obra',
    icon: '💎',
  },
  {
    id: 'ach-8',
    code: 'backlog_10',
    title: 'Estante crescendo',
    description: 'Tem 10 obras no backlog',
    icon: '📚',
  },
  {
    id: 'ach-9',
    code: 'diary_entry',
    title: 'Diário iniciado',
    description: 'Escreveu a primeira entrada no diário',
    icon: '📖',
  },
  {
    id: 'ach-10',
    code: 'multi_media',
    title: 'Multimídia',
    description: 'Tem game, filme e mangá/anime no backlog',
    icon: '🌐',
  },
]

export function checkAchievements(stats: {
  totalItems: number
  completedItems: number
  totalLists: number
  totalReviews: number
  totalSeals: number
  hasChangedYear: boolean
  hasDiaryEntry: boolean
  hasMultiMedia: boolean
}): string[] {
  const earned: string[] = []

  if (stats.totalItems >= 1) earned.push('first_game')
  if (stats.completedItems >= 1) earned.push('first_complete')
  if (stats.completedItems >= 5) earned.push('five_complete')
  if (stats.totalLists >= 1) earned.push('first_list')
  if (stats.totalReviews >= 1) earned.push('first_review')
  if (stats.totalSeals >= 10) earned.push('ten_seals')
  if (stats.hasChangedYear) earned.push('changed_year')
  if (stats.totalItems >= 10) earned.push('backlog_10')
  if (stats.hasDiaryEntry) earned.push('diary_entry')
  if (stats.hasMultiMedia) earned.push('multi_media')

  return earned
}
