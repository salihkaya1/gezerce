import { clsx } from 'clsx'
import type { ReactNode } from 'react'

interface Props {
  label: ReactNode
  active?: boolean
  onClick?: () => void
  icon?: ReactNode
  disabled?: boolean
  className?: string
}

export default function Chip({ label, active, onClick, icon, disabled, className }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'chip',
        active ? 'chip-active' : 'chip-inactive',
        disabled && 'opacity-40 cursor-not-allowed',
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {label}
    </button>
  )
}
