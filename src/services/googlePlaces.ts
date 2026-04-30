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

// ── KARA LİSTE — Bu türlerden biri varsa mekan ASLA gösterilmez ──
const BLOCKED_TYPES = new Set([
  'lodging', 'hotel', 'motel', 'hostel',
  'gas_station', 'car_dealer', 'car_rental', 'car_repair', 'car_wash',
  'grocery_or_supermarket', 'supermarket', 'convenience_store',
  'bank', 'atm', 'finance',
  'pharmacy', 'drugstore', 'hospital', 'doctor', 'dentist', 'health',
  'insurance_agency', 'lawyer', 'accounting', 'real_estate_agency',
  'laundry', 'locksmith', 'plumber', 'electrician',
  'post_office', 'local_government_office', 'courthouse',
  'funeral_home', 'cemetery',
  'storage', 'moving_company',
  'parking', 'transit_station', 'bus_station', 'train_station', 'subway_station',
  'veterinary_care', 'pet_store',
  'school', 'university', 'primary_school', 'secondary_school',
  'church', 'hindu_temple', 'synagogue', // cami hariç (aile profili için)
])

// ── Profil bazlı İZİN VERİLEN türler ──
const ALLOWED_TYPES: Record<CompanionType, Set<string>> = {
  sevgili: new Set(['restaurant', 'cafe', 'art_gallery', 'museum', 'park', 'tourist_attraction']),
  aile:    new Set(['museum', 'park', 'tourist_attraction', 'restaurant', 'zoo', 'mosque', 'aquarium']),
  arkadas: new Set(['restaurant', 'cafe', 'night_club', 'tourist_attraction', 'bar', 'bowling_alley']),
  cocuklu: new Set(['park', 'zoo', 'amusement_park', 'museum', 'aquarium']),
  yalniz:  new Set(['museum', 'cafe', 'art_gallery', 'park', 'tourist_attraction', 'book_store', 'library']),
}

// ── Google'a gönderilecek arama türleri — profil başına TÜM türler ──
const SEARCH_TYPES: Record<CompanionType, string[]> = {
  sevgili: ['restaurant', 'cafe', 'art_gallery', 'museum', 'park', 'tourist_attraction'],
  aile:    ['museum', 'park', 'tourist_attraction', 'restaurant', 'zoo', 'mosque'],
  arkadas: ['restaurant', 'cafe', 'night_club', 'tourist_attraction', 'bar'],
  cocuklu: ['park', 'zoo', 'amusement_park', 'museum', 'aquarium'],
  yalniz:  ['museum', 'cafe', 'art_gallery', 'park', 'tourist_attraction', 'book_store'],
}

// ── Meşhur turistik yerler (visitedBefore = true ise alta at) ──
const FAMOUS_TOURIST_SPOTS = new Set([
  'ayasofya', 'hagia sophia', 'topkapı', 'topkapi', 'sultanahmet',
  'blue mosque', 'galata', 'kapalıçarşı', 'grand bazaar', 'kapali carsi',
  'dolmabahçe', 'dolmabahce', 'yerebatan', 'basilica cistern',
  'istiklal', 'taksim', 'kız kulesi', 'maiden tower',
  'süleymaniye', 'suleymaniye', 'eyüp sultan', 'eyup sultan',
  'rumeli hisarı', 'rumeli hisari', 'miniatürk', 'miniaturk',
])

function isFamousSpot(name: string): boolean {
  const lower = name.toLowerCase()
  for (const famous of FAMOUS_TOURIST_SPOTS) {
    if (lower.includes(famous)) return true
  }
  return false
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
 * Mekanın gösterilmesinin uygun olup olmadığını kontrol eder.
 * 1) Kara listedeki türlerden biri varsa → REDDET
 * 2) İzin verilen türlerden en az biri varsa → KABUL
 */
