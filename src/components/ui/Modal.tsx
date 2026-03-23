import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
  hideClose?: boolean
}

export default function Modal({ open, onClose, title, children, className, hideClose }: Props) {
  // ESC ile kapat
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Body scroll kilitle
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal panel */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={clsx(
              'relative z-10 w-full max-w-lg rounded-t-3xl sm:rounded-3xl',
              'bg-[var(--color-card)] border border-[var(--color-border)] shadow-2xl',
              'max-h-[90vh] overflow-y-auto',
              className
            )}
          >
            {/* Handle bar (mobile) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="h-1 w-10 rounded-full bg-[var(--color-border)]" />
            </div>

            {(title || !hideClose) && (
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
                {title && (
                  <h2 className="font-display text-base font-semibold text-[var(--color-text)]">
                    {title}
                  </h2>
                )}
                {!hideClose && (
                  <button
                    onClick={onClose}
                    className="ml-auto flex h-8 w-8 items-center justify-center rounded-xl text-[var(--color-text-muted)] hover:bg-accent/10 hover:text-accent transition-colors"
                    aria-label="Kapat"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            )}

            <div className="px-5 py-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
