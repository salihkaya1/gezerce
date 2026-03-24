// TODO: Connect Claude API here
// ÖNEMLİ: Bu servis üretimde doğrudan tarayıcıdan çağrılmamalıdır.
// Güvenlik için bir backend proxy (Firebase Cloud Function veya Vercel Edge Function) kullanın.
// Geliştirme ortamında VITE_CLAUDE_API_KEY kullanılır.

import type { PlaceDetails, Plan, PlanFormData, WeatherData } from '@/types'
import { buildPlanPrompt } from '@/utils/planPromptBuilder'

interface GeneratePlanParams {
  formData: PlanFormData
  selectedPlaces: PlaceDetails[]
  weather?: WeatherData
}

export async function generatePlan(params: GeneratePlanParams): Promise<Plan> {
  // TODO: Connect Claude API here
  // Üretimde bu endpoint kendi backend'inizin URL'i olacak:
  // const response = await fetch('/api/generate-plan', { method: 'POST', body: JSON.stringify(params) })

  const prompt = buildPlanPrompt(params)
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY

  if (!apiKey) {
    // Demo plan döndür (API anahtarı yokken)
    return buildDemoPlan(params)
  }

  // TODO: Connect Claude API here — aşağıdaki kod doğrudan API çağrısı yapar (sadece geliştirme)
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}))
    throw new Error(`Claude API hatası: ${response.status} — ${JSON.stringify(errBody)}`)
  }

  const data = await response.json()
  const text: string = data.content[0].text

  // JSON yanıtını parse et
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) ?? text.match(/(\{[\s\S]*\})/)
  if (!jsonMatch) throw new Error('Claude yanıtı parse edilemedi')

  const parsed = JSON.parse(jsonMatch[1])
  return {
    ...parsed,
    id: crypto.randomUUID(),
    userId: null,
    formData: params.formData,
    selectedPlaceIds: params.selectedPlaces.map((p) => p.placeId),
    weatherSnapshot: params.weather,
    isPublic: false,
    shareCode: crypto.randomUUID().slice(0, 8),
    createdAt: new Date().toISOString(),
  }
}

// Demo plan — Claude API bağlanana kadar kullanılır
function buildDemoPlan(params: GeneratePlanParams): Plan {
  const startHour = params.formData.advanced.startTime === 'sabah' ? 9
    : params.formData.advanced.startTime === 'ogle' ? 13 : 17

  return {
    id: crypto.randomUUID(),
    userId: null,
    title: `${params.formData.startLocation?.name ?? 'Istanbul'} Turu`,
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
        vehicle: 'tramvay',
        line: 'T1',
        stops: 3,
        minutes: 8,
        walkMinutes: 3,
        instructions: ['Tramvay durağına yürüyün', 'T1 tramvayına binin', 'Hedef durağında inin'],
      } : undefined,
    })),
  }
}
