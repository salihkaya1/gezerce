import { Star } from 'lucide-react'

interface Props {
  rating: number
  total?: number
  size?: number
}

export default function StarRating({ rating, total, size = 12 }: Props) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-amber-500 font-medium">
      <Star size={size} fill="currentColor" />
      <span>{rating.toFixed(1)}</span>
      {total !== undefined && (
        <span className="text-[var(--color-text-muted)] font-normal">({total.toLocaleString()})</span>
      )}
    </span>
  )
}
