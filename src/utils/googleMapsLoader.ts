import { Loader } from '@googlemaps/js-api-loader'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string

let _loader: Loader | null = null

/**
 * Tüm bileşenler bu fonksiyonu kullanmalı.
 * Farklı options ile ayrı Loader oluşturmak "Loader must not be called again" hatasına yol açar.
 * Libraries burada belirtilmez — her modül kendi ihtiyacına göre importLibrary() çağırır.
 */
export function getGoogleMapsLoader(): Loader {
  if (!_loader) {
    _loader = new Loader({
      apiKey: API_KEY,
      version: 'weekly',
    })
  }
  return _loader
}

export const GOOGLE_MAPS_API_KEY = API_KEY
