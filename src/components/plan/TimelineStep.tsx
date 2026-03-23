import { useState } from 'react'
import type { ItineraryStep } from '@/types'
import TransitInfo from './TransitInfo'
import QRCodeModal from './QRCodeModal'
import Button from '@/components/ui/Button'
import { clsx } from 'clsx'
import { QrCode, MapPin, Clock } from 'lucide-react'

interface Props {
  step: ItineraryStep
  planId: string
  isLast: boolean
  index: number
}

export default function TimelineStep({ step, planId, isLast, index }: Props) {
  const [qrOpen, setQrOpen] = useState(false)

  return (
    <div className="flex gap-3">
      {/* Zaman çizgisi */}
      <div className="flex flex-col items-center">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent text-white text-xs font-bold shadow-sm">
          {index + 1}
        </div>
        {!isLast && <div className="flex-1 w-0.5 bg-[var(--color-border)] my-1 min-h-[2rem]" />}
      </div>

      {/* İçerik */}
      <div className={clsx('flex-1 pb-5', isLast && 'pb-1')}>
        {/* Saat + mekan */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <span className="text-xs font-bold text-accent tabular-nums">{step.time}</span>
            <h3 className="font-display text-base font-semibold text-[var(--color-text)] leading-tight">
              {step.venueName}
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5">
              <MapPin size={11} />
              {step.venueAddress}
            </p>
          </div>

          {/* QR kod butonu */}
          {step.isPartnerVenue && (
            <Button
              variant="secondary"
              size="sm"
              icon={<QrCode size={13} />}
              onClick={() => setQrOpen(true)}
              className="flex-shrink-0"
            >
              QR İndirim
            </Button>
          )}
        </div>

        {/* Süre */}
        <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] mb-2">
          <Clock size={11} />
          <span>{step.duration} dakika</span>
        </div>

        {/* Not */}
        {step.notes && (
          <p className="text-xs text-[var(--color-text-muted)] mb-2 leading-relaxed bg-[var(--color-surface)] rounded-xl px-3 py-2 border border-[var(--color-border)]">
            {step.notes}
          </p>
        )}

        {/* Toplu taşıma talimatı */}
        {step.transitToNext && !isLast && (
          <TransitInfo transit={step.transitToNext} />
        )}

        {/* QR Modal */}
        <QRCodeModal
          open={qrOpen}
          onClose={() => setQrOpen(false)}
          partnerVenueId={step.venueId}
          venueName={step.venueName}
          planId={planId}
        />
      </div>
    </div>
  )
}
