import type { PlaceDetails, Plan, PlanFormData, WeatherData, ItineraryStep } from '@/types'
import { buildPlanPrompt } from '@/utils/planPromptBuilder'

interface GeneratePlanParams {
  formData: PlanFormData
  selectedPlaces: PlaceDetails[]
  weather?: WeatherData
}

/**
 * Claude API'den gelen itinerary item'ını güvenli hale getirir.
 * Eksik alanlar default değerlerle doldurulur.
 */
function sanitizeStep(raw: Record<string, unknown>, index: number, selectedPlaces: PlaceDetails[]): ItineraryStep {
  const venueId = String(raw.venueId ?? raw.venue_id ?? `step-${index}`)

  // Seçilen mekanlardan lat/lng bul
  const matchedPlace = selectedPlaces.find(
    (p) => p.placeId === venueId || p.name === raw.venueName || p.name === raw.venue_name
  )

  const transit = raw.transitToNext ?? raw.transit_to_next
  let transitInfo: ItineraryStep['transitToNext'] = undefined

  if (transit && typeof transit === 'object' && transit !== null) {
    const t = transit as Record<string, unknown>
    transitInfo = {
      vehicle: String(t.vehicle ?? 'yuruyu') as ItineraryStep['transitToNext'] extends undefined ? never : NonNullable<ItineraryStep['transitToNext']>['vehicle'],
      line: t.line ? String(t.line) : undefined,
      stops: typeof t.stops === 'number' ? t.stops : undefined,
      minutes: typeof t.minutes === 'number' ? t.minutes : 10,
      walkMinutes: typeof t.walkMinutes === 'number' ? t.walkMinutes : (typeof t.walk_minutes === 'number' ? t.walk_minutes as number : undefined),
      instructions: Array.isArray(t.instructions) ? t.instructions.map(String) : [],
    }
  }

  return {
    id: String(raw.id ?? crypto.randomUUID()),
    time: String(raw.time ?? `${String(9 + index * 2).padStart(2, '0')}:00`),
    venueId,
    venueName: String(raw.venueName ?? raw.venue_name ?? `Durak ${index + 1}`),
    venueAddress: String(raw.venueAddress ?? raw.venue_address ?? matchedPlace?.address ?? ''),
    venueLat: matchedPlace?.lat ?? (typeof raw.venueLat === 'number' ? raw.venueLat : undefined),
    venueLng: matchedPlace?.lng ?? (typeof raw.venueLng === 'number' ? raw.venueLng : undefined),
    duration: typeof raw.duration === 'number' ? raw.duration : 60,
    notes: raw.notes ? String(raw.notes) : undefined,
    isPartnerVenue: raw.isPartnerVenue === true || raw.is_partner_venue === true,
    transitToNext: transitInfo,
  }
}

export async function generatePlan(params: GeneratePlanParams): Promise<Plan> {
  const prompt = buildPlanPrompt(params)
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY

  if (!apiKey) {
    return buildDemoPlan(params)
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}))
    throw new Error(`Claude API hatası: ${response.status} — ${JSON.stringify(errBody)}`)
  }

  const data = await response.json()
  const text: string = data.content?.[0]?.text ?? ''

  if (!text) {
    console.error('Claude boş yanıt döndü:', data)
    throw new Error('Claude boş yanıt döndürdü')
  }

  // JSON'u parse et — birden fazla format dene
  let parsed: Record<string, unknown>

  try {
    // Önce ```json ... ``` bloğunu dene
    const jsonBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/)
    if (jsonBlockMatch) {
      parsed = JSON.parse(jsonBlockMatch[1])
    } else {
      // Düz JSON dene
      const jsonObjMatch = text.match(/\{[\s\S]*\}/)
      if (jsonObjMatch) {
        parsed = JSON.parse(jsonObjMatch[0])
      } else {
        throw new Error('JSON bulunamadı')
      }
    }
  } catch (parseErr) {
    console.error('Claude yanıtı parse edilemedi:', text)
    throw new Error('Claude yanıtı parse edilemedi — ham yanıt console\'da')
  }

  // Itinerary'yi güvenli şekilde oluştur
  const rawItinerary = Array.isArray(parsed.itinerary) ? parsed.itinerary : []

  if (rawItinerary.length === 0) {
    console.warn('Claude boş itinerary döndü, demo plana fallback:', parsed)
    return buildDemoPlan(params)
  }

  const itinerary = rawItinerary.map((item: Record<string, unknown>, i: number) =>
    sanitizeStep(item, i, params.selectedPlaces)
  )

  return {
    id: crypto.randomUUID(),
    userId: null,
    title: String(parsed.title ?? `${params.formData.startLocation?.name ?? 'İstanbul'} Turu`),
    createdAt: new Date().toISOString(),
    shareCode: crypto.randomUUID().slice(0, 8),
    isPublic: false,
    formData: params.formData,
    selectedPlaceIds: params.selectedPlaces.map((p) => p.placeId),
    itinerary,
    weatherSnapshot: params.weather,
  }
}

// Demo plan — API başarısız olduğunda fallback
function buildDemoPlan(params: GeneratePlanParams): Plan {
  const startHour = params.formData.advanced.startTime === 'sabah' ? 9
    : params.formData.advanced.startTime === 'ogle' ? 13 : 17

  return {
    id: crypto.randomUUID(),
    userId: null,
    title: `${params.formData.startLocation?.name ?? 'İstanbul'} Turu`,
    createdAt: new Date().toISOString(),
    shareCode: crypto.randomUUID().slice(0, 8),
    isPublic: false,
    formData: params.formData,
    selectedPlaceIds: params.selectedPlaces.map((p) => p.placeId),
    weatherSnapshot: params.weather,
    itinerary: params.selectedPlaces.slice(0, params.formData.hours > 4 ? 5 : 3).map((place, i) => ({
      id: crypto.randomUUID(),
      time: `${String(startHour + i * 2).padStart(2, '0')}:00`,
      venueId: place.placeId,
      venueName: place.name,
      venueAddress: place.address,
      venueLat: place.lat,
      venueLng: place.lng,
      duration: 60,
      isPartnerVenue: false,
      notes: `${place.name} ziyareti. ${place.rating > 0 ? `⭐ ${place.rating}` : ''}`,
      transitToNext: i < params.selectedPlaces.length - 2 ? {
        vehicle: 'tramvay' as const,
        line: 'T1',
        stops: 3,
        minutes: 8,
        walkMinutes: 3,
        instructions: ['Tramvay durağına yürüyün', 'T1 tramvayına binin', 'Hedef durağında inin'],
      } : undefined,
    })),
  }
}
