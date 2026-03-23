import { Minus, Plus, Clock } from 'lucide-react'
import { usePlanFormStore } from '@/store'
import Chip from '@/components/ui/Chip'
import { useTranslation } from 'react-i18next'

const QUICK_HOURS = [2, 4, 6, 8, 10, 12]

export default function HourSelector() {
  const { hours, setHours } = usePlanFormStore()
  const { t } = useTranslation('form')

  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text)]">
        <Clock size={16} className="text-accent" />
        {t('hours.label')}
      </label>

      {/* Artı/Eksi + sayı */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setHours(hours - 1)}
          disabled={hours <= 1}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-border)] text-[var(--color-text)] hover:border-accent hover:text-accent transition-colors disabled:opacity-30"
        >
          <Minus size={18} />
        </button>

        <div className="flex-1 text-center">
          <span className="font-display text-4xl font-bold text-[var(--color-text)]">{hours}</span>
          <span className="ml-1.5 text-base text-[var(--color-text-muted)] font-medium">
            {t('hours.unit')}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setHours(hours + 1)}
          disabled={hours >= 12}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-border)] text-[var(--color-text)] hover:border-accent hover:text-accent transition-colors disabled:opacity-30"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Hızlı seçim chipleri */}
      <div className="flex flex-wrap gap-2">
        {QUICK_HOURS.map((h) => (
          <Chip
            key={h}
            label={`${h} ${t('hours.unit')}`}
            active={hours === h}
            onClick={() => setHours(h)}
          />
        ))}
      </div>
    </div>
  )
}
