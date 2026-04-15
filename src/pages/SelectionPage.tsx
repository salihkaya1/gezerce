import { useEffect, useState } from 'react'
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
import { fetchNearbyPlaces } from '@/services/googlePlaces'
import toast from 'react-hot-toast'
import { Sparkles } from 'lucide-react'

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
  const { places, setPlaces, selectedPlaceIds, togglePlace, isSelected } = useSelectionStore()
  const { getFormData } = usePlanFormStore()
  const { setPlan, setGenerating, setError, generating } = usePlanStore()
  const [loadingPlaces, setLoadingPlaces] = useState(true)

  useEffect(() => {
    const loadPlaces = async () => {
      setLoadingPlaces(true)
      try {
        const formData = getFormData()
        const lat = formData.startLocation?.lat || 41.0082
        const lng = formData.startLocation?.lng || 28.9784

        const results = await fetchNearbyPlaces(lat, lng, formData.companionType)

        if (results.length > 0) {
          setPlaces(results)
        } else {
          // API sonuç dönmezse demo veriye fallback
          setPlaces(DEMO_PLACES)
        }
      } catch (err) {
        console.error('Mekan yükleme hatası:', err)
        setPlaces(DEMO_PLACES)
      } finally {
        setLoadingPlaces(false)
      }
    }
    loadPlaces()
  }, [setPlaces, getFormData])

  const handleGeneratePlan = async () => {
    if (selectedPlaceIds.size === 0) {
      toast.error(t('noSelectionError'))
      return
    }

    setGenerating(true)
    try {
      const formData = getFormData()
      const selectedPlaces = places.filter((p) => isSelected(p.placeId))

      // Hava durumu al
      let weather = undefined
      try {
        const loc = formData.startLocation
        if (loc) {
          weather = await fetchCurrentWeather(loc.lat || 41.0082, loc.lng || 28.9784)
        }
      } catch {
        // Hava durumu alınamazsa devam et
      }

      // Plan üret
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
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">{t('title')}</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">{t('subtitle')}</p>
      </div>

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
