import type { ReactNode } from 'react'
import { clsx } from 'clsx'

interface Props {
  children: ReactNode
  className?: string
  narrow?: boolean
}

export default function PageWrapper({ children, className, narrow }: Props) {
  return (
    <main
      className={clsx(
        'mx-auto w-full px-4 py-6',
        narrow ? 'max-w-lg' : 'max-w-2xl',
        className
      )}
    >
      {children}
    </main>
  )
}
