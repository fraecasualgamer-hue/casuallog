import { createContext, useContext, useState, type ReactNode } from 'react'
import { mockClans, type Clan, type ClanWallPost } from '../data/clan-data'

interface ClanContextValue {
  clans: Clan[]
  myClans: Clan[]
  discoverClans: Clan[]
  getClan: (id: string) => Clan | undefined
  createClan: (clan: Clan) => void
  joinClan: (clanId: string) => void
  leaveClan: (clanId: string) => void
  addWallPost: (clanId: string, post: ClanWallPost) => void
  toggleReaction: (clanId: string, postId: string, emoji: string) => void
}

const ClanContext = createContext<ClanContextValue | null>(null)
const MY_USER_ID = 'community-frae'

export function ClanProvider({ children }: { children: ReactNode }) {
  const [clans, setClans] = useState<Clan[]>(mockClans)

  const myClans = clans.filter((c) => c.members.some((m) => m.userId === MY_USER_ID))
  const discoverClans = clans.filter((c) => !c.members.some((m) => m.userId === MY_USER_ID))

  function getClan(id: string) {
    return clans.find((c) => c.id === id)
  }

  function createClan(clan: Clan) {
    setClans((prev) => [clan, ...prev])
  }

  function joinClan(clanId: string) {
    setClans((prev) =>
      prev.map((c) =>
        c.id === clanId
          ? {
              ...c,
              memberCount: c.memberCount + 1,
              members: [
                ...c.members,
                {
                  userId: MY_USER_ID,
                  username: 'fraecasual',
                  displayName: 'Frae Casual',
                  avatarUrl: null,
                  role: 'member' as const,
                  joinedAt: new Date().toISOString().split('T')[0],
                  gamesCompleted: 0,
                  objectivesCompleted: 0,
                  streak: 0,
                },
              ],
            }
          : c,
      ),
    )
  }

  function leaveClan(clanId: string) {
    setClans((prev) =>
      prev.map((c) =>
        c.id === clanId
          ? {
              ...c,
              memberCount: c.memberCount - 1,
              members: c.members.filter((m) => m.userId !== MY_USER_ID),
            }
          : c,
      ),
    )
  }

  function addWallPost(clanId: string, post: ClanWallPost) {
    setClans((prev) =>
      prev.map((c) => (c.id === clanId ? { ...c, wall: [post, ...c.wall] } : c)),
    )
  }

  function toggleReaction(clanId: string, postId: string, emoji: string) {
    setClans((prev) =>
      prev.map((c) => {
        if (c.id !== clanId) return c
        return {
          ...c,
          wall: c.wall.map((p) => {
            if (p.id !== postId) return p
            const existing = p.reactions.find((r) => r.emoji === emoji)
            if (existing) {
              const has = existing.userIds.includes(MY_USER_ID)
              return {
                ...p,
                reactions: has
                  ? p.reactions.map((r) =>
                      r.emoji === emoji ? { ...r, userIds: r.userIds.filter((u) => u !== MY_USER_ID) } : r,
                    ).filter((r) => r.userIds.length > 0)
                  : p.reactions.map((r) =>
                      r.emoji === emoji ? { ...r, userIds: [...r.userIds, MY_USER_ID] } : r,
                    ),
              }
            }
            return { ...p, reactions: [...p.reactions, { emoji, userIds: [MY_USER_ID] }] }
          }),
        }
      }),
    )
  }

  return (
    <ClanContext.Provider
      value={{ clans, myClans, discoverClans, getClan, createClan, joinClan, leaveClan, addWallPost, toggleReaction }}
    >
      {children}
    </ClanContext.Provider>
  )
}

export function useClan() {
  const ctx = useContext(ClanContext)
  if (!ctx) throw new Error('useClan must be used within ClanProvider')
  return ctx
}
