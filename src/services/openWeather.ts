// TODO: Connect OpenWeatherMap API here
// openweathermap.org üzerinden ücretsiz API anahtarı alın.
// VITE_OPENWEATHER_API_KEY olarak .env.local dosyasına ekleyin.

import type { WeatherData } from '@/types'

const BASE_URL = 'https://api.openweathermap.org/data/2.5'

/**
 * Verilen koordinatlar için anlık hava durumu bilgisi getirir.
 * TODO: Connect OpenWeatherMap API here
 */
export async function fetchCurrentWeather(lat: number, lng: number): Promise<WeatherData> {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY

  if (!apiKey) {
    // Demo hava verisi
    return {
      temp: 22,
      feelsLike: 21,
      description: 'açık',
      icon: '01d',
      humidity: 55,
      windSpeed: 12,
      isRainy: false,
      fetchedAt: new Date().toISOString(),
    }
  }

  // TODO: Connect OpenWeatherMap API here
  const response = await fetch(
    `${BASE_URL}/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric&lang=tr`
  )

  if (!response.ok) throw new Error(`Hava durumu alınamadı: ${response.status}`)

  const data = await response.json()
  const weatherId: number = data.weather[0].id
  const isRainy = weatherId >= 200 && weatherId < 700

  return {
    temp: data.main.temp,
    feelsLike: data.main.feels_like,
    description: data.weather[0].description,
    icon: data.weather[0].icon,
    humidity: data.main.humidity,
    windSpeed: Math.round(data.wind.speed * 3.6), // m/s → km/s
    isRainy,
    fetchedAt: new Date().toISOString(),
  }
}
