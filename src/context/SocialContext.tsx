import { createContext, useContext, useState, type ReactNode } from 'react'
import { communityProfiles, type CommunityProfile } from '../data/community'

interface SocialContextValue {
  followedIds: Set<string>
  friendIds: Set<string>
  pendingSentIds: Set<string>
  pendingReceivedIds: Set<string>
  follow: (id: string) => void
  unfollow: (id: string) => void
  sendFriendRequest: (id: string) => void
  acceptFriendRequest: (id: string) => void
  removeFriend: (id: string) => void
  cancelFriendRequest: (id: string) => void
  getCommunityProfile: (id: string) => CommunityProfile | undefined
  allProfiles: CommunityProfile[]
  pendingCount: number
}

const SocialContext = createContext<SocialContextValue | null>(null)

export function SocialProvider({ children }: { children: ReactNode }) {
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set())
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set())
  const [pendingSentIds, setPendingSentIds] = useState<Set<string>>(new Set())
  const [pendingReceivedIds, setPendingReceivedIds] = useState<Set<string>>(
    new Set(['community-dark', 'community-retro']),
  )

  function follow(id: string) {
    setFollowedIds((prev) => new Set(prev).add(id))
  }

  function unfollow(id: string) {
    setFollowedIds((prev) => { const n = new Set(prev); n.delete(id); return n })
  }

  function sendFriendRequest(id: string) {
    setPendingSentIds((prev) => new Set(prev).add(id))
  }

  function acceptFriendRequest(id: string) {
    setPendingReceivedIds((prev) => { const n = new Set(prev); n.delete(id); return n })
    setFriendIds((prev) => new Set(prev).add(id))
  }

  function removeFriend(id: string) {
    setFriendIds((prev) => { const n = new Set(prev); n.delete(id); return n })
  }

  function cancelFriendRequest(id: string) {
    setPendingSentIds((prev) => { const n = new Set(prev); n.delete(id); return n })
  }

  function getCommunityProfile(id: string) {
    return communityProfiles.find((p) => p.id === id)
  }

  return (
    <SocialContext.Provider
      value={{
        followedIds,
        friendIds,
        pendingSentIds,
        pendingReceivedIds,
        follow,
        unfollow,
        sendFriendRequest,
        acceptFriendRequest,
        removeFriend,
        cancelFriendRequest,
        getCommunityProfile,
        allProfiles: communityProfiles,
        pendingCount: pendingReceivedIds.size,
      }}
    >
      {children}
    </SocialContext.Provider>
  )
}

export function useSocial() {
  const ctx = useContext(SocialContext)
  if (!ctx) throw new Error('useSocial must be used within SocialProvider')
  return ctx
}
