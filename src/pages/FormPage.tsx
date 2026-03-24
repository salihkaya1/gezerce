import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageWrapper from '@/components/layout/PageWrapper'
import HourSelector from '@/components/form/HourSelector'
import LocationInput from '@/components/form/LocationInput'
import CompanionSelector from '@/components/form/CompanionSelector'
import BudgetSelector from '@/components/form/BudgetSelector'
import VisitedToggle from '@/components/form/VisitedToggle'
import AdvancedSettings from '@/components/form/AdvancedSettings'
import Button from '@/components/ui/Button'
import { usePlanFormStore } from '@/store'
import { useTranslation } from 'react-i18next'
import { MapPin, Sparkles } from 'lucide-react'

export default function FormPage() {
  const { startLocation } = usePlanFormStore()
  const { t } = useTranslation('form')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Konum girilmemişse Sultanahmet'i varsayılan al
    if (!startLocation) {
      usePlanFormStore.getState().setStartLocation({ placeId: '', name: 'Sultanahmet', lat: 41.0082, lng: 28.9784 })
    }
    navigate('/select')
  }

  return (
    <PageWrapper narrow>
      {/* Hero başlık */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-7 text-center"
      >
        <div className="mb-2 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
            <Sparkles size={12} />
            {t('hero.badge')}
          </span>
        </div>
        <h1 className="font-display text-3xl font-bold text-[var(--color-text)]">
          {t('hero.title')}
        </h1>
        <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
          {t('hero.subtitle')}
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Form alanları */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="card p-5 flex flex-col gap-6"
        >
          <HourSelector />
          <div className="h-px bg-[var(--color-border)]" />
          <LocationInput />
          <div className="h-px bg-[var(--color-border)]" />
          <CompanionSelector />
          <div className="h-px bg-[var(--color-border)]" />
          <BudgetSelector />
          <div className="h-px bg-[var(--color-border)]" />
          <VisitedToggle />
        </motion.div>

        {/* Gelişmiş ayarlar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <AdvancedSettings />
        </motion.div>

        {/* CTA butonu */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Button
            type="submit"
            size="lg"
            fullWidth
            icon={<MapPin size={18} />}
            >
            {t('cta')}
          </Button>
        </motion.div>
      </form>
    </PageWrapper>
  )
}
