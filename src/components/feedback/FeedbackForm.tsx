import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import { useAuthStore, useUIStore } from '@/store'
import { submitFeedback } from '@/services/firebase/feedback'
import { MessageSquare, Mail } from 'lucide-react'

interface Props {
  onSuccess: () => void
}

export default function FeedbackForm({ onSuccess }: Props) {
  const { t } = useTranslation('common')
  const { user } = useAuthStore()
  const { language } = useUIStore()
  const location = useLocation()
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setLoading(true)
    try {
      await submitFeedback({
        message: message.trim(),
        email: email.trim() || null,
        userId: user?.uid ?? null,
        language,
        page: location.pathname,
      })
      toast.success(t('feedback.success'))
      onSuccess()
    } catch {
      toast.error(t('feedback.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-[var(--color-text-muted)]">{t('feedback.desc')}</p>

      {/* Mesaj alanı */}
      <div className="relative">
        <MessageSquare size={15} className="absolute left-3 top-3 text-[var(--color-text-muted)]" />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 500))}
          placeholder={t('feedback.messagePlaceholder')}
          rows={4}
          className="input-base pl-9 resize-none"
          required
        />
        <span className="absolute bottom-2 right-3 text-[10px] text-[var(--color-text-muted)]">
          {message.length}/500
        </span>
      </div>

      {/* E-posta (opsiyonel) */}
      <div className="relative">
        <Mail size={15} className="absolute left-3 top-3.5 text-[var(--color-text-muted)]" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('feedback.emailPlaceholder')}
          className="input-base pl-9"
        />
      </div>

      <p className="text-xs text-[var(--color-text-muted)]">{t('feedback.optional')}</p>

      {/* Gönder butonu */}
      <Button type="submit" loading={loading} fullWidth disabled={!message.trim()}>
        {t('feedback.send')}
      </Button>
    </form>
  )
}
