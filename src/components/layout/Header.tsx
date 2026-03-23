import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Moon, Sun, Globe, MoreHorizontal, BookmarkCheck, LogIn } from 'lucide-react'
import { useUIStore } from '@/store'
import { useAuthStore } from '@/store'
import { useTranslation } from 'react-i18next'
import FeedbackModal from '@/components/feedback/FeedbackModal'
import AuthModal from '@/components/auth/AuthModal'
import UserMenu from '@/components/auth/UserMenu'

export default function Header() {
  const { theme, toggleTheme, language, setLanguage } = useUIStore()
  const { user } = useAuthStore()
  const { t, i18n } = useTranslation('common')
  const location = useLocation()
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)

  const toggleLang = () => {
    const next = language === 'tr' ? 'en' : 'tr'
    setLanguage(next)
    i18n.changeLanguage(next)
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-navy text-white shadow-lg">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          {/* Geri bildirim butonu (sol üst - üç nokta) */}
          <button
            onClick={() => setFeedbackOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            title={t('feedback.title')}
            aria-label={t('feedback.title')}
          >
            <MoreHorizontal size={20} />
          </button>

          {/* Logo / Başlık */}
          <Link to="/" className="flex flex-col items-center leading-tight">
            <span className="font-display text-xl font-bold tracking-wide text-white">
              Gezerce
            </span>
            {location.pathname !== '/' && (
              <span className="text-[10px] font-medium text-white/50 -mt-0.5">
                Istanbul'u Keşfet
              </span>
            )}
          </Link>

          {/* Sağ aksiyonlar */}
          <div className="flex items-center gap-1">
            {/* Dil değiştir */}
            <button
              onClick={toggleLang}
              className="flex h-9 items-center gap-1 rounded-xl px-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors text-xs font-semibold"
              title={language === 'tr' ? 'Switch to English' : 'Türkçeye geç'}
            >
              <Globe size={15} />
              <span>{language.toUpperCase()}</span>
            </button>

            {/* Tema değiştir */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              title={theme === 'light' ? t('theme.dark') : t('theme.light')}
            >
              {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            </button>

            {/* Auth */}
            {user ? (
              <UserMenu />
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                title={t('auth.login')}
              >
                <LogIn size={17} />
              </button>
            )}

            {/* Kaydedilen planlar */}
            {user && !user.isGuest && (
              <Link
                to="/saved"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                title={t('nav.saved')}
              >
                <BookmarkCheck size={17} />
              </Link>
            )}
          </div>
        </div>
      </header>

      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}
