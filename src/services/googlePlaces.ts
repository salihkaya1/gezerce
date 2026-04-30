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

// ── Kullanıcı profiline göre İZİN VERİLEN kategoriler ──
// Sadece bu türlere ait mekanlar gösterilir; geri kalanı filtrelenir.
const ALLOWED_TYPES: Record<CompanionType, Set<string>> = {
  sevgili: new Set(['restaurant', 'cafe', 'art_gallery', 'museum', 'park', 'tourist_attraction']),
  aile:    new Set(['museum', 'park', 'tourist_attraction', 'restaurant', 'zoo']),
  arkadas: new Set(['restaurant', 'cafe', 'night_club', 'tourist_attraction']),
  cocuklu: new Set(['park', 'zoo', 'amusement_park', 'museum']),
  yalniz:  new Set(['museum', 'cafe', 'art_gallery', 'park', 'tourist_attraction']),
}

// Google'a gönderilecek arama türleri (her profil için 3 tane)
const SEARCH_TYPES: Record<CompanionType, string[]> = {
  sevgili: ['restaurant', 'cafe', 'tourist_attraction'],
  aile:    ['museum', 'tourist_attraction', 'zoo'],
  arkadas: ['restaurant', 'cafe', 'tourist_attraction'],
  cocuklu: ['park', 'zoo', 'museum'],
  yalniz:  ['museum', 'cafe', 'tourist_attraction'],
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

/**
 * Bir mekanın izin verilen kategoride olup olmadığını kontrol eder.
 * Mekanın types[] dizisinden en az biri allowedSet içinde olmalı.
 */
function isAllowedType(placeTypes: string[], allowedSet: Set<string>): boolean {
  return placeTypes.some((t) => allowedSet.has(t))
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
 * Sadece izin verilen kategorilerdeki mekanlar döner.
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
  const searchTypes = SEARCH_TYPES[companionType] ?? SEARCH_TYPES.yalniz
  const allowedSet = ALLOWED_TYPES[companionType] ?? ALLOWED_TYPES.yalniz

  // Paralel arama
  const searches = searchTypes.map((type) =>
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

      const types = place.types ?? []
      // ── Kesin filtreleme: izin verilen kategoride değilse ATLA ──
      if (!isAllowedType(types, allowedSet)) continue

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
 * Mekan arama — SelectionPage'deki arama kutusu için.
 * Text search ile mekan bulur ve detaylarını döner.
 */
export async function searchPlaces(
  query: string,
  lat: number,
  lng: number
): Promise<PlaceDetails[]> {
  if (!API_KEY || !query.trim()) return []

  await getLoader().load()

  const service = new google.maps.places.PlacesService(document.createElement('div'))

  return new Promise((resolve) => {
    service.textSearch(
      {
        query: `${query} İstanbul`,
        location: { lat, lng },
        radius: 10000,
        language: 'tr',
      },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          resolve(results.slice(0, 5).map(mapToPlaceDetails))
        } else {
          resolve([])
        }
      }
    )
  })
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
