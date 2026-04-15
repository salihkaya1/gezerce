/// <reference types="google.maps" />
import { Loader } from '@googlemaps/js-api-loader'
import type { PlaceDetails } from '@/types'
import type { CompanionType } from '@/types/form'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string

let loaderInstance: Loader | null = null

function getLoader(): Loader {
  if (!loaderInstance) {
    loaderInstance = new Loader({
      apiKey: API_KEY,
      version: 'weekly',
      libraries: ['places'],
    })
  }
  return loaderInstance
}

// Kullanıcı profiline göre aranacak mekan türleri
const COMPANION_TYPES: Record<CompanionType, string[]> = {
  sevgili: ['restaurant', 'cafe', 'park', 'art_gallery', 'tourist_attraction'],
  aile: ['museum', 'park', 'tourist_attraction', 'mosque', 'shopping_mall'],
  arkadas: ['restaurant', 'cafe', 'tourist_attraction', 'shopping_mall', 'night_club'],
  cocuklu: ['park', 'aquarium', 'zoo', 'amusement_park', 'museum'],
  yalniz: ['museum', 'cafe', 'tourist_attraction', 'art_gallery', 'book_store'],
}

function mapToPlaceDetails(place: google.maps.places.PlaceResult): PlaceDetails {
  const photos = (place.photos ?? []).slice(0, 3).map((p) => ({
    url: p.getUrl({ maxWidth: 400, maxHeight: 300 }),
    attribution: p.html_attributions?.[0] ?? '',
  }))

  return {
    placeId: place.place_id ?? '',
    name: place.name ?? '',
    address: place.vicinity ?? place.formatted_address ?? '',
    lat: place.geometry?.location?.lat() ?? 0,
    lng: place.geometry?.location?.lng() ?? 0,
    rating: place.rating ?? 0,
    userRatingsTotal: place.user_ratings_total ?? 0,
    isOpen: place.opening_hours?.isOpen?.() ?? null,
    openingHours: place.opening_hours?.weekday_text ?? [],
    photos,
    types: place.types ?? [],
    priceLevel: place.price_level,
  }
}

function nearbySearchPromise(
  service: google.maps.places.PlacesService,
  request: google.maps.places.PlaceSearchRequest
): Promise<google.maps.places.PlaceResult[]> {
  return new Promise((resolve) => {
    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        resolve(results)
      } else {
        resolve([])
      }
    })
  })
}

/**
 * Verilen konum etrafındaki mekanları companion type'a göre getirir.
 */
export async function fetchNearbyPlaces(
  lat: number,
  lng: number,
  companionType: CompanionType = 'yalniz',
  radius = 5000
): Promise<PlaceDetails[]> {
  if (!API_KEY) return []

  await getLoader().load()

  const service = new google.maps.places.PlacesService(document.createElement('div'))
  const types = COMPANION_TYPES[companionType] ?? COMPANION_TYPES.yalniz

  // İlk 3 türü paralel ara
  const searches = types.slice(0, 3).map((type) =>
    nearbySearchPromise(service, {
      location: { lat, lng },
      radius,
      type: type as string,
      language: 'tr',
    })
  )

  const resultSets = await Promise.all(searches)
  const seenIds = new Set<string>()
  const allResults: PlaceDetails[] = []

  for (const results of resultSets) {
    for (const place of results) {
      const id = place.place_id
      if (!id || seenIds.has(id)) continue
      seenIds.add(id)
      allResults.push(mapToPlaceDetails(place))
    }
  }

  // Puana göre sırala, en iyi 12 mekan
  allResults.sort((a, b) => b.rating - a.rating)
  return allResults.slice(0, 12)
}

export interface PlaceSuggestion {
  placeId: string
  name: string
  address: string
}

/**
 * Konum giriş alanı için autocomplete önerileri
 */
export async function fetchPlaceSuggestions(
  input: string,
  region = 'tr'
): Promise<PlaceSuggestion[]> {
  if (!API_KEY || !input.trim()) return []

  await getLoader().load()

  const service = new google.maps.places.AutocompleteService()
  const response = await service.getPlacePredictions({
    input,
    componentRestrictions: { country: region },
    types: ['geocode', 'establishment'],
  })

  return response.predictions.map((p) => ({
    placeId: p.place_id,
    name: p.structured_formatting.main_text,
    address: p.description,
  }))
}

/**
 * Place ID'den lat/lng çeker (konum input seçimi için)
 */
export async function fetchPlaceLatLng(
  placeId: string
): Promise<{ lat: number; lng: number } | null> {
  if (!API_KEY || !placeId) return null

  await getLoader().load()

  const service = new google.maps.places.PlacesService(document.createElement('div'))

  return new Promise((resolve) => {
    service.getDetails(
      { placeId, fields: ['geometry'] },
      (result, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && result?.geometry?.location) {
          resolve({ lat: result.geometry.location.lat(), lng: result.geometry.location.lng() })
        } else {
          resolve(null)
        }
      }
    )
  })
}
