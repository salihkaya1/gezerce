import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import Modal from '@/components/ui/Modal'
import { useAuthStore } from '@/store'
import { createQRCode } from '@/services/firebase/qrcodes'
import Spinner from '@/components/ui/Spinner'
import { Tag, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  partnerVenueId: string
  venueName: string
  planId: string
  discountPercent?: number
}

export default function QRCodeModal({ open, onClose, partnerVenueId, venueName, planId, discountPercent = 10 }: Props) {
  const { user } = useAuthStore()
  const [code, setCode] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const generate = async () => {
      setLoading(true)
      setError(null)
      try {
        // TODO: Connect Firebase Firestore here
        const result = await createQRCode({ partnerVenueId, planId, userId: user?.uid ?? null })
        setCode(result.code)
        setExpiresAt(new Date(result.expiresAt))
      } catch {
        setError('QR kod oluşturulamadı. Lütfen tekrar deneyin.')
      } finally {
        setLoading(false)
      }
    }
    generate()
  }, [open, partnerVenueId, planId, user])

  // Geri sayım
  useEffect(() => {
    if (!expiresAt) return
    const tick = () => {
      const diff = expiresAt.getTime() - Date.now()
      if (diff <= 0) { setTimeLeft('Süresi doldu'); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${h > 0 ? `${h}s ` : ''}${m}d ${s}s`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  const qrValue = code ? `${import.meta.env.VITE_APP_URL}/validate/${code}` : ''

  return (
    <Modal open={open} onClose={onClose} title="QR İndirim Kodu">
      <div className="flex flex-col items-center gap-4 pb-2">
        {/* İndirim rozeti */}
        <div className="flex items-center gap-2 rounded-full bg-emerald-500/15 px-4 py-1.5">
          <Tag size={14} className="text-emerald-600" />
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
            {venueName} – %{discountPercent} İndirim
          </span>
        </div>

        {loading && <div className="py-8"><Spinner size="lg" /></div>}

        {error && (
          <div className="flex items-center gap-2 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-500">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {code && !loading && (
          <>
            {/* QR kod */}
            <div className="rounded-3xl border-4 border-accent/20 bg-white p-4">
              <QRCodeSVG value={qrValue} size={200} level="M" />
            </div>

            {/* Geri sayım */}
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
              <Clock size={14} />
              <span>Geçerlilik: <span className="font-semibold text-[var(--color-text)]">{timeLeft}</span></span>
            </div>

            {/* Talimat */}
            <div className="rounded-2xl bg-accent/10 px-4 py-3 text-sm text-center text-[var(--color-text)]">
              <p className="font-semibold mb-1 flex items-center justify-center gap-1.5">
                <CheckCircle2 size={15} className="text-accent" />
                Nasıl kullanılır?
              </p>
              <p className="text-[var(--color-text-muted)] text-xs leading-relaxed">
                Bu QR kodu kasiyere gösterin. Kasiyer okuttuğunda indiriminiz otomatik uygulanır.
                Tek kullanımlıktır.
              </p>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
