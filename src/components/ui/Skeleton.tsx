import { clsx } from 'clsx'

interface Props {
  className?: string
  rounded?: string
}

export default function Skeleton({ className, rounded = 'rounded-2xl' }: Props) {
  return (
    <div
      className={clsx(
        'animate-pulse bg-gradient-to-r from-[var(--color-border)] via-[var(--color-surface)] to-[var(--color-border)]',
        rounded,
        className
      )}
    />
  )
}
