import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  is_curator: boolean
  birthdate: string | null
  onboarded: boolean
  banner_url: string | null
  accent: string | null
  favorite_genres: string[]
  favorite_platforms: string[]
  is_private: boolean
  pinned: string[]
  social_links?: {
    website?: string
    discord?: string
    steam?: string
    twitter_x?: string
  }
}

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  checkUsername: (username: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function isUnderage(birthdate: string): boolean {
  const birth = new Date(birthdate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age < 14
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) {
      setProfile({
        ...data,
        onboarded: data.onboarded ?? false,
        favorite_genres: data.favorite_genres ?? [],
        favorite_platforms: data.favorite_platforms ?? [],
        is_private: data.is_private ?? false,
        pinned: data.pinned ?? [],
      })
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured) return

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) fetchProfile(s.user.id)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) fetchProfile(s.user.id)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signInWithGoogle() {
    if (!isSupabaseConfigured) return
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { prompt: 'select_account' },
      },
    })
  }

  async function signOut() {
    if (!isSupabaseConfigured) return
    await supabase.auth.signOut()
    setProfile(null)
  }

  async function updateProfile(updates: Partial<Profile>) {
    if (!isSupabaseConfigured || !user) return
    const { data } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    if (data) {
      setProfile({
        ...data,
        onboarded: data.onboarded ?? false,
        favorite_genres: data.favorite_genres ?? [],
        favorite_platforms: data.favorite_platforms ?? [],
        is_private: data.is_private ?? false,
        pinned: data.pinned ?? [],
      })
    }
  }

  async function checkUsername(username: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .neq('id', user?.id ?? '')
      .maybeSingle()
    return !data
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signInWithGoogle,
        signOut,
        updateProfile,
        checkUsername,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
