import { NavLink } from 'react-router-dom'
import { Home, BookmarkCheck } from 'lucide-react'
import { useAuthStore } from '@/store'
import { useTranslation } from 'react-i18next'
import { clsx } from 'clsx'

export default function BottomNav() {
  const { user } = useAuthStore()
  const { t } = useTranslation('common')

  if (!user || user.isGuest) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-card)] pb-safe">
      <div className="mx-auto flex max-w-2xl items-center justify-around px-4 py-2">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors text-xs font-medium',
              isActive ? 'text-accent' : 'text-[var(--color-text-muted)]'
            )
          }
        >
          <Home size={20} />
          <span>{t('nav.home')}</span>
        </NavLink>

        <NavLink
          to="/saved"
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors text-xs font-medium',
              isActive ? 'text-accent' : 'text-[var(--color-text-muted)]'
            )
          }
        >
          <BookmarkCheck size={20} />
          <span>{t('nav.saved')}</span>
        </NavLink>
      </div>
    </nav>
  )
}
