export type TransitVehicle = 'metro' | 'metrobus' | 'otobus' | 'tramvay' | 'vapur' | 'yuruyu' | 'taksi'

export interface TransitInfo {
  vehicle: TransitVehicle
  line?: string       // "M2", "T1", "F4" vb.
  stops?: number
  minutes: number
  walkMinutes?: number
  instructions: string[]
}

export interface ItineraryStep {
  id: string
  time: string          // "14:00"
  venueId: string
  venueName: string
  venueAddress: string
  venueLat?: number
  venueLng?: number
  duration: number      // dakika
  notes?: string
  isPartnerVenue: boolean
  transitToNext?: TransitInfo
  imageUrl?: string
}

export interface Plan {
  id: string
  userId: string | null
  title: string
  createdAt: string     // ISO date
  shareCode?: string
  isPublic: boolean
  formData: import('./form').PlanFormData
  selectedPlaceIds: string[]
  itinerary: ItineraryStep[]
  weatherSnapshot?: import('./weather').WeatherData
}
