import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { Home } from 'lucide-react'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 text-center px-4">
      <span className="text-6xl">🗺️</span>
      <h1 className="font-display text-3xl font-bold text-[var(--color-text)]">404</h1>
      <p className="text-[var(--color-text-muted)]">Bu sayfa bulunamadı.</p>
      <Button onClick={() => navigate('/')} icon={<Home size={16} />}>Ana Sayfaya Dön</Button>
    </div>
  )
}
