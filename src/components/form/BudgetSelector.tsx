import { Wallet } from 'lucide-react'
import { usePlanFormStore } from '@/store'
import type { Currency } from '@/types'
import { useTranslation } from 'react-i18next'
import { clsx } from 'clsx'

const CURRENCIES: Currency[] = ['TRY', 'EUR', 'USD']

export default function BudgetSelector() {
  const { budget, setBudget, setCurrency } = usePlanFormStore()
  const { t } = useTranslation('form')

  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text)]">
        <Wallet size={16} className="text-accent" />
        {t('budget.label')}
      </label>

      {/* Sınır yok toggle */}
      <button
        type="button"
        onClick={() => setBudget({ noLimit: !budget.noLimit })}
        className={clsx(
          'flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-all',
          budget.noLimit
            ? 'border-accent bg-accent/10 text-accent'
            : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-accent/50'
        )}
      >
        <span className={clsx(
          'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all flex-shrink-0',
          budget.noLimit ? 'border-accent bg-accent' : 'border-[var(--color-border)]'
        )}>
          {budget.noLimit && <span className="h-2 w-2 rounded-full bg-white" />}
        </span>
        {t('budget.noLimit')}
      </button>

      {/* Bütçe girişi */}
      {!budget.noLimit && (
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            max={99999}
            value={budget.amount || ''}
            onChange={(e) => setBudget({ amount: Number(e.target.value) })}
            placeholder={t('budget.amountPlaceholder')}
            className="input-base flex-1"
          />
          {/* Para birimi seçici */}
          <div className="flex rounded-2xl border border-[var(--color-border)] overflow-hidden">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={clsx(
                  'px-3 py-3 text-xs font-semibold transition-colors',
                  budget.currency === c
                    ? 'bg-accent text-white'
                    : 'text-[var(--color-text-muted)] hover:text-accent'
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
