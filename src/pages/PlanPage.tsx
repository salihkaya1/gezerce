import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageWrapper from '@/components/layout/PageWrapper'
import TimelineStep from '@/components/plan/TimelineStep'
import WeatherWidget from '@/components/plan/WeatherWidget'
import MapView from '@/components/plan/MapView'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'
import { usePlanStore, useOfflineStore, useAuthStore } from '@/store'
import { useTranslation } from 'react-i18next'
import { Share2, Download, ArrowLeft, BookmarkPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { cachePlan } from '@/utils/offlineCache'
import { savePlan } from '@/services/firebase/plans'

export default function PlanPage() {
  const { planId, shareCode } = useParams<{ planId?: string; shareCode?: string }>()
  const resolvedId = planId ?? shareCode
  const navigate = useNavigate()
  const { t } = useTranslation('plan')
  const { currentPlan, generating, error } = usePlanStore()
  const { addCachedPlan, isCached } = useOfflineStore()
  const { user } = useAuthStore()

  useEffect(() => {
    // Eğer resolvedId varsa ama store'da plan yoksa Firestore'dan yükle
    if (resolvedId && !currentPlan) {
      // TODO: Connect Firebase Firestore here
      // fetchPlan(resolvedId).then(setPlan)
    }
  }, [resolvedId, currentPlan])

  const handleShare = async () => {
    const url = `${window.location.origin}/plan/share/${currentPlan?.shareCode ?? resolvedId}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success(t('shareCopied'))
    } catch {
      toast.error(t('shareError'))
    }
  }

  const handleOfflineDownload = async () => {
    if (!currentPlan || !resolvedId) return
    try {
      await cachePlan(resolvedId, currentPlan)
      addCachedPlan(resolvedId)
      toast.success(t('offlineSaved'))
    } catch {
      toast.error(t('offlineError'))
    }
  }

  const handleSave = async () => {
    if (!currentPlan) return
    try {
      // TODO: Connect Firebase Firestore here
      await savePlan(currentPlan)
      toast.success(t('saved'))
    } catch {
      toast.error(t('saveError'))
    }
  }

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Spinner size="lg" />
        <p className="font-display text-lg font-semibold text-[var(--color-text)]">
          {t('generating')}
        </p>
        <p className="text-sm text-[var(--color-text-muted)] text-center max-w-xs">
          {t('generatingDesc')}
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <PageWrapper narrow>
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <span className="text-5xl">😕</span>
          <h2 className="font-display text-xl font-bold text-[var(--color-text)]">{t('errorTitle')}</h2>
          <p className="text-sm text-[var(--color-text-muted)]">{error}</p>
          <Button onClick={() => navigate('/')} variant="secondary" icon={<ArrowLeft size={16} />}>
            {t('backHome')}
          </Button>
        </div>
      </PageWrapper>
    )
  }

  if (!currentPlan) {
    return (
      <PageWrapper narrow>
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <span className="text-5xl">🗺️</span>
          <h2 className="font-display text-xl font-bold text-[var(--color-text)]">{t('notFound')}</h2>
          <p className="text-sm text-[var(--color-text-muted)]">{t('notFoundDesc')}</p>
          <Button onClick={() => navigate('/')} variant="secondary" icon={<ArrowLeft size={16} />}>
            {t('backHome')}
          </Button>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper narrow>
      {/* Başlık + aksiyonlar */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-accent mb-3 transition-colors">
          <ArrowLeft size={15} /> {t('back')}
        </button>

        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">
              {currentPlan.title}
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {currentPlan.itinerary.length} {t('stops')} · {currentPlan.formData.hours} {t('hours')}
            </p>
          </div>

          {/* Aksiyon butonları */}
          <div className="flex gap-1.5 flex-shrink-0">
            <button
              onClick={handleShare}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-accent hover:text-accent transition-colors"
              title={t('share')}
            >
              <Share2 size={16} />
            </button>
            <button
              onClick={handleOfflineDownload}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${isCached(resolvedId ?? '') ? 'border-accent text-accent' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-accent hover:text-accent'}`}
              title={t('download')}
            >
              <Download size={16} />
            </button>
            {user && !user.isGuest && (
              <button
                onClick={handleSave}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-accent hover:text-accent transition-colors"
                title={t('save')}
              >
                <BookmarkPlus size={16} />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Hava durumu */}
      {currentPlan.weatherSnapshot && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-4">
          <WeatherWidget weather={currentPlan.weatherSnapshot} />
        </motion.div>
      )}

      {/* Harita */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mb-6">
        <MapView steps={currentPlan.itinerary} />
      </motion.div>

      {/* Zaman çizelgesi */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <h2 className="font-display text-lg font-bold text-[var(--color-text)] mb-4">{t('itinerary')}</h2>
        <div className="card p-5">
          {currentPlan.itinerary.map((step, i) => (
            <TimelineStep
              key={step.id}
              step={step}
              planId={currentPlan.id}
              isLast={i === currentPlan.itinerary.length - 1}
              index={i}
            />
          ))}
        </div>
      </motion.div>
    </PageWrapper>
  )
}
