import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import TopBar from '../components/TopBar'
import { useBacklog } from '../context/BacklogContext'

interface DiaryEntry {
  id: string
  date: string
  body: string
  mediaItemId: string
  gameTitle: string
  gameCover: string
}

const mockEntries: DiaryEntry[] = [
  {
    id: 'd1',
    date: '2026-06-25',
    body: 'Cheguei no capítulo 5 de Persona 5 Royal. O palácio do Madarame é visualmente incrível. Estou curtindo muito o sistema de combate por turnos.',
    mediaItemId: '3',
    gameTitle: 'Persona 5 Royal',
    gameCover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2t97.webp',
  },
  {
    id: 'd2',
    date: '2026-06-22',
    body: 'Terminei o capítulo 3 de Yakuza 0. As substories são absurdamente boas. A de gerenciar o cabaré é viciante.',
    mediaItemId: '9',
    gameTitle: 'Yakuza 0',
    gameCover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1hn4.webp',
  },
  {
    id: 'd3',
    date: '2026-06-18',
    body: 'Li mais 30 capítulos de Berserk. O Arco da Era de Ouro é uma das melhores coisas que já consumi.',
    mediaItemId: '12',
    gameTitle: 'Berserk',
    gameCover: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx2.jpg',
  },
]

export default function DiaryPage() {
  const { items } = useBacklog()
  const [entries] = useState<DiaryEntry[]>(mockEntries)
  const [newEntry, setNewEntry] = useState('')
  const [selectedGame, setSelectedGame] = useState('')

  const playingItems = items.filter((i) => i.status === 'jogando')

  function formatDate(dateStr: string) {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  }

  return (
    <>
      <TopBar title="Diário de backlog" />
      <div className="p-8 space-y-6">
        <section className="p-5 rounded-card bg-bg-1 border border-bg-2">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={16} className="text-accent-2" />
            <h3 className="text-[13px] font-semibold">Como está sua jornada hoje?</h3>
          </div>
          {playingItems.length > 0 && (
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="w-full bg-bg-0 border border-bg-2 rounded-card px-3 py-2 text-[13px] text-text-0 mb-3 focus:outline-none focus:border-accent/40"
            >
              <option value="">Sobre qual obra?</option>
              {playingItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          )}
          <textarea
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            placeholder="Registre seu progresso, impressões, sentimentos..."
            rows={3}
            className="w-full bg-bg-0 border border-bg-2 rounded-card px-4 py-3 text-[13px] text-text-0 placeholder:text-text-2 resize-none focus:outline-none focus:border-accent/40 transition-colors"
          />
          <div className="flex justify-end mt-2">
            <button
              disabled={!newEntry.trim()}
              className="px-4 py-2 rounded-card bg-accent text-bg-0 text-[13px] font-medium hover:bg-accent-2 transition-colors disabled:opacity-40"
            >
              Registrar
            </button>
          </div>
        </section>

        <section>
          <h3 className="font-display text-[11px] font-bold uppercase text-text-2 tracking-[0.12em] mb-4">
            Entradas recentes
          </h3>
          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="flex gap-4 p-4 rounded-card bg-bg-1 border border-bg-2">
                <div className="w-10 h-14 rounded-[6px] overflow-hidden bg-bg-2 shrink-0">
                  <img src={entry.gameCover} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[13px] font-medium">{entry.gameTitle}</span>
                    <span className="text-[10px] text-text-2">{formatDate(entry.date)}</span>
                  </div>
                  <p className="text-[13px] text-text-1 leading-relaxed">{entry.body}</p>
                </div>
              </div>
            ))}
          </div>
          {entries.length === 0 && (
            <p className="text-[13px] text-text-2 text-center py-12">
              Seu diário está vazio. Registre como está sendo sua jornada.
            </p>
          )}
        </section>
      </div>
    </>
  )
}
