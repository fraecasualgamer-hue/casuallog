import { useState, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Home, Library, LayoutList, Compass, User, LogOut, BookOpen, Trophy, Users, Shield, Zap, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSocial } from '../context/SocialContext'
import logo from '../assets/logo.png'

const mainNav = [
  { to: '/', icon: Home, label: 'Início' },
  { to: '/backlog', icon: Library, label: 'Meu backlog' },
  { to: '/listas', icon: LayoutList, label: 'Minhas listas' },
  { to: '/explorar', icon: Compass, label: 'Explorar', disabled: true },
  { to: '/clans', icon: Shield, label: 'Clãs', disabled: true },
]

const secondaryNav = [
  { to: '/diario', icon: BookOpen, label: 'Diário', disabled: true },
  { to: '/conquistas', icon: Trophy, label: 'Conquistas', disabled: true },
]

const SOCIAL_SUBS = [
  { tab: 'feed',      label: 'Feed' },
  { tab: 'amigos',    label: 'Amigos',    badge: true },
  { tab: 'atividade', label: 'Atividade' },
]

function SocialItem({ pendingCount }: { pendingCount: number }) {
  const location  = useLocation()
  const navigate  = useNavigate()
  const isOnSocial = location.pathname === '/conexoes'
  const activeTab  = new URLSearchParams(location.search).get('tab') || 'feed'
  const [open, setOpen] = useState(isOnSocial)

  useEffect(() => { if (isOnSocial) setOpen(true) }, [isOnSocial])

  function toggle() {
    if (!isOnSocial) navigate('/conexoes?tab=feed')
    setOpen((v) => !v)
  }

  return (
    <div>
      <button
        onClick={toggle}
        className={`nav-indicator ${isOnSocial ? 'active' : ''} flex items-center gap-3 px-2.5 py-2 rounded-[10px] text-[14px] font-medium transition-all duration-200 w-full ${
          isOnSocial ? 'bg-accent/8 text-accent' : 'text-text-1 hover:bg-bg-2/30 hover:text-text-0'
        }`}
        style={isOnSocial ? { boxShadow: 'inset 0 0 0 1px rgba(43,245,160,.16)' } : {}}
      >
        <span className="nav-tile"><Users size={15} strokeWidth={1.8} /></span>
        <span className="flex-1 text-left">Social</span>
        {!open && pendingCount > 0 && (
          <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-status-playing text-bg-0 text-[9px] font-bold px-1"
            style={{ boxShadow: '0 0 8px rgba(255,45,143,.5)' }}>
            {pendingCount}
          </span>
        )}
        <ChevronDown size={12} strokeWidth={2} className={`transition-transform duration-200 text-text-2/50 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="ml-[30px] mt-0.5 mb-1 pl-3 border-l border-bg-2/35 space-y-0.5">
          {SOCIAL_SUBS.map((sub) => {
            const active = isOnSocial && activeTab === sub.tab
            return (
              <NavLink
                key={sub.tab}
                to={`/conexoes?tab=${sub.tab}`}
                className={`flex items-center justify-between py-1.5 px-2 rounded-[7px] text-[13px] transition-all duration-150 ${
                  active ? 'text-accent font-semibold' : 'text-text-2 hover:text-text-1'
                }`}
              >
                <span>{sub.label}</span>
                {sub.badge && pendingCount > 0 && (
                  <span className="min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-status-playing text-bg-0 text-[9px] font-bold px-1"
                    style={{ boxShadow: '0 0 8px rgba(255,45,143,.5)' }}>
                    {pendingCount}
                  </span>
                )}
              </NavLink>
            )
          })}
        </div>
      )}
    </div>
  )
}

function NavItemDisabled({ icon: Icon, label }: { icon: typeof Home; label: string }) {
  return (
    <div className="flex items-center gap-3 px-2.5 py-2 rounded-[10px] text-[14px] font-medium opacity-35 cursor-not-allowed select-none">
      <span className="nav-tile"><Icon size={15} strokeWidth={1.8} /></span>
      <span className="flex-1">{label}</span>
      <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full border border-text-2/20 text-text-2/60">
        em breve
      </span>
    </div>
  )
}

function NavItem({ to, icon: Icon, label, badgeCount }: { to: string; icon: typeof Home; label: string; badgeCount?: number }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `nav-indicator ${isActive ? 'active' : ''} flex items-center gap-3 px-2.5 py-2 rounded-[10px] text-[14px] font-medium transition-all duration-200 ${
          isActive
            ? 'bg-accent/8 text-accent'
            : 'text-text-1 hover:bg-bg-2/30 hover:text-text-0'
        }`
      }
      style={({ isActive }) => isActive ? { boxShadow: 'inset 0 0 0 1px rgba(43,245,160,.16)' } : {}}
    >
      <span className="nav-tile">
        <Icon size={15} strokeWidth={1.8} />
      </span>
      <span className="flex-1">{label}</span>
      {badgeCount != null && badgeCount > 0 && (
        <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-status-playing text-bg-0 text-[9px] font-bold px-1"
          style={{ boxShadow: '0 0 8px rgba(255,45,143,.5)' }}>
          {badgeCount}
        </span>
      )}
    </NavLink>
  )
}

export default function Sidebar() {
  const { user, profile, signOut } = useAuth()
  let pendingCount = 0
  try {
    const social = useSocial()
    pendingCount = social.pendingCount
  } catch {
    // SocialProvider not mounted yet (onboarding)
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] bg-bg-1/80 backdrop-blur-md flex flex-col z-30 border-r border-bg-3/25" style={{ position: 'fixed' }}>
      {/* Volt neon edge — igual ao .side::after do HTML */}
      <div
        className="absolute top-0 bottom-0 right-0 w-[2px] pointer-events-none z-10"
        style={{
          background: 'linear-gradient(180deg, transparent, rgba(43,245,160,.55) 16%, rgba(43,245,160,.42) 64%, transparent)',
          opacity: 0.6,
        }}
      />

      <div className="px-4 pt-5 pb-2">
        <div className="flex items-center justify-center py-2">
          <img src={logo} alt="CasualLog" className="h-28 w-auto" />
        </div>
        {/* brandline volt */}
        <div className="mt-3 mx-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(43,245,160,.55), rgba(43,245,160,.05) 60%, transparent)' }} />
      </div>

      <nav className="flex-1 px-3 space-y-6 overflow-y-auto">
        <div className="space-y-0.5">
          {mainNav.map((item) =>
            item.disabled
              ? <NavItemDisabled key={item.to} icon={item.icon} label={item.label} />
              : <NavItem key={item.to} {...item} />
          )}
        </div>
        <div>
          <p className="px-3 mb-2 text-[10px] font-display font-bold uppercase tracking-[0.15em] text-text-2/50 flex items-center gap-2">
            <span className="inline-block w-2.5 h-0.5 bg-bg-3" style={{ transform: 'skewX(-20deg)' }} />
            Pessoal
          </p>
          <div className="space-y-0.5">
            {secondaryNav.map((item) =>
              item.disabled
                ? <NavItemDisabled key={item.to} icon={item.icon} label={item.label} />
                : <NavItem key={item.to} {...item} />
            )}
            <NavItemDisabled icon={Users} label="Social" />
          </div>
        </div>
      </nav>

      <div className="px-3 pb-5 pt-3">
        {/* Card de perfil — igual ao .profile do HTML de referência */}
        <NavLink
          to="/perfil"
          className={({ isActive }) =>
            `flex items-center gap-[11px] rounded-[12px] border mb-[6px] no-underline transition-all duration-200 ${
              isActive
                ? 'border-bg-3/80 bg-[rgba(31,17,51,.7)]'
                : 'border-bg-3/50 bg-[rgba(31,17,51,.45)] hover:bg-[rgba(31,17,51,.7)] hover:border-bg-3/70'
            }`
          }
          style={{ padding: '9px 10px' }}
        >
          {/* Avatar */}
          <div
            className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center flex-none relative overflow-visible"
            style={{
              background: 'linear-gradient(135deg,#3a2658,#180d26)',
              boxShadow: '0 0 0 1px rgba(43,245,160,.4), 0 0 14px rgba(43,245,160,.16)',
            }}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full rounded-[10px] object-cover" />
            ) : (
              <User size={19} strokeWidth={1.8} style={{ color: 'var(--color-accent)' }} />
            )}
            {/* Dot online volt */}
            <span
              className="absolute"
              style={{
                right: '-3px', bottom: '-3px',
                width: '12px', height: '12px',
                borderRadius: '50%',
                background: 'var(--color-accent)',
                border: '2.5px solid var(--color-bg-0)',
                boxShadow: '0 0 8px var(--color-accent)',
              }}
            />
          </div>

          {/* Meta */}
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold text-text-0 leading-[1.1] truncate">
              {profile?.display_name || 'Meu perfil'}
            </div>
            <div
              className="flex items-center gap-[5px] mt-[3px]"
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: '10.5px',
                fontWeight: 600,
                letterSpacing: '.05em',
                color: '#FFE600',
              }}
            >
              <Zap size={12} strokeWidth={2} style={{ color: '#FFE600', filter: 'drop-shadow(0 0 5px rgba(255,230,0,.6))' }} />
              RANK A · NÍVEL 12
            </div>
          </div>
        </NavLink>

        {/* Sair — centralizado */}
        {user && (
          <button
            onClick={signOut}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-[8px] text-[12px] text-text-2/70 hover:bg-bg-2/25 hover:text-text-1 transition-all duration-200"
          >
            <LogOut size={13} strokeWidth={1.8} />
            Sair
          </button>
        )}
      </div>
    </aside>
  )
}
