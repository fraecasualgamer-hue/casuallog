import { useState } from 'react'
import { Plus, Shield, Users, Lock, Globe, Trophy, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { useClan } from '../context/ClanContext'

type Tab = 'meus' | 'descobrir'

export default function ClansPage() {
  const { myClans, discoverClans, joinClan } = useClan()
  const [tab, setTab] = useState<Tab>('meus')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const hasAnyClan = myClans.length > 0
  const displayClans = tab === 'meus' ? myClans : discoverClans
  const filtered = search.length >= 2
    ? displayClans.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : displayClans

  return (
    <>
      <TopBar title="Clãs" />
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1 border-b border-bg-2/30">
            <button
              onClick={() => setTab('meus')}
              className={`relative px-5 py-3 text-[13px] font-medium transition-all ${
                tab === 'meus' ? 'text-accent-2' : 'text-text-2 hover:text-text-1'
              }`}
            >
              Meus clãs
              <span className={`ml-1.5 text-[10px] ${tab === 'meus' ? 'text-accent-2/70' : 'text-text-2/50'}`}>{myClans.length}</span>
              {tab === 'meus' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />}
            </button>
            <button
              onClick={() => setTab('descobrir')}
              className={`relative px-5 py-3 text-[13px] font-medium transition-all ${
                tab === 'descobrir' ? 'text-accent-2' : 'text-text-2 hover:text-text-1'
              }`}
            >
              Descobrir
              <span className={`ml-1.5 text-[10px] ${tab === 'descobrir' ? 'text-accent-2/70' : 'text-text-2/50'}`}>{discoverClans.length}</span>
              {tab === 'descobrir' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />}
            </button>
          </div>
          <button
            onClick={() => !hasAnyClan && navigate('/clans/criar')}
            disabled={hasAnyClan}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-card text-[12px] font-semibold transition-all ${
              hasAnyClan
                ? 'bg-bg-2/50 text-text-2/50 cursor-not-allowed'
                : 'bg-accent text-bg-0 hover:bg-accent-2'
            }`}
            title={hasAnyClan ? 'Você já faz parte de um clã' : undefined}
          >
            <Plus size={14} strokeWidth={2.5} />
            Criar clã
          </button>
        </div>

        {tab === 'descobrir' && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-card bg-bg-1/50 border border-bg-2/40 mb-6">
            <Search size={15} className="text-text-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar clãs..."
              className="flex-1 bg-transparent text-[13px] text-text-0 placeholder:text-text-2 focus:outline-none"
            />
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-bg-1 border border-bg-2/50 flex items-center justify-center mb-4">
              <Shield size={22} className="text-text-2" />
            </div>
            <p className="text-text-1 text-[14px] mb-1">
              {tab === 'meus' ? 'Você ainda não faz parte de nenhum clã.' : 'Nenhum clã encontrado.'}
            </p>
            {tab === 'meus' && (
              <>
                <p className="text-text-2 text-[12px] mb-5">Crie o seu ou entre num existente.</p>
                <button
                  onClick={() => navigate('/clans/criar')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-card bg-accent text-bg-0 text-[13px] font-semibold hover:bg-accent-2 transition-all"
                >
                  <Plus size={14} /> Criar clã
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((clan) => (
              <div
                key={clan.id}
                onClick={() => navigate(`/clans/${clan.id}`)}
                className="group p-5 rounded-card bg-bg-1/50 border border-bg-2/40 hover:border-accent/20 transition-all cursor-pointer animate-fade-in ember-glow"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div
                    className="w-12 h-12 rounded-[12px] flex items-center justify-center shrink-0"
                    style={{ background: `${clan.accent}20` }}
                  >
                    <Shield size={20} style={{ color: clan.accent }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[15px] font-semibold truncate">{clan.name}</h3>
                      {clan.joinMode === 'approval' ? (
                        <Lock size={11} className="text-text-2/50 shrink-0" />
                      ) : (
                        <Globe size={11} className="text-text-2/50 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-text-2 truncate mt-0.5">{clan.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-text-2">
                  <span className="flex items-center gap-1">
                    <Users size={12} /> {clan.memberCount}/{clan.memberLimit}
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy size={12} /> Nível {clan.level}
                  </span>
                  <span>{clan.objectives.length} objetivo{clan.objectives.length !== 1 && 's'}</span>
                  <span className="font-mono text-text-2/50">{clan.xp} XP</span>
                </div>

                {tab === 'descobrir' && (
                  hasAnyClan ? (
                    <p className="mt-3 text-[10px] text-text-2/50 text-center">Você já faz parte de um clã</p>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); joinClan(clan.id) }}
                      className="mt-3 w-full py-2 rounded-card bg-accent/10 text-accent-2 text-[12px] font-semibold hover:bg-accent/20 transition-all"
                    >
                      {clan.joinMode === 'open' ? 'Entrar' : 'Pedir para entrar'}
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
