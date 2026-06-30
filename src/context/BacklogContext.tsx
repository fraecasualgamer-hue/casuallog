import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { mockBacklog, type BacklogItem } from '../data/mock'
import { useAuth } from './AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import {
  fetchUserBacklog,
  addToBacklog,
  removeFromBacklog,
  upsertProgress,
  updateMediaFields,
} from '../lib/backlog-service'

interface BacklogContextValue {
  items: BacklogItem[]
  updateItem: (id: string, updates: Partial<BacklogItem>) => void
  addItem: (item: BacklogItem) => void
  removeItem: (id: string) => void
  loading: boolean
}

const BacklogContext = createContext<BacklogContextValue | null>(null)

// Extrai source/sourceId do id vindo da busca, ex: "igdb-119133" → ['igdb','119133']
function parseSource(id: string): { source: string; sourceId: string } {
  const dash = id.indexOf('-')
  if (dash > 0) {
    return { source: id.slice(0, dash), sourceId: id.slice(dash + 1) }
  }
  return { source: 'manual', sourceId: id }
}

export function BacklogProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<BacklogItem[]>(
    isSupabaseConfigured ? [] : mockBacklog,
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setItems(mockBacklog)
      return
    }
    if (!user) {
      setItems([])
      return
    }

    let cancelled = false
    setLoading(true)
    fetchUserBacklog(user.id).then((data) => {
      if (cancelled) return
      setItems(data)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [user])

  function updateItem(id: string, updates: Partial<BacklogItem>) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    )

    if (isSupabaseConfigured && user) {
      // campos do usuário → progress
      const progressFields: Partial<BacklogItem> = {}
      for (const k of ['status', 'tier', 'seals', 'review', 'obtained', 'runs', 'platform'] as const) {
        if (updates[k] !== undefined) (progressFields as any)[k] = updates[k]
      }
      if (Object.keys(progressFields).length > 0) {
        upsertProgress(user.id, id, progressFields)
      }
      // campos intrínsecos editados → media_items
      const mediaFields: Partial<BacklogItem> = {}
      for (const k of ['developer', 'price', 'genre', 'subgenre', 'whereToWatch'] as const) {
        if (updates[k] !== undefined) (mediaFields as any)[k] = updates[k]
      }
      if (Object.keys(mediaFields).length > 0) {
        updateMediaFields(id, mediaFields)
      }
    }
  }

  function addItem(item: BacklogItem) {
    // adiciona otimisticamente
    setItems((prev) => [item, ...prev])

    if (isSupabaseConfigured && user) {
      const { source, sourceId } = parseSource(item.id)
      addToBacklog(user.id, item, source, sourceId).then((realId) => {
        if (realId && realId !== item.id) {
          // troca o id temporário pelo uuid real do media_item
          setItems((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, id: realId } : i)),
          )
        }
      })
    }
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id))
    if (isSupabaseConfigured && user) {
      removeFromBacklog(user.id, id)
    }
  }

  return (
    <BacklogContext.Provider
      value={{ items, updateItem, addItem, removeItem, loading }}
    >
      {children}
    </BacklogContext.Provider>
  )
}

export function useBacklog() {
  const ctx = useContext(BacklogContext)
  if (!ctx) throw new Error('useBacklog must be used within BacklogProvider')
  return ctx
}