function isPlaceAllowed(placeTypes: string[], allowedSet: Set<string>): boolean {
  // Kara liste kontrolü — biri bile varsa reddet
  if (placeTypes.some((t) => BLOCKED_TYPES.has(t))) return false
  // Beyaz liste kontrolü — en az biri olmalı
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
 * Akıllı sıralama skoru hesaplar.
 *
 * visitedBefore = false (ilk kez): Turistik yerler + yüksek puan öne çıkar
 * visitedBefore = true (tekrar): Yerel/az bilinen yerler öne, meşhurlar alta
 */
function calculateScore(place: PlaceDetails, visitedBefore: boolean): number {
  let score = 0

  const famous = isFamousSpot(place.name)
  const isTouristAttraction = place.types.includes('tourist_attraction')
  const reviewCount = place.userRatingsTotal ?? 0

  if (visitedBefore) {
    // ── Tekrar gelen kullanıcı: yerel yerler öne ──
    // Meşhur yerler ceza alır
    if (famous) score -= 50
    if (isTouristAttraction && reviewCount > 50000) score -= 30

    // Orta popülerlik bonus (1000-30000 yorum arası = yerel ama kaliteli)
    if (reviewCount >= 1000 && reviewCount <= 30000) score += 20
    if (reviewCount < 5000) score += 10

    // Puan hala önemli ama daha az ağırlıklı
    score += place.rating * 5
  } else {
    // ── İlk kez gelen kullanıcı: turistik yerler öne ──
    if (famous) score += 30
    if (isTouristAttraction) score += 20

    // Popülerlik bonus
    if (reviewCount > 50000) score += 15
    else if (reviewCount > 10000) score += 10

    // Puan en önemli faktör
    score += place.rating * 10
  }

  // Açık mekan bonus
  if (place.isOpen === true) score += 5

  // Fotoğrafı olan mekan bonus
  if (place.photos.length > 0) score += 3

  return score
}

/**
 * Verilen konum etrafındaki mekanları companion type'a göre getirir.
 * - Tüm kategorilerde ayrı ayrı arama yapar
 * - Kara listeye göre filtreler
 * - visitedBefore'a göre akıllı sıralar
 * - En az 30 mekan döndürmeye çalışır
 */
export async function fetchNearbyPlaces(
  lat: number,
  lng: number,
  companionType: CompanionType = 'yalniz',
  visitedBefore = false,
  radius = 5000
): Promise<PlaceDetails[]> {
  if (!API_KEY) return []

  await getLoader().load()

  const service = new google.maps.places.PlacesService(document.createElement('div'))
  const searchTypes = SEARCH_TYPES[companionType] ?? SEARCH_TYPES.yalniz
  const allowedSet = ALLOWED_TYPES[companionType] ?? ALLOWED_TYPES.yalniz

  // ── Tüm kategorilerde paralel arama ──
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
      if (!isPlaceAllowed(types, allowedSet)) continue

      seenIds.add(id)
      allResults.push(mapToPlaceDetails(place))
    }
  }

  // ── Yeterli sonuç yoksa daha geniş yarıçapla tekrar ara ──
  if (allResults.length < 20) {
    const extraTypes = searchTypes.slice(0, 3)
    const extraSearches = extraTypes.map((type) =>
      nearbySearchPromise(service, {
        location: { lat, lng },
        radius: radius * 2, // 10km yarıçap
        type: type as string,
        language: 'tr',
      })
    )

    const extraResults = await Promise.all(extraSearches)
    for (const results of extraResults) {
      for (const place of results) {
        const id = place.place_id
        if (!id || seenIds.has(id)) continue

        const types = place.types ?? []
        if (!isPlaceAllowed(types, allowedSet)) continue

        seenIds.add(id)
        allResults.push(mapToPlaceDetails(place))
      }
    }
  }

  // ── Akıllı sıralama ──
  allResults.sort((a, b) => calculateScore(b, visitedBefore) - calculateScore(a, visitedBefore))

  // En fazla 36 mekan döndür (6 sütun × 6 satır veya 2×18)
  return allResults.slice(0, 36)
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
          // Kara listedeki mekanları filtrele
          const filtered = results.filter((p) => {
            const types = p.types ?? []
            return !types.some((t) => BLOCKED_TYPES.has(t))
          })
          resolve(filtered.slice(0, 8).map(mapToPlaceDetails))
        } else {
          resolve([])
        }
      }
    )
  })
}

/**
 * Place ID'den lat/lng çeker
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
