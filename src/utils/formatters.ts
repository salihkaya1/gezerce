import type { Currency } from '@/types'

export function formatCurrency(amount: number, currency: Currency): string {
  const locales: Record<Currency, string> = { TRY: 'tr-TR', EUR: 'de-DE', USD: 'en-US' }
  return new Intl.NumberFormat(locales[currency], {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} dk`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h} sa ${m} dk` : `${h} sa`
}

export function formatTime(isoOrHHMM: string): string {
  if (isoOrHHMM.includes('T')) {
    return new Date(isoOrHHMM).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  }
  return isoOrHHMM
}

export function formatDate(iso: string, lang = 'tr'): string {
  return new Date(iso).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}
