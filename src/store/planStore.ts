import { create } from 'zustand'
import type { Plan } from '@/types'

interface PlanState {
  currentPlan: Plan | null
  generating: boolean
  error: string | null
  setPlan: (plan: Plan) => void
  setGenerating: (v: boolean) => void
  setError: (err: string | null) => void
  clearPlan: () => void
}

export const usePlanStore = create<PlanState>((set) => ({
  currentPlan: null,
  generating: false,
  error: null,

  setPlan: (currentPlan) => set({ currentPlan, error: null }),
  setGenerating: (generating) => set({ generating }),
  setError: (error) => set({ error, generating: false }),
  clearPlan: () => set({ currentPlan: null, error: null }),
}))
