export type CompanionType = 'sevgili' | 'aile' | 'arkadas' | 'cocuklu' | 'yalniz'

export type FoodPreference = 'none' | 'helal' | 'vegan' | 'vejetaryen'

export type WalkingPreference = 'az' | 'orta' | 'cok'

export type StartTime = 'sabah' | 'ogle' | 'aksam'

export type Currency = 'TRY' | 'EUR' | 'USD'

export interface BudgetConfig {
  noLimit: boolean
  amount: number
  currency: Currency
}

export interface AdvancedSettings {
  muzeKarti: boolean
  istanbulKarti: boolean
  foodPreference: FoodPreference
  walkingPreference: WalkingPreference
  startTime: StartTime
}

export interface PlanFormData {
  hours: number
  startLocation: {
    placeId: string
    name: string
    lat: number
    lng: number
  } | null
  companionType: CompanionType
  budget: BudgetConfig
  visitedBefore: boolean
  advanced: AdvancedSettings
}

export const DEFAULT_FORM_DATA: PlanFormData = {
  hours: 4,
  startLocation: null,
  companionType: 'yalniz',
  budget: { noLimit: true, amount: 0, currency: 'TRY' },
  visitedBefore: false,
  advanced: {
    muzeKarti: false,
    istanbulKarti: false,
    foodPreference: 'none',
    walkingPreference: 'orta',
    startTime: 'sabah',
  },
}
