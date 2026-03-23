import { Heart, Users, UserRound, Baby, User } from 'lucide-react'
import { usePlanFormStore } from '@/store'
import type { CompanionType } from '@/types'
import { useTranslation } from 'react-i18next'
import { clsx } from 'clsx'

const OPTIONS: { value: CompanionType; icon: React.ReactNode; labelKey: string }[] = [
  { value: 'yalniz', icon: <User size={20} />, labelKey: 'companion.solo' },
  { value: 'sevgili', icon: <Heart size={20} />, labelKey: 'companion.couple' },
  { value: 'arkadas', icon: <Users size={20} />, labelKey: 'companion.friends' },
  { value: 'aile', icon: <Users size={20} />, labelKey: 'companion.family' },
  { value: 'cocuklu', icon: <Baby size={20} />, labelKey: 'companion.kids' },
]

export default function CompanionSelector() {
  const { companionType, setCompanionType } = usePlanFormStore()
  const { t } = useTranslation('form')

  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text)]">
        <UserRound size={16} className="text-accent" />
        {t('companion.label')}
      </label>

      <div className="grid grid-cols-5 gap-2">
        {OPTIONS.map(({ value, icon, labelKey }) => (
          <button
            key={value}
            type="button"
            onClick={() => setCompanionType(value)}
            className={clsx(
              'flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-center transition-all duration-150',
              companionType === value
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-accent/50 hover:text-accent'
            )}
          >
            {icon}
            <span className="text-[10px] font-medium leading-tight">{t(labelKey)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
