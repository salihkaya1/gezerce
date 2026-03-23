import { MapPin } from 'lucide-react'
import { usePlanFormStore } from '@/store'
import { useTranslation } from 'react-i18next'
import { clsx } from 'clsx'

export default function VisitedToggle() {
  const { visitedBefore, setVisitedBefore } = usePlanFormStore()
  const { t } = useTranslation('form')

  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text)]">
        <MapPin size={16} className="text-accent" />
        {t('visited.label')}
      </label>

      <div className="flex gap-3">
        {[
          { value: true, key: 'visited.yes' },
          { value: false, key: 'visited.no' },
        ].map(({ value, key }) => (
          <button
            key={key}
            type="button"
            onClick={() => setVisitedBefore(value)}
            className={clsx(
              'flex-1 rounded-2xl border py-3 text-sm font-semibold transition-all duration-150',
              visitedBefore === value
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-accent/50'
            )}
          >
            {t(key)}
          </button>
        ))}
      </div>
    </div>
  )
}
