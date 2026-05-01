/// <reference types="google.maps" />
import type { PlaceDetails } from '@/types'
import type { CompanionType } from '@/types/form'
import { loadPlacesLib, GOOGLE_MAPS_API_KEY } from '@/utils/googleMapsLoader'

const API_KEY = GOOGLE_MAPS_API_KEY

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
  'church', 'hindu_temple', 'synagogue',
])

// ── Profil bazlı İZİN VERİLEN türler ──
const ALLOWED_TYPES: Record<CompanionType, Set<string>> = {
  sevgili: new Set(['restaurant', 'cafe', 'art_gallery', 'museum', 'park', 'tourist_attraction']),
  aile:    new Set(['museum', 'park', 'tourist_attraction', 'restaurant', 'zoo', 'mosque', 'aquarium']),
  arkadas: new Set(['restaurant', 'cafe', 'night_club', 'tourist_attraction', 'bar', 'bowling_alley']),
  cocuklu: new Set(['park', 'zoo', 'amusement_park', 'museum', 'aquarium']),
  yalniz:  new Set(['museum', 'cafe', 'art_gallery', 'park', 'tourist_attraction', 'book_store', 'library']),
}

// ── Google'a gönderilecek arama türleri ──
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

function isPlaceAllowed(placeTypes: string[], allowedSet: Set<string>): boolean {
  if (placeTypes.some((t) => BLOCKED_TYPES.has(t))) return false
  return placeTypes.some((t) => allowedSet.has(t))
}

function calculateScore(place: PlaceDetails, visitedBefore: boolean): number {
  let score = 0
  const famous = isFamousSpot(place.name)
  const isTouristAttraction = place.types.includes('tourist_attraction')
  const reviewCount = place.userRatingsTotal ?? 0

  if (visitedBefore) {
    if (famous) score -= 50
    if (isTouristAttraction && reviewCount > 50000) score -= 30
    if (reviewCount >= 1000 && reviewCount <= 30000) score += 20
    if (reviewCount < 5000) score += 10
    score += place.rating * 5
  } else {
    if (famous) score += 30
    if (isTouristAttraction) score += 20
    if (reviewCount > 50000) score += 15
    else if (reviewCount > 10000) score += 10
    score += place.rating * 10
  }

  if (place.isOpen === true) score += 5
  if (place.photos.length > 0) score += 3
  return score
}

// ── Yeni Places API kütüphanesini yükler ──
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getPlacesLib(): Promise<any> {
  return loadPlacesLib()
}

// ── Yeni Place nesnesini PlaceDetails'e dönüştürür ──
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPlaceToDetails(place: any): PlaceDetails {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const photos = ((place.photos ?? []) as any[]).slice(0, 3).map((p: any) => ({
    url: typeof p.getURI === 'function' ? p.getURI({ maxWidth: 400, maxHeight: 300 }) : '',
    attribution: '',
  }))

  return {
    placeId: place.id ?? '',
    name: place.displayName ?? '',
    address: place.formattedAddress ?? '',
    lat: place.location?.lat() ?? 0,
    lng: place.location?.lng() ?? 0,
    rating: place.rating ?? 0,
    userRatingsTotal: place.userRatingCount ?? 0,
    isOpen: place.regularOpeningHours?.isOpen() ?? null,
    openingHours: place.regularOpeningHours?.weekdayDescriptions ?? [],
    photos,
    types: place.types ?? [],
    priceLevel: undefined,
  }
}

// ── Tek tür için yakın mekan araması — hata loglu ──
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function nearbySearchOne(Place: any, lat: number, lng: number, type: string, radius: number): Promise<any[]> {
  try {
    const { places } = await Place.searchNearby({
      fields: [
        'id', 'displayName', 'formattedAddress', 'location',
        'rating', 'userRatingCount', 'photos', 'types', 'regularOpeningHours',
      ],
      locationRestriction: { center: { lat, lng }, radius },
      includedTypes: [type],
      maxResultCount: 20,
      language: 'tr',
    })
    return places ?? []
  } catch (err: unknown) {
    // Hatayı logla — ama diğer türlerin aranmasını engelleme
    const msg = err instanceof Error ? err.message : String(err)
    console.warn(`[Places] searchNearby "${type}" başarısız:`, msg)
    return []
  }
}

/**
 * Verilen konum etrafındaki mekanları companion type'a göre getirir.
 * Yeni Places API (Place.searchNearby) kullanır.
 * Hata mesajı string olarak döner — çağıran taraf kullanıcıya gösterebilir.
 */
