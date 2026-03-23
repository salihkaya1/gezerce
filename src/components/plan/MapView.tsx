import { useEffect, useRef } from 'react'
import type { ItineraryStep } from '@/types'

// TODO: Connect Google Maps API here
// import { Loader } from '@googlemaps/js-api-loader'

interface Props {
  steps: ItineraryStep[]
}

export default function MapView({ steps }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // TODO: Connect Google Maps API here
    // const loader = new Loader({ apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, version: 'weekly' })
    // loader.load().then(async () => {
    //   const { Map } = await google.maps.importLibrary('maps') as google.maps.MapsLibrary
    //   const map = new Map(mapRef.current!, {
    //     center: { lat: steps[0]?.venueLat ?? 41.0082, lng: steps[0]?.venueLng ?? 28.9784 },
    //     zoom: 13,
    //     mapId: 'gezerce-map',
    //     disableDefaultUI: true,
    //     zoomControl: true,
    //   })
    //   // Marker ve rota ekle
    //   steps.forEach((step, i) => {
    //     if (!step.venueLat || !step.venueLng) return
    //     new google.maps.Marker({ position: { lat: step.venueLat, lng: step.venueLng }, map, label: String(i + 1) })
    //   })
    // })
  }, [steps])

  return (
    <div className="rounded-3xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-border)] relative">
      <div ref={mapRef} className="h-52 w-full" />

      {/* Placeholder — Google Maps bağlandığında kaldırılacak */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-navy/80 to-navy-light/60">
        <span className="text-3xl">🗺️</span>
        <p className="text-sm font-semibold text-white/80">Google Maps</p>
        <p className="text-xs text-white/50 text-center px-8">
          Harita görünümü için Google Maps API anahtarı gereklidir.
          <br />
          <code className="text-accent text-[10px]">VITE_GOOGLE_MAPS_API_KEY</code> ekleyin.
        </p>
      </div>
    </div>
  )
}
