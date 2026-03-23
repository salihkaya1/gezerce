import type { TransitInfo as TTransitInfo } from '@/types'
import { clsx } from 'clsx'

const VEHICLE_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  metro:      { label: 'Metro',      emoji: '🚇', color: 'bg-red-500' },
  metrobus:   { label: 'Metrobüs',   emoji: '🚌', color: 'bg-orange-500' },
  otobus:     { label: 'Otobüs',     emoji: '🚌', color: 'bg-green-500' },
  tramvay:    { label: 'Tramvay',    emoji: '🚊', color: 'bg-blue-500' },
  vapur:      { label: 'Vapur',      emoji: '⛴️', color: 'bg-cyan-500' },
  yuruyu:     { label: 'Yürüyüş',   emoji: '🚶', color: 'bg-emerald-500' },
  taksi:      { label: 'Taksi',      emoji: '🚕', color: 'bg-yellow-500' },
}

interface Props {
  transit: TTransitInfo
}

export default function TransitInfo({ transit }: Props) {
  const v = VEHICLE_LABELS[transit.vehicle] ?? { label: transit.vehicle, emoji: '🚌', color: 'bg-gray-500' }

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs">
      <span className="text-base">{v.emoji}</span>
      <span className={clsx('rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white', v.color)}>
        {transit.line ?? v.label}
      </span>
      {transit.stops !== undefined && (
        <span className="text-[var(--color-text-muted)]">{transit.stops} durak</span>
      )}
      <span className="text-[var(--color-text-muted)]">·</span>
      <span className="font-semibold text-[var(--color-text)]">{transit.minutes} dk</span>
      {transit.walkMinutes ? (
        <>
          <span className="text-[var(--color-text-muted)]">+</span>
          <span className="text-[var(--color-text-muted)]">🚶 {transit.walkMinutes} dk yürüyüş</span>
        </>
      ) : null}
    </div>
  )
}