export async function fetchNearbyPlaces(
  lat: number,
  lng: number,
  companionType: CompanionType = 'yalniz',
  visitedBefore = false,
  radius = 5000
): Promise<PlaceDetails[]> {
  if (!API_KEY) {
    console.error('[Places] VITE_GOOGLE_MAPS_API_KEY tanımlı değil')
    return []
  }

  let placesLib: any
  try {
    placesLib = await getPlacesLib()
  } catch (err) {
    console.error('[Places] importLibrary("places") başarısız:', err)
    throw new Error('Google Places kütüphanesi yüklenemedi')
  }

  const Place = placesLib?.Place
  if (!Place || typeof Place.searchNearby !== 'function') {
    console.error('[Places] Place.searchNearby mevcut değil. Google Cloud Console\'da "Places API (New)" etkinleştirilmeli.')
    throw new Error('Places API (New) etkin değil — Google Cloud Console\'u kontrol edin')
  }

  const searchTypes = SEARCH_TYPES[companionType] ?? SEARCH_TYPES.yalniz
  const allowedSet = ALLOWED_TYPES[companionType] ?? ALLOWED_TYPES.yalniz

  // ── Tüm kategorilerde paralel arama ──
  const resultSets = await Promise.all(
    searchTypes.map((type) => nearbySearchOne(Place, lat, lng, type, radius))
  )

  const seenIds = new Set<string>()
  const allResults: PlaceDetails[] = []

  for (const results of resultSets) {
    for (const place of results) {
      const id = place.id
      if (!id || seenIds.has(id)) continue
      const types: string[] = place.types ?? []
      if (!isPlaceAllowed(types, allowedSet)) continue
      seenIds.add(id)
      allResults.push(mapPlaceToDetails(place))
    }
  }

  // ── Yeterli sonuç yoksa daha geniş yarıçapla tekrar ara ──
  if (allResults.length < 20) {
    const extraSets = await Promise.all(
      searchTypes.slice(0, 3).map((type) => nearbySearchOne(Place, lat, lng, type, radius * 2))
    )
    for (const results of extraSets) {
      for (const place of results) {
        const id = place.id
        if (!id || seenIds.has(id)) continue
        const types: string[] = place.types ?? []
        if (!isPlaceAllowed(types, allowedSet)) continue
        seenIds.add(id)
        allResults.push(mapPlaceToDetails(place))
      }
    }
  }

  console.log(`[Places] Toplam ${allResults.length} mekan bulundu`)
  allResults.sort((a, b) => calculateScore(b, visitedBefore) - calculateScore(a, visitedBefore))
  return allResults.slice(0, 36)
}

export interface PlaceSuggestion {
  placeId: string
  name: string
  address: string
}

/**
 * Konum giriş alanı için autocomplete önerileri.
 * Yeni AutocompleteSuggestion API kullanır.
 */
export async function fetchPlaceSuggestions(
  input: string,
  region = 'tr'
): Promise<PlaceSuggestion[]> {
  if (!API_KEY || !input.trim()) return []

  const placesLib = await getPlacesLib()
  const AutocompleteSuggestion = placesLib.AutocompleteSuggestion

  if (!AutocompleteSuggestion) return []

  try {
    const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
      input,
      includedRegionCodes: [region],
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (suggestions as any[])
      .filter((s: any) => s.placePrediction)
      .map((s: any) => ({
        placeId: s.placePrediction.placeId ?? '',
        name: s.placePrediction.mainText?.text ?? s.placePrediction.text?.text ?? '',
        address: s.placePrediction.text?.text ?? '',
      }))
  } catch {
    return []
  }
}

/**
 * Mekan arama — SelectionPage'deki arama kutusu için.
 * Yeni Place.searchByText API kullanır.
 */
export async function searchPlaces(
  query: string,
  lat: number,
  lng: number
): Promise<PlaceDetails[]> {
  if (!API_KEY || !query.trim()) return []

  const placesLib = await getPlacesLib()
  const Place = placesLib.Place

  try {
    const { places } = await Place.searchByText({
      textQuery: `${query} İstanbul`,
      fields: [
        'id', 'displayName', 'formattedAddress', 'location',
        'rating', 'userRatingCount', 'photos', 'types', 'regularOpeningHours',
      ],
      locationBias: { center: { lat, lng }, radius: 10000 },
      language: 'tr',
      maxResultCount: 8,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (places as any[])
      .filter((p: any) => !((p.types ?? []).some((t: string) => BLOCKED_TYPES.has(t))))
      .map(mapPlaceToDetails)
  } catch {
    return []
  }
}

/**
 * Place ID'den lat/lng çeker. Yeni Place.fetchFields kullanır.
 */
export async function fetchPlaceLatLng(
  placeId: string
): Promise<{ lat: number; lng: number } | null> {
  if (!API_KEY || !placeId) return null

  const placesLib = await getPlacesLib()
  const Place = placesLib.Place

  try {
    const place = new Place({ id: placeId })
    await place.fetchFields({ fields: ['location'] })
    if (place.location) {
      return { lat: place.location.lat(), lng: place.location.lng() }
    }
    return null
  } catch {
    return null
  }
}
