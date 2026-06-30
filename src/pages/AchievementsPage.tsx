import TopBar from '../components/TopBar'
import { useBacklog } from '../context/BacklogContext'
import { useLists } from '../context/ListsContext'
import { ACHIEVEMENTS, checkAchievements } from '../data/achievements'

export default function AchievementsPage() {
  const { items } = useBacklog()
  const { lists } = useLists()

  const completedItems = items.filter((i) => i.status === 'zerado')
  const totalSeals = items.reduce((sum, i) => sum + i.seals.length, 0)
  const totalReviews = items.filter((i) => i.review && i.review.trim()).length
  const hasChangedYear = items.some((i) => i.tier !== null && i.tier >= 5)
  const kinds = new Set(items.map((i) => i.kind))
  const hasMultiMedia = kinds.has('game') && (kinds.has('movie') || kinds.has('series')) && (kinds.has('manga') || kinds.has('anime'))

  const earnedCodes = checkAchievements({
    totalItems: items.length,
    completedItems: completedItems.length,
    totalLists: lists.length,
    totalReviews,
    totalSeals,
    hasChangedYear,
    hasDiaryEntry: true,
    hasMultiMedia,
  })

  return (
    <>
      <TopBar title="Conquistas" />
      <div className="p-8">
        <p className="text-[13px] text-text-1 mb-6">
          Marcos da sua jornada. Cada conquista conta uma história.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ACHIEVEMENTS.map((ach) => {
            const earned = earnedCodes.includes(ach.code)
            return (
              <div
                key={ach.id}
                className={`flex items-center gap-4 p-4 rounded-card border transition-all ${
                  earned
                    ? 'bg-bg-1 border-accent/30'
                    : 'bg-bg-1/50 border-bg-2 opacity-50'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-card flex items-center justify-center text-xl ${
                    earned ? 'bg-accent/10' : 'bg-bg-2'
                  }`}
                >
                  {ach.icon}
                </div>
                <div className="flex-1">
                  <p className={`text-[13px] font-medium ${earned ? 'text-text-0' : 'text-text-2'}`}>
                    {ach.title}
                  </p>
                  <p className="text-[11px] text-text-2 mt-0.5">{ach.description}</p>
                </div>
                {earned && (
                  <span className="text-[10px] px-2 py-1 rounded-full bg-accent/15 text-accent-2 shrink-0">
                    Desbloqueada
                  </span>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-8 p-4 rounded-card bg-bg-1 border border-bg-2 text-center">
          <p className="text-2xl font-display font-bold text-accent-2">
            {earnedCodes.length}/{ACHIEVEMENTS.length}
          </p>
          <p className="text-[11px] text-text-2 mt-1">conquistas desbloqueadas</p>
        </div>
      </div>
    </>
  )
}
