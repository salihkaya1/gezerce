import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { clsx } from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
  fullWidth?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth,
  children,
  className,
  disabled,
  ...rest
}: Props) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100'

  const variants: Record<Variant, string> = {
    primary: 'bg-accent text-white hover:bg-accent-dark shadow-sm',
    secondary: 'bg-transparent border border-accent text-accent hover:bg-accent/10',
    ghost: 'bg-transparent text-[var(--color-text-muted)] hover:bg-accent/10 hover:text-accent',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  }

  const sizes: Record<Size, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      ) : icon}
      {children}
    </button>
  )
}
