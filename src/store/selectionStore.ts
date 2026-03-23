import { create } from 'zustand'
import type { PlaceDetails } from '@/types'

interface SelectionState {
  places: PlaceDetails[]
  selectedPlaceIds: Set<string>
  setPlaces: (places: PlaceDetails[]) => void
  togglePlace: (placeId: string) => void
  clearSelection: () => void
  isSelected: (placeId: string) => boolean
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  places: [],
  selectedPlaceIds: new Set(),

  setPlaces: (places) => set({ places }),

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
