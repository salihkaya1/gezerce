export interface PlacePhoto {
  url: string
  attribution: string
}

export interface PlaceDetails {
  placeId: string
  name: string
  address: string
  lat: number
  lng: number
  rating: number
  userRatingsTotal: number
  isOpen: boolean | null
  openingHours: string[]
  photos: PlacePhoto[]
  types: string[]
  website?: string
  phoneNumber?: string
  priceLevel?: number // 0-4
}

export interface PartnerVenue {
  id: string
  name: string
  placeId: string
  address: string
  discountPercent: number
  category: string
  isActive: boolean
  logoUrl?: string
}

export interface EventItem {
  id: string
  title: string
  description: string
  venue: string
  date: string
  time: string
  ticketUrl?: string // Biletix link
  imageUrl?: string
  price?: string
  category: string
}
