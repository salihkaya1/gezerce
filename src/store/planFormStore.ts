import { create } from 'zustand'
import type { PlanFormData, CompanionType, BudgetConfig, AdvancedSettings, Currency } from '@/types'
import { DEFAULT_FORM_DATA } from '@/types'

interface PlanFormState extends PlanFormData {
  setHours: (hours: number) => void
  setStartLocation: (loc: PlanFormData['startLocation']) => void
  setCompanionType: (type: CompanionType) => void
  setBudget: (budget: Partial<BudgetConfig>) => void
  setVisitedBefore: (v: boolean) => void
  setAdvanced: (settings: Partial<AdvancedSettings>) => void
  setCurrency: (currency: Currency) => void
  reset: () => void
  getFormData: () => PlanFormData
}

export const usePlanFormStore = create<PlanFormState>((set, get) => ({
  ...DEFAULT_FORM_DATA,

  setHours: (hours) => set({ hours: Math.min(12, Math.max(1, hours)) }),

  setStartLocation: (startLocation) => set({ startLocation }),

  setCompanionType: (companionType) => set({ companionType }),

  setBudget: (budget) =>
    set((s) => ({ budget: { ...s.budget, ...budget } })),

  setVisitedBefore: (visitedBefore) => set({ visitedBefore }),

  setAdvanced: (settings) =>
    set((s) => ({ advanced: { ...s.advanced, ...settings } })),

  setCurrency: (currency) =>
    set((s) => ({ budget: { ...s.budget, currency } })),

  reset: () => set({ ...DEFAULT_FORM_DATA }),

  getFormData: (): PlanFormData => {
    const { hours, startLocation, companionType, budget, visitedBefore, advanced } = get()
    return { hours, startLocation, companionType, budget, visitedBefore, advanced }
  },
}))
