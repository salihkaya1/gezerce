import Modal from '@/components/ui/Modal'
import FeedbackForm from './FeedbackForm'
import { useTranslation } from 'react-i18next'

interface Props {
  open: boolean
  onClose: () => void
}

export default function FeedbackModal({ open, onClose }: Props) {
  const { t } = useTranslation('common')

  return (
    <Modal open={open} onClose={onClose} title={t('feedback.title')}>
      <FeedbackForm onSuccess={onClose} />
    </Modal>
  )
}
