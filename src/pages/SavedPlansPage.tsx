import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '@/components/layout/PageWrapper'
import Skeleton from '@/components/ui/Skeleton'
import Button from '@/components/ui/Button'
import { useAuthStore } from '@/store'
import { useTranslation } from 'react-i18next'
import type { Plan } from '@/types'
import { getUserPlans } from '@/services/firebase/plans'
import { MapPin, Clock, ArrowRight, BookmarkX } from 'lucide-react'

export default function SavedPlansPage() {
  const { user } = useAuthStore()
  const { t } = useTranslation('plan')
  const navigate = useNavigate()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.isGuest) return
    const load = async () => {
      setLoading(true)
      try {
        // TODO: Connect Firebase Firestore here
        const data = await getUserPlans(user.uid)
        setPlans(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  if (!user || user.isGuest) {
    return (
      <PageWrapper narrow>
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <span className="text-5xl">🔐</span>
          <h2 className="font-display text-xl font-bold text-[var(--color-text)]">
            {t('loginRequired')}
          </h2>
          <Button onClick={() => navigate('/')}>{t('backHome')}</Button>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper narrow>
      <h1 className="font-display text-2xl font-bold text-[var(--color-text)] mb-5">
        {t('savedPlans')}
      </h1>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <BookmarkX size={40} className="text-[var(--color-border)]" />
          <p className="text-[var(--color-text-muted)]">{t('noSavedPlans')}</p>
          <Button variant="secondary" onClick={() => navigate('/')} size="sm">{t('createPlan')}</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => navigate(`/plan/${plan.id}`)}
              className="card p-4 flex items-center gap-3 text-left hover:border-accent transition-colors w-full"
            >
              <div className="flex-1">
                <p className="font-semibold text-[var(--color-text)]">{plan.title}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-text-muted)]">
                  <span className="flex items-center gap-1"><MapPin size={11} /> {plan.formData.startLocation?.name ?? '—'}</span>
                  <span className="flex items-center gap-1"><Clock size={11} /> {plan.formData.hours} saat</span>
                </div>
              </div>
              <ArrowRight size={16} className="text-[var(--color-text-muted)] flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
