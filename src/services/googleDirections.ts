// TODO: Connect Google Maps Directions API here
// Directions API'yi Google Cloud Console'dan etkinleştirin.
// VITE_GOOGLE_MAPS_API_KEY anahtarını kullanır.

import type { TransitInfo } from '@/types'

/**
 * İki koordinat arasında toplu taşıma yol tarifi getirir.
 * TODO: Connect Google Maps Directions API here
 */
export async function fetchTransitDirections(
  _originLat: number,
  _originLng: number,
  _destLat: number,
  _destLng: number
): Promise<TransitInfo | null> {
  // TODO: Connect Google Maps Directions API here
  // const loader = new Loader({ apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, version: 'weekly' })
  // await loader.load()
  // const service = new google.maps.DirectionsService()
  // const result = await service.route({
  //   origin: { lat: originLat, lng: originLng },
  //   destination: { lat: destLat, lng: destLng },
  //   travelMode: google.maps.TravelMode.TRANSIT,
  //   transitOptions: { modes: [google.maps.TransitMode.BUS, google.maps.TransitMode.SUBWAY, google.maps.TransitMode.TRAM] },
  // })
  // const leg = result.routes[0]?.legs[0]
  // if (!leg) return null
  // return mapDirectionsToTransitInfo(leg)
  return null
}
