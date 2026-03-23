import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface OfflineState {
  cachedPlanIds: string[]
  isOnline: boolean
  addCachedPlan: (planId: string) => void
  removeCachedPlan: (planId: string) => void
  setOnline: (v: boolean) => void
  isCached: (planId: string) => boolean
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      cachedPlanIds: [],
      isOnline: navigator.onLine,

      addCachedPlan: (planId) =>
        set((s) => ({
          cachedPlanIds: s.cachedPlanIds.includes(planId)
            ? s.cachedPlanIds
            : [...s.cachedPlanIds, planId],
        })),

      removeCachedPlan: (planId) =>
        set((s) => ({ cachedPlanIds: s.cachedPlanIds.filter((id) => id !== planId) })),

      setOnline: (isOnline) => set({ isOnline }),

      isCached: (planId) => get().cachedPlanIds.includes(planId),
    }),
    { name: 'gezerce-offline' }
  )
)
