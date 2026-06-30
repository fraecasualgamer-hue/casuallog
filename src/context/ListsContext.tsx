import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import type { UserList, ListItem } from '../data/list-rules'
import { useAuth } from './AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import {
  fetchUserLists,
  createList,
  updateListRemote,
  deleteListRemote,
  addListItemRemote,
  removeListItemRemote,
  updateListItemRemote,
  reorderListItemsRemote,
} from '../lib/lists-service'

interface ListsContextValue {
  lists: UserList[]
  loading: boolean
  addList: (list: UserList) => void
  updateList: (id: string, updates: Partial<UserList>) => void
  deleteList: (id: string) => void
  addItemToList: (listId: string, item: ListItem) => void
  removeItemFromList: (listId: string, itemId: string) => void
  updateListItem: (listId: string, itemId: string, updates: Partial<ListItem>) => void
  reorderListItems: (listId: string, items: ListItem[]) => void
  markReady: (listId: string) => void
  startList: (listId: string) => void
  pauseList: (listId: string) => void
  resumeList: (listId: string) => void
  completeList: (listId: string) => void
  resetList: (listId: string) => void
}

const ListsContext = createContext<ListsContextValue | null>(null)

export function ListsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [lists, setLists] = useState<UserList[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured || !user) {
      setLists([])
      return
    }
    let cancelled = false
    setLoading(true)
    fetchUserLists(user.id).then((data) => {
      if (cancelled) return
      setLists(data)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [user])

  function addList(list: UserList) {
    // adiciona otimisticamente com id temporário
    setLists((prev) => [list, ...prev])

    if (isSupabaseConfigured && user) {
      createList(user.id, list).then((created) => {
        if (created) {
          setLists((prev) => prev.map((l) => (l.id === list.id ? created : l)))
        }
      })
    }
  }

  function updateList(id: string, updates: Partial<UserList>) {
    setLists((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l)),
    )
    if (isSupabaseConfigured && user) {
      updateListRemote(id, updates)
    }
  }

  function deleteList(id: string) {
    setLists((prev) => prev.filter((l) => l.id !== id))
    if (isSupabaseConfigured && user) {
      deleteListRemote(id)
    }
  }

  function addItemToList(listId: string, item: ListItem) {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? { ...l, items: [...l.items, { ...item, position: l.items.length }] }
          : l,
      ),
    )

    if (isSupabaseConfigured && user) {
      addListItemRemote(listId, item).then((realId) => {
        if (realId) {
          setLists((prev) =>
            prev.map((l) =>
              l.id === listId
                ? { ...l, items: l.items.map((i) => (i.id === item.id ? { ...i, id: realId } : i)) }
                : l,
            ),
          )
        }
      })
    }
  }

  function removeItemFromList(listId: string, itemId: string) {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? { ...l, items: l.items.filter((i) => i.id !== itemId).map((i, idx) => ({ ...i, position: idx })) }
          : l,
      ),
    )
    if (isSupabaseConfigured && user) {
      removeListItemRemote(itemId)
    }
  }

  function updateListItem(listId: string, itemId: string, updates: Partial<ListItem>) {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? { ...l, items: l.items.map((i) => (i.id === itemId ? { ...i, ...updates } : i)) }
          : l,
      ),
    )
    if (isSupabaseConfigured && user) {
      updateListItemRemote(itemId, updates)
    }
  }

  function reorderListItems(listId: string, items: ListItem[]) {
    const reordered = items.map((i, idx) => ({ ...i, position: idx }))
    setLists((prev) =>
      prev.map((l) => (l.id === listId ? { ...l, items: reordered } : l)),
    )
    if (isSupabaseConfigured && user) {
      reorderListItemsRemote(reordered)
    }
  }

  function markReady(listId: string) {
    updateList(listId, { status: 'ready' })
  }

  function startList(listId: string) {
    updateList(listId, { status: 'active', startedAt: new Date().toISOString() })
  }

  function pauseList(listId: string) {
    const list = lists.find((l) => l.id === listId)
    if (!list || !list.startedAt) return
    const elapsed = list.totalTimeMs ?? 0
    const since = list.pausedAt ? 0 : Date.now() - new Date(list.startedAt).getTime()
    updateList(listId, {
      status: 'paused',
      pausedAt: new Date().toISOString(),
      totalTimeMs: elapsed + since,
    })
  }

  function resumeList(listId: string) {
    updateList(listId, {
      status: 'active',
      pausedAt: undefined,
      startedAt: new Date().toISOString(),
    })
  }

  function completeList(listId: string) {
    const list = lists.find((l) => l.id === listId)
    if (!list) return
    const elapsed = list.totalTimeMs ?? 0
    const since = list.startedAt ? Date.now() - new Date(list.startedAt).getTime() : 0
    updateList(listId, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      totalTimeMs: elapsed + since,
    })
  }

  function resetList(listId: string) {
    setLists((prev) =>
      prev.map((l) => {
        if (l.id !== listId) return l
        return {
          ...l,
          status: 'building',
          startedAt: undefined,
          completedAt: undefined,
          pausedAt: undefined,
          totalTimeMs: undefined,
          items: l.items.map((item) => ({
            ...item,
            consumed: false,
            obtained: false,
            startDate: undefined,
            doneDate: undefined,
          })),
          updatedAt: new Date().toISOString(),
        }
      }),
    )

    if (isSupabaseConfigured && user) {
      const list = lists.find((l) => l.id === listId)
      updateListRemote(listId, {
        status: 'building',
        startedAt: undefined,
        completedAt: undefined,
        pausedAt: undefined,
        totalTimeMs: undefined,
      })
      list?.items.forEach((item) => {
        updateListItemRemote(item.id, {
          consumed: false,
          obtained: false,
          startDate: undefined,
          doneDate: undefined,
        })
      })
    }
  }

  return (
    <ListsContext.Provider
      value={{
        lists,
        loading,
        addList,
        updateList,
        deleteList,
        addItemToList,
        removeItemFromList,
        updateListItem,
        reorderListItems,
        markReady,
        startList,
        pauseList,
        resumeList,
        completeList,
        resetList,
      }}
    >
      {children}
    </ListsContext.Provider>
  )
}

export function useLists() {
  const ctx = useContext(ListsContext)
  if (!ctx) throw new Error('useLists must be used within ListsProvider')
  return ctx
}
