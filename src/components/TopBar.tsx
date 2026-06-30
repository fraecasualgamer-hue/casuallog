import { Search } from 'lucide-react'

interface Props {
  title: string
  subtitle?: string
  onSearchClick?: () => void
}

// Aberração cromática igual ao HTML Thunder Ray:
// text-shadow: 3px 0 0 rgba(255,45,143,.55), -3px 0 0 rgba(39,215,255,.55), 0 0 30px rgba(255,230,0,.18)
const CHROMA_SHADOW = '3px 0 0 rgba(255,45,143,.55), -3px 0 0 rgba(39,215,255,.55), 0 0 30px rgba(255,230,0,.18)'
const SPARK_SHADOW  = '0 0 22px rgba(255,230,0,.6)'

export default function TopBar({ title, subtitle, onSearchClick }: Props) {
  // Última palavra vira "spark" amarelo — igual ao HTML (MEU **BACKLOG**)
  const words = title.toUpperCase().split(' ')
  const spark = words.pop()!
  const rest  = words.join(' ')

  return (
    <header className="flex items-start justify-between px-8 pt-8 pb-5 sticky top-0 z-20 bg-bg-0/85 backdrop-blur-md border-b border-bg-3/30">
      <div>
        <h1
          style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: '48px',
            lineHeight: 1,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            color: '#F4EEFF',
            textShadow: CHROMA_SHADOW,
          }}
        >
          {rest && <>{rest} </>}
          <span style={{ color: '#FFE600', textShadow: SPARK_SHADOW }}>{spark}</span>
        </h1>
        {subtitle && (
          <p style={{ color: '#6F6488', fontSize: '13px', marginTop: '6px' }}>{subtitle}</p>
        )}
      </div>

      {onSearchClick && (
        <button
          onClick={onSearchClick}
          className="flex items-center gap-2.5 px-4 py-2 rounded-card bg-bg-1/80 border border-bg-3/60 text-text-2 text-[13px] hover:border-accent/30 hover:text-text-1 transition-all duration-200 mt-2 shrink-0"
        >
          <Search size={14} strokeWidth={2} />
          <span>Buscar obra...</span>
          <kbd className="font-mono text-[10px] text-text-2/70 ml-3 px-1.5 py-0.5 rounded-[6px] bg-bg-0/80 border border-bg-3/60">
            /
          </kbd>
        </button>
      )}
    </header>
  )
}
