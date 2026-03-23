export interface WeatherData {
  temp: number          // Celsius
  feelsLike: number
  description: string   // "açık", "yağmurlu" vb.
  icon: string          // OpenWeatherMap icon code
  humidity: number
  windSpeed: number
  isRainy: boolean
  fetchedAt: string     // ISO date
}
