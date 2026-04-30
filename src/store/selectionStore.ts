import { create } from 'zustand'
import type { PlaceDetails } from '@/types'

interface SelectionState {
  places: PlaceDetails[]
  selectedPlaceIds: Set<string>
  setPlaces: (places: PlaceDetails[]) => void
  addPlace: (place: PlaceDetails) => void
  togglePlace: (placeId: string) => void
  clearSelection: () => void
  isSelected: (placeId: string) => boolean
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  places: [],
  selectedPlaceIds: new Set(),

  setPlaces: (places) => set({ places }),

  addPlace: (place) =>
    set((s) => {
      // Zaten listedeyse ekleme
      if (s.places.some((p) => p.placeId === place.placeId)) return s
      // Ekle ve otomatik seç
      const next = new Set(s.selectedPlaceIds)
      next.add(place.placeId)
      return { places: [place, ...s.places], selectedPlaceIds: next }
    }),

  togglePlace: (placeId) =>
    set((s) => {
      const next = new Set(s.selectedPlaceIds)
      if (next.has(placeId)) next.delete(placeId)
      else next.add(placeId)
      return { selectedPlaceIds: next }
    }),

  clearSelection: () => set({ selectedPlaceIds: new Set() }),

  isSelected: (placeId) => get().selectedPlaceIds.has(placeId),
}))
