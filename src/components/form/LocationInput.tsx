import { useState, useRef, useEffect } from 'react'
import { MapPin, Search, Loader2 } from 'lucide-react'
import { usePlanFormStore } from '@/store'
import { useTranslation } from 'react-i18next'

// TODO: Connect Google Places API here
// Bu bileşen şimdilik manuel giriş destekler.
// Entegrasyon için: import { fetchPlaceSuggestions } from '@/services/googlePlaces'

interface Suggestion {
  placeId: string
  name: string
  address: string
}

export default function LocationInput() {
  const { startLocation, setStartLocation } = usePlanFormStore()
  const { t } = useTranslation('form')
  const [query, setQuery] = useState(startLocation?.name ?? '')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!focused || query.length < 2) {
      setSuggestions([])
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        // TODO: Connect Google Places API here
        // const results = await fetchPlaceSuggestions(query, 'Istanbul')
        // setSuggestions(results)
        // Şimdilik boş döner — API bağlandığında yukarıdaki satırları aç
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 400)
  }, [query, focused])

  const handleSelect = (s: Suggestion) => {
    setStartLocation({ placeId: s.placeId, name: s.name, lat: 0, lng: 0 })
    setQuery(s.name)
    setSuggestions([])
    setFocused(false)
  }

  const handleManualSubmit = () => {
    if (query.trim()) {
      setStartLocation({ placeId: '', name: query.trim(), lat: 41.0082, lng: 28.9784 })
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text)]">
        <MapPin size={16} className="text-accent" />
        {t('location.label')}
      </label>

      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-3.5 text-[var(--color-text-muted)]" />
        {loading && <Loader2 size={15} className="absolute right-3.5 top-3.5 text-accent animate-spin" />}

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => { handleManualSubmit(); setTimeout(() => setFocused(false), 200) }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleManualSubmit() } }}
          placeholder={t('location.placeholder')}
          className="input-base pl-9 pr-9"
        />

        {/* Autocomplete önerileri */}
        {focused && suggestions.length > 0 && (
          <ul className="absolute top-full left-0 right-0 mt-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-xl z-20 overflow-hidden">
            {suggestions.map((s) => (
              <li key={s.placeId}>
                <button
                  type="button"
                  onMouseDown={() => handleSelect(s)}
                  className="flex w-full items-start gap-2.5 px-4 py-3 text-left hover:bg-accent/10 transition-colors"
                >
                  <MapPin size={14} className="mt-0.5 flex-shrink-0 text-accent" />
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">{s.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{s.address}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {startLocation && (
        <p className="text-xs text-accent flex items-center gap-1">
          <MapPin size={12} />
          {startLocation.name}
        </p>
      )}
    </div>
  )
}
