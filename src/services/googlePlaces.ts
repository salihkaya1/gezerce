// TODO: Connect Google Places API here
// Google Cloud Console'dan Places API'yi etkinleştirin.
// API anahtarını VITE_GOOGLE_MAPS_API_KEY olarak .env.local dosyasına ekleyin.

import type { PlaceDetails } from '@/types'

// TODO: Connect Google Places API here
// import { Loader } from '@googlemaps/js-api-loader'

export interface PlaceSuggestion {
  placeId: string
  name: string
  address: string
}

/**
 * Verilen konum etrafındaki turistik mekanları getirir.
 * TODO: Connect Google Places API here
 */
export async function fetchNearbyPlaces(
  _lat: number,
  _lng: number,
  _radius = 5000
): Promise<PlaceDetails[]> {
  // TODO: Connect Google Places API here
  // const loader = new Loader({ apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, version: 'weekly', libraries: ['places'] })
  // await loader.load()
  // const service = new google.maps.places.PlacesService(document.createElement('div'))
  // return new Promise((resolve, reject) => {
  //   service.nearbySearch({
  //     location: { lat, lng },
  //     radius,
  //     type: 'tourist_attraction',
  //   }, (results, status) => {
  //     if (status !== google.maps.places.PlacesServiceStatus.OK || !results) { reject(status); return }
  //     resolve(results.map(mapGooglePlaceToDetails))
  //   })
  // })
  return []
}

/**
 * Metin araması — konum girişi için autocomplete önerileri.
 * TODO: Connect Google Places API here
 */
export async function fetchPlaceSuggestions(
  _input: string,
  _region = 'tr'
): Promise<PlaceSuggestion[]> {
  // TODO: Connect Google Places API here
  // const loader = new Loader({ apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, version: 'weekly', libraries: ['places'] })
  // await loader.load()
  // const service = new google.maps.places.AutocompleteService()
  // const response = await service.getPlacePredictions({ input, componentRestrictions: { country: region } })
  // return response.predictions.map(p => ({ placeId: p.place_id, name: p.structured_formatting.main_text, address: p.description }))
  return []
}

/**
 * Belirli bir mekanın detaylarını getirir (fotoğraf, puan, saatler).
 * TODO: Connect Google Places API here
 */
export async function fetchPlaceDetails(_placeId: string): Promise<PlaceDetails | null> {
  // TODO: Connect Google Places API here
  // ...
  return null
}
