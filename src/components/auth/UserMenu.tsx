import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookmarkCheck, LogOut, ChevronDown } from 'lucide-react'
import { useAuthStore } from '@/store'
import { signOutUser } from '@/services/firebase/auth'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

export default function UserMenu() {
  const { user } = useAuthStore()
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!user) return null

  const handleSignOut = async () => {
    await signOutUser()
    toast.success(t('auth.signedOut'))
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 h-9 px-2 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-colors"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="" className="h-6 w-6 rounded-full" />
        ) : (
          <div className="h-6 w-6 rounded-full bg-accent/60 flex items-center justify-center text-xs font-bold text-white">
            {user.displayName?.[0]?.toUpperCase() ?? 'G'}
          </div>
        )}
        <ChevronDown size={13} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-44 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] shadow-xl py-1.5 z-50 animate-fade-in">
          <div className="px-3 py-2 border-b border-[var(--color-border)]">
            <p className="text-xs font-semibold text-[var(--color-text)] truncate">
              {user.displayName ?? t('auth.guest')}
            </p>
            {user.email && (
              <p className="text-[10px] text-[var(--color-text-muted)] truncate">{user.email}</p>
            )}
          </div>

          <button
            onClick={() => { navigate('/saved'); setOpen(false) }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-[var(--color-text)] hover:bg-accent/10 hover:text-accent transition-colors"
          >
            <BookmarkCheck size={14} />
            {t('nav.saved')}
          </button>

          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={14} />
            {t('auth.signOut')}
          </button>
        </div>
      )}
    </div>
  )
}
