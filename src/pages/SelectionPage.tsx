import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageWrapper from '@/components/layout/PageWrapper'
import PlaceCard from '@/components/selection/PlaceCard'
import Skeleton from '@/components/ui/Skeleton'
import Button from '@/components/ui/Button'
import { useSelectionStore, usePlanFormStore, usePlanStore } from '@/store'
import { useTranslation } from 'react-i18next'
import type { PlaceDetails } from '@/types'
import { generatePlan } from '@/services/claudeApi'
import { fetchCurrentWeather } from '@/services/openWeather'
import { fetchNearbyPlaces, searchPlaces } from '@/services/googlePlaces'
import toast from 'react-hot-toast'
import { Sparkles, Search, Plus, Loader2, X } from 'lucide-react'

// Google Places API başarısız olursa fallback
const DEMO_PLACES: PlaceDetails[] = [
  {
    placeId: 'hagia-sophia', name: 'Ayasofya', address: 'Sultanahmet, Fatih',
    lat: 41.0086, lng: 28.9802, rating: 4.7, userRatingsTotal: 120000,
    isOpen: true, openingHours: [], photos: [{ url: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=400', attribution: '' }], types: ['tourist_attraction'],
  },
  {
    placeId: 'topkapi', name: 'Topkapı Sarayı', address: 'Sultanahmet, Fatih',
    lat: 41.0115, lng: 28.9833, rating: 4.6, userRatingsTotal: 90000,
    isOpen: true, openingHours: [], photos: [{ url: 'https://images.unsplash.com/photo-1594571901082-2c0c4de4cd17?w=400', attribution: '' }], types: ['museum'],
  },
  {
    placeId: 'galata', name: 'Galata Kulesi', address: 'Karaköy, Beyoğlu',
    lat: 41.0256, lng: 28.9742, rating: 4.5, userRatingsTotal: 75000,
    isOpen: true, openingHours: [], photos: [{ url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400', attribution: '' }], types: ['tourist_attraction'],
  },
  {
    placeId: 'bosphorus', name: 'Boğaz Turu', address: 'Eminönü, Fatih',
    lat: 41.0186, lng: 28.9741, rating: 4.8, userRatingsTotal: 45000,
    isOpen: true, openingHours: [], photos: [{ url: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=400', attribution: '' }], types: ['tourist_attraction'],
  },
  {
    placeId: 'kapalicarsi', name: 'Kapalıçarşı', address: 'Fatih',
    lat: 41.0105, lng: 28.9680, rating: 4.4, userRatingsTotal: 110000,
    isOpen: true, openingHours: [], photos: [{ url: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=400', attribution: '' }], types: ['shopping_mall'],
  },
  {
    placeId: 'istiklal', name: 'İstiklal Caddesi', address: 'Beyoğlu',
    lat: 41.0335, lng: 28.9769, rating: 4.6, userRatingsTotal: 88000,
    isOpen: true, openingHours: [], photos: [{ url: 'https://images.unsplash.com/photo-1571296310559-37e7e1bf04e1?w=400', attribution: '' }], types: ['route'],
  },
]

export default function SelectionPage() {
  const navigate = useNavigate()
  const { t } = useTranslation('selection')
  const { places, setPlaces, addPlace, selectedPlaceIds, togglePlace, isSelected } = useSelectionStore()
  const { getFormData } = usePlanFormStore()
  const { setPlan, setGenerating, setError, generating } = usePlanStore()
  const [loadingPlaces, setLoadingPlaces] = useState(true)

  // ── Manuel arama state ──
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<PlaceDetails[]>([])
  const [searching, setSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const loadPlaces = async () => {
      setLoadingPlaces(true)
      try {
        const formData = getFormData()
        const lat = formData.startLocation?.lat || 41.0082
        const lng = formData.startLocation?.lng || 28.9784

        const results = await fetchNearbyPlaces(lat, lng, formData.companionType, formData.visitedBefore)

        if (results.length > 0) {
          setPlaces(results)
        } else {
          // API çalışıyor ama sonuç yok → yine de demo göster
          toast('Yakınında mekan bulunamadı, örnek mekanlar gösteriliyor', { icon: 'ℹ️' })
          setPlaces(DEMO_PLACES)
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Mekan yükleme hatası'
        console.error('[SelectionPage] Mekan yükleme hatası:', err)
        toast.error(`Mekan API hatası: ${msg}`)
        setPlaces(DEMO_PLACES)
      } finally {
        setLoadingPlaces(false)
      }
    }
    loadPlaces()
  }, [setPlaces, getFormData])

  // ── Arama debounce ──
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const formData = getFormData()
        const lat = formData.startLocation?.lat || 41.0082
        const lng = formData.startLocation?.lng || 28.9784
        const results = await searchPlaces(searchQuery, lat, lng)
        setSearchResults(results)
      } catch {
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 500)
  }, [searchQuery, getFormData])

  const handleAddPlace = (place: PlaceDetails) => {
    addPlace(place)
    toast.success(`${place.name} eklendi`)
    setSearchQuery('')
    setSearchResults([])
    setShowSearch(false)
  }

  const handleGeneratePlan = async () => {
    if (selectedPlaceIds.size === 0) {
      toast.error(t('noSelectionError'))
      return
    }

    setGenerating(true)
    try {
      const formData = getFormData()
      const selectedPlaces = places.filter((p) => isSelected(p.placeId))

      let weather = undefined
      try {
        const loc = formData.startLocation
        if (loc) {
          weather = await fetchCurrentWeather(loc.lat || 41.0082, loc.lng || 28.9784)
        }
      } catch {
        // Hava durumu alınamazsa devam et
      }

      const plan = await generatePlan({ formData, selectedPlaces, weather })
      setPlan(plan)
      navigate(`/plan/${plan.id}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('generateError')
      setError(msg)
      toast.error(msg)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <PageWrapper>
      {/* Başlık */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">{t('title')}</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{t('subtitle')}</p>
        </div>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-accent hover:text-accent transition-colors flex-shrink-0 mt-1"
          title="Mekan ara ve ekle"
        >
          {showSearch ? <X size={16} /> : <Plus size={16} />}
        </button>
      </div>

      {/* ── Manuel mekan arama kutusu ── */}
      {showSearch && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4"
        >
          <div className="card p-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-3 text-[var(--color-text-muted)]" />
              {searching && <Loader2 size={15} className="absolute right-3 top-3 text-accent animate-spin" />}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Mekan adı ara... (örn: Dolmabahçe)"
                className="input-base pl-9 pr-9 text-sm"
                autoFocus
              />
            </div>

            {/* Arama sonuçları */}
            {searchResults.length > 0 && (
              <ul className="mt-2 flex flex-col gap-1">
                {searchResults.map((place) => {
                  const alreadyAdded = places.some((p) => p.placeId === place.placeId)
                  return (
                    <li key={place.placeId}>
                      <button
                        type="button"
                        onClick={() => !alreadyAdded && handleAddPlace(place)}
                        disabled={alreadyAdded}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-accent/10 transition-colors disabled:opacity-50"
                      >
                        {place.photos[0]?.url ? (
                          <img src={place.photos[0].url} alt="" className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-border)] text-lg flex-shrink-0">🏛️</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--color-text)] truncate">{place.name}</p>
                          <p className="text-[10px] text-[var(--color-text-muted)] truncate">{place.address}</p>
                        </div>
                        {alreadyAdded ? (
                          <span className="text-[10px] text-accent font-semibold flex-shrink-0">Eklendi</span>
                        ) : (
                          <Plus size={16} className="text-accent flex-shrink-0" />
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}

            {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
              <p className="mt-2 text-center text-xs text-[var(--color-text-muted)]">Sonuç bulunamadı</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Mekan grid */}
      {loadingPlaces ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 gap-3"
        >
          {places.map((place, i) => (
            <motion.div
              key={place.placeId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <PlaceCard
                place={place}
                selected={isSelected(place.placeId)}
                onToggle={() => togglePlace(place.placeId)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Sticky alt çubuk */}
      <div className="sticky bottom-20 mt-6">
        <div className="card p-3 flex items-center gap-3">
          <div className="flex-1 text-sm">
            <span className="font-semibold text-accent">{selectedPlaceIds.size}</span>
            <span className="text-[var(--color-text-muted)]"> {t('selected')}</span>
          </div>
          <Button
            onClick={handleGeneratePlan}
            loading={generating}
            icon={<Sparkles size={16} />}
            disabled={selectedPlaceIds.size === 0}
          >
            {t('generate')}
          </Button>
        </div>
      </div>
    </PageWrapper>
  )
}
