import { useState } from 'react'
import { Settings2, ChevronDown, ChevronUp } from 'lucide-react'
import { usePlanFormStore } from '@/store'
import type { FoodPreference, WalkingPreference, StartTime } from '@/types'
import { useTranslation } from 'react-i18next'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center justify-between w-full py-2.5 text-sm font-medium text-[var(--color-text)]"
    >
      <span>{label}</span>
      <span
        className={clsx(
          'relative inline-flex h-5 w-9 rounded-full transition-colors duration-200',
          checked ? 'bg-accent' : 'bg-[var(--color-border)]'
        )}
      >
        <span
          className={clsx(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
            checked ? 'translate-x-4' : 'translate-x-0.5'
          )}
        />
      </span>
    </button>
  )
}

function ChipGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={clsx(
            'chip',
            value === o.value ? 'chip-active' : 'chip-inactive'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function AdvancedSettings() {
  const [open, setOpen] = useState(false)
  const { advanced, setAdvanced } = usePlanFormStore()
  const { t } = useTranslation('form')

  const foodOptions: { value: FoodPreference; label: string }[] = [
    { value: 'none', label: t('advanced.food.none') },
    { value: 'helal', label: t('advanced.food.helal') },
    { value: 'vegan', label: t('advanced.food.vegan') },
    { value: 'vejetaryen', label: t('advanced.food.vegetarian') },
  ]

  const walkOptions: { value: WalkingPreference; label: string }[] = [
    { value: 'az', label: t('advanced.walk.low') },
    { value: 'orta', label: t('advanced.walk.medium') },
    { value: 'cok', label: t('advanced.walk.high') },
  ]

  const startOptions: { value: StartTime; label: string }[] = [
    { value: 'sabah', label: t('advanced.start.morning') },
    { value: 'ogle', label: t('advanced.start.noon') },
    { value: 'aksam', label: t('advanced.start.evening') },
  ]

  return (
    <div className="rounded-3xl border border-[var(--color-border)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3.5"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text)]">
          <Settings2 size={16} className="text-accent" />
          {t('advanced.label')}
        </span>
        {open ? <ChevronUp size={16} className="text-accent" /> : <ChevronDown size={16} className="text-[var(--color-text-muted)]" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-[var(--color-border)] px-4 pb-4 pt-3 flex flex-col gap-4">
              {/* Müze kartı */}
              <ToggleRow
                label={t('advanced.muzeKarti')}
                checked={advanced.muzeKarti}
                onChange={() => setAdvanced({ muzeKarti: !advanced.muzeKarti })}
              />

              {/* İstanbulkart */}
              <ToggleRow
                label={t('advanced.istanbulKarti')}
                checked={advanced.istanbulKarti}
                onChange={() => setAdvanced({ istanbulKarti: !advanced.istanbulKarti })}
              />

              {/* Yemek tercihi */}
              <div>
                <p className="mb-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                  {t('advanced.food.label')}
                </p>
                <ChipGroup options={foodOptions} value={advanced.foodPreference} onChange={(v) => setAdvanced({ foodPreference: v })} />
              </div>

              {/* Yürüyüş tercihi */}
              <div>
                <p className="mb-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                  {t('advanced.walk.label')}
                </p>
                <ChipGroup options={walkOptions} value={advanced.walkingPreference} onChange={(v) => setAdvanced({ walkingPreference: v })} />
              </div>

              {/* Başlangıç saati */}
              <div>
                <p className="mb-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                  {t('advanced.start.label')}
                </p>
                <ChipGroup options={startOptions} value={advanced.startTime} onChange={(v) => setAdvanced({ startTime: v })} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
