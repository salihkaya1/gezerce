import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import type { ItineraryStep } from '@/types'

// TODO: Connect Google Maps API here — API anahtarı Vercel env'den okunur

interface Props {
  steps: ItineraryStep[]
}

export default function MapView({ steps }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [hasKey] = useState(!!import.meta.env.VITE_GOOGLE_MAPS_API_KEY)

  useEffect(() => {
    if (!hasKey || !mapRef.current || steps.length === 0) return

    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      version: 'weekly',
    })

    loader.load().then(async () => {
      const { Map } = await google.maps.importLibrary('maps') as google.maps.MapsLibrary

      const center = {
        lat: steps[0]?.venueLat ?? 41.0082,
        lng: steps[0]?.venueLng ?? 28.9784,
      }

      const map = new Map(mapRef.current!, {
        center,
        zoom: 13,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#1e1b2e' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#a78bfa' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#1e1b2e' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d2640' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f0d1a' }] },
        ],
      })

      // Legacy Marker API (importLibrary('marker') içinde Marker yok, AdvancedMarkerElement var)
      steps.forEach((step, i) => {
        if (!step.venueLat || !step.venueLng) return
        new google.maps.Marker({
          position: { lat: step.venueLat, lng: step.venueLng },
          map,
          label: { text: String(i + 1), color: '#fff', fontWeight: 'bold' },
          title: step.venueName,
        })
      })
    }).catch(console.error)
  }, [steps, hasKey])

  if (!hasKey) {
    return (
      <div className="rounded-3xl overflow-hidden border border-[var(--color-border)] relative h-52 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-navy/80 to-navy-light/60">
        <span className="text-3xl">🗺️</span>
        <p className="text-sm font-semibold text-white/80">Google Maps</p>
        <p className="text-xs text-white/50 text-center px-8">
          Harita görünümü için Google Maps API anahtarı gereklidir.
          <br />
          <code className="text-accent text-[10px]">VITE_GOOGLE_MAPS_API_KEY</code> ekleyin.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-3xl overflow-hidden border border-[var(--color-border)]">
      <div ref={mapRef} className="h-52 w-full" />
    </div>
  )
}
