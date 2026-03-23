import { Check, Tag } from 'lucide-react'
import type { PlaceDetails, PartnerVenue } from '@/types'
import StarRating from '@/components/ui/StarRating'
import { clsx } from 'clsx'

interface Props {
  place: PlaceDetails
  selected: boolean
  onToggle: () => void
  partnerVenue?: PartnerVenue
}

export default function PlaceCard({ place, selected, onToggle, partnerVenue }: Props) {
  const photo = place.photos[0]?.url

  return (
    <button
      type="button"
      onClick={onToggle}
      className={clsx(
        'relative flex flex-col rounded-3xl border overflow-hidden text-left transition-all duration-200 w-full',
        selected
          ? 'border-accent shadow-card-hover'
          : 'border-[var(--color-border)] shadow-card hover:border-accent/50'
      )}
    >
      {/* Fotoğraf */}
      <div className="relative h-32 w-full bg-[var(--color-border)] overflow-hidden">
        {photo ? (
          <img src={photo} alt={place.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-[var(--color-text-muted)]">🏛️</div>
        )}

        {/* İndirim rozeti */}
        {partnerVenue && (
          <span className="absolute left-2 top-2 badge-discount">
            <Tag size={10} />
            %{partnerVenue.discountPercent} indirim
          </span>
        )}

        {/* Seçildi check */}
        {selected && (
          <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent shadow">
            <Check size={13} className="text-white" strokeWidth={3} />
          </span>
        )}

        {/* Açık/Kapalı */}
        {place.isOpen !== null && (
          <span className={clsx('absolute bottom-2 left-2', place.isOpen ? 'badge-open' : 'badge-closed')}>
            <span className={clsx('h-1.5 w-1.5 rounded-full', place.isOpen ? 'bg-emerald-500' : 'bg-red-500')} />
            {place.isOpen ? 'Açık' : 'Kapalı'}
          </span>
        )}
      </div>

      {/* İçerik */}
      <div className="flex flex-col gap-1 p-3 bg-[var(--color-card)]">
        <p className="text-sm font-semibold text-[var(--color-text)] line-clamp-1">{place.name}</p>
        {place.rating > 0 && (
          <StarRating rating={place.rating} total={place.userRatingsTotal} />
        )}
        <p className="text-[10px] text-[var(--color-text-muted)] line-clamp-1">{place.address}</p>
      </div>
    </button>
  )
}
