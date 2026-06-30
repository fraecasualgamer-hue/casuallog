import { useState } from 'react'
import { X, BookOpen } from 'lucide-react'

interface DiaryEntry {
  id: string
  date: string
  body: string
  gameTitle: string
  gameCover: string
}

interface Props {
  onClose: () => void
}

const mockEntries: DiaryEntry[] = [
  {
    id: 'd1',
    date: '2026-06-25',
    body: 'Cheguei no capítulo 5 de Persona 5 Royal. O palácio do Madarame é visualmente incrível. Estou curtindo muito o sistema de combate por turnos.',
    gameTitle: 'Persona 5 Royal',
    gameCover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2t97.webp',
  },
  {
    id: 'd2',
    date: '2026-06-22',
    body: 'Terminei o capítulo 3 de Yakuza 0. As substories são absurdamente boas. A de gerenciar o cabaré é viciante.',
    gameTitle: 'Yakuza 0',
    gameCover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1hn4.webp',
  },
  {
    id: 'd3',
    date: '2026-06-18',
    body: 'Li mais 30 capítulos de Berserk. O Arco da Era de Ouro é uma das melhores coisas que já consumi.',
    gameTitle: 'Berserk',
    gameCover: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx2.jpg',
  },
]

export default function DiaryModal({ onClose }: Props) {
  const [entries] = useState<DiaryEntry[]>(mockEntries)
  const [newEntry, setNewEntry] = useState('')

  function formatDate(dateStr: string) {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-bg-0/85 backdrop-blur-md animate-backdrop" />
      <div
        className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto bg-bg-1 border border-bg-2 rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-bg-2 sticky top-0 bg-bg-1 z-10">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-accent-2" />
            <h3 className="font-display text-base font-semibold">Diário de backlog</h3>
          </div>
          <button onClick={onClose} className="p-1 text-text-2 hover:text-text-0 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <div className="mb-6">
            <textarea
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              placeholder="Como está sua jornada hoje?"
              rows={3}
              className="w-full bg-bg-0 border border-bg-2 rounded-card px-4 py-3 text-sm text-text-0 placeholder:text-text-2 resize-none focus:outline-none focus:border-accent/40 transition-colors"
            />
            <div className="flex justify-end mt-2">
              <button
                disabled={!newEntry.trim()}
                className="px-4 py-2 rounded-card bg-accent text-bg-0 text-sm font-medium hover:bg-accent-2 transition-colors disabled:opacity-40"
              >
                Registrar
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="flex gap-3 p-4 rounded-card bg-bg-0 border border-bg-2">
                <div className="w-8 h-11 rounded-[4px] overflow-hidden bg-bg-2 shrink-0">
                  <img src={entry.gameCover} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-medium text-text-0">{entry.gameTitle}</span>
                    <span className="text-[10px] text-text-2">{formatDate(entry.date)}</span>
                  </div>
                  <p className="text-sm text-text-1 leading-relaxed">{entry.body}</p>
                </div>
              </div>
            ))}
          </div>

          {entries.length === 0 && (
            <p className="text-sm text-text-2 text-center py-8">
              Seu diário está vazio. Registre como está sendo sua jornada.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
