import { useState, useId } from 'react'

const STAR_PATH =
  'M12 2 L14.9 8.3 L22 9.3 L17 14.2 L18.2 21.2 L12 17.8 L5.8 21.2 L7 14.2 L2 9.3 L9.1 8.3 Z'

function StarSvg({ fill, size, clipId }: { fill: number; size: number; clipId: string }) {
  const f = Math.max(0, Math.min(1, fill))
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0 }}>
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="0" width={24 * f} height="24" />
        </clipPath>
      </defs>
      <path d={STAR_PATH} fill="rgba(80,55,130,0.4)" />
      {f > 0 && <path d={STAR_PATH} fill="#FFE600" clipPath={`url(#${clipId})`} />}
    </svg>
  )
}

interface Props {
  value: number | null
  onChange?: (v: number | null) => void
  readOnly?: boolean
  size?: number
  showValue?: boolean
  className?: string
}

export default function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 22,
  showValue = false,
  className = '',
}: Props) {
  const baseId = useId()
  const [hover, setHover] = useState<number | null>(null)

  const display = hover ?? value ?? 0

  function getQuarter(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    return Math.ceil((x / rect.width) * 4) / 4
  }

  function starFill(i: number) {
    return Math.max(0, Math.min(1, display - i))
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={() => !readOnly && setHover(null)}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{ width: size, height: size, cursor: readOnly ? 'default' : 'pointer', userSelect: 'none' }}
            onMouseMove={(e) => { if (!readOnly) setHover(i + getQuarter(e)) }}
            onClick={(e) => {
              if (readOnly || !onChange) return
              const v = i + getQuarter(e)
              onChange(v === value ? null : v)
            }}
          >
            <StarSvg fill={starFill(i)} size={size} clipId={`${baseId}-${i}`} />
          </div>
        ))}
      </div>
      {showValue && (
        <span
          className="text-[12px] font-mono tabular-nums"
          style={{ color: display > 0 ? '#FFE600' : 'rgba(160,140,190,0.4)' }}
        >
          {display > 0
            ? display.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
            : '—'}
        </span>
      )}
    </div>
  )
}
