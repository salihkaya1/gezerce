import type { PlanFormData, PlaceDetails, WeatherData } from '@/types'

interface BuildPromptParams {
  formData: PlanFormData
  selectedPlaces: PlaceDetails[]
  weather?: WeatherData
}

const COMPANION_LABELS: Record<string, string> = {
  sevgili: 'sevgiliyle birlikte romantik bir çift',
  aile: 'aile (yetişkinler)',
  arkadas: 'arkadaş grubu',
  cocuklu: 'küçük çocuklu aile',
  yalniz: 'yalnız gezgin',
}

const FOOD_LABELS: Record<string, string> = {
  none: 'fark etmez',
  helal: 'helal yiyecek',
  vegan: 'vegan',
  vejetaryen: 'vejetaryen',
}

const WALK_LABELS: Record<string, string> = {
  az: 'mümkün olduğunca az yürümek istiyor',
  orta: 'orta miktarda yürüyüş yapar',
  cok: 'çok yürümeye hazır',
}

export function buildPlanPrompt({ formData, selectedPlaces, weather }: BuildPromptParams): string {
  const { hours, startLocation, companionType, budget, visitedBefore, advanced } = formData

  const startHour = advanced.startTime === 'sabah' ? 9 : advanced.startTime === 'ogle' ? 13 : 17

  const weatherInfo = weather
    ? `Hava durumu: ${weather.temp}°C, ${weather.description}, ${weather.isRainy ? 'YAĞMURLU (kapalı mekan önerilerini öne çıkar)' : 'güzel hava'}.`
    : ''

  const budgetInfo = budget.noLimit
    ? 'Bütçe kısıtı yok.'
    : `Bütçe: ${budget.amount} ${budget.currency}`

  const placesList = selectedPlaces
    .map((p, i) => `${i + 1}. ${p.name} (${p.address}) — puan: ${p.rating}`)
    .join('\n')

  return `Sen Istanbul uzmanı bir gezi planlayıcısısın. Aşağıdaki bilgilere göre saat bazlı, kişiselleştirilmiş bir gezi planı oluştur.

## Kullanıcı Bilgileri
- Başlangıç noktası: ${startLocation?.name ?? 'Istanbul merkez'}
- Süre: ${hours} saat
- Başlangıç saati: ${startHour}:00
- Kimlerle: ${COMPANION_LABELS[companionType] ?? companionType}
- ${budgetInfo}
- Istanbul'a daha önce geldi mi: ${visitedBefore ? 'Evet (klasik yerler yerine az bilinen yerleri tercih et)' : 'Hayır (önemli yerleri mutlaka dahil et)'}
- Yemek tercihi: ${FOOD_LABELS[advanced.foodPreference]}
- Yürüyüş tercihi: ${WALK_LABELS[advanced.walkingPreference]}
- Müze Kartı var mı: ${advanced.muzeKarti ? 'Evet (müzelere ücretsiz girebilir)' : 'Hayır'}
- İstanbulkart var mı: ${advanced.istanbulKarti ? 'Evet (toplu taşıma ücreti daha düşük)' : 'Hayır (toplu taşıma ücretini full olarak hesapla)'}
${weatherInfo}

## Seçilen Mekanlar
${placesList}

## Çıktı Formatı
Aşağıdaki JSON formatında yanıt ver. Başka metin yazma, sadece JSON:

\`\`\`json
{
  "title": "Plan başlığı (örn: Tarihi Yarımada Turu)",
  "itinerary": [
    {
      "id": "unique-id",
      "time": "09:00",
      "venueId": "mekan-id (seçilen mekanlardan)",
      "venueName": "Mekan adı",
      "venueAddress": "Adres",
      "duration": 60,
      "notes": "Bu mekanda ne yapılacak, ne görülecek (2-3 cümle)",
      "isPartnerVenue": false,
      "transitToNext": {
        "vehicle": "tramvay|metro|metrobus|otobus|vapur|yuruyu|taksi",
        "line": "T1",
        "stops": 3,
        "minutes": 8,
        "walkMinutes": 3,
        "instructions": ["Talimat 1", "Talimat 2"]
      }
    }
  ]
}
\`\`\`

Kurallar:
- Toplam süre ${hours} saati geçmesin
- Mekanlar arasındaki toplu taşıma/yürüyüş sürelerini gerçekçi tut
- ${companionType === 'cocuklu' ? 'Çocuklu aile için uygun mekanları tercih et, uzun yürüyüşlerden kaç' : ''}
- ${weather?.isRainy ? 'Yağmur var, kapalı mekanlara öncelik ver' : ''}
- Mekanları coğrafi olarak mantıklı sırala (gereksiz gidip gelmeyi önle)
- Son adımda transitToNext alanı olmasın`
}
