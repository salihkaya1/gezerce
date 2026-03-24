import type { WeatherData } from '@/types'
import { Thermometer, Wind, Droplets, CloudRain } from 'lucide-react'

interface Props {
  weather: WeatherData
}

// OpenWeatherMap ikon kodu → emoji
function weatherEmoji(icon: string): string {
  if (icon.startsWith('01')) return '☀️'
  if (icon.startsWith('02') || icon.startsWith('03')) return '⛅'
  if (icon.startsWith('04')) return '☁️'
  if (icon.startsWith('09') || icon.startsWith('10')) return '🌧️'
  if (icon.startsWith('11')) return '⛈️'
  if (icon.startsWith('13')) return '❄️'
  if (icon.startsWith('50')) return '🌫️'
  return '🌤️'
}

export default function WeatherWidget({ weather }: Props) {
  return (
    <div className={`rounded-3xl p-4 border flex items-center gap-4 ${weather.isRainy ? 'border-blue-400/30 bg-blue-500/10' : 'border-amber-400/30 bg-amber-400/10'}`}>
      <span className="text-3xl">{weatherEmoji(weather.icon)}</span>
      <div className="flex-1">
        <p className="font-display text-lg font-bold text-[var(--color-text)]">
          {Math.round(weather.temp)}°C
          <span className="ml-2 text-sm font-medium text-[var(--color-text-muted)] capitalize">
            {weather.description}
          </span>
        </p>
        <div className="flex flex-wrap gap-3 mt-1">
          <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
            <Thermometer size={12} /> Hissedilen {Math.round(weather.feelsLike)}°C
          </span>
          <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
            <Droplets size={12} /> %{weather.humidity}
          </span>
          <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
            <Wind size={12} /> {weather.windSpeed} km/h
          </span>
        </div>
        {weather.isRainy && (
          <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-blue-500">
            <CloudRain size={12} />
            Kapalı mekan önerileri ön plana çıkarıldı
          </p>
        )}
      </div>
    </div>
  )
}
