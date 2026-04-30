/// <reference types="google.maps" />

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string

let _loadPromise: Promise<void> | null = null

/**
 * Google Maps JS Bootstrap'i bir kez yükler — @googlemaps/js-api-loader KULLANMAZ.
 * Loader singleton çakışması ("Loader must not be called again") ortadan kalkar.
 */
export function loadGoogleMaps(): Promise<void> {
  // Zaten yüklenmiş
  if (typeof google !== 'undefined' && google.maps?.importLibrary) {
    return (_loadPromise = _loadPromise ?? Promise.resolve())
  }

  if (_loadPromise) return _loadPromise

  _loadPromise = new Promise<void>((resolve, reject) => {
    const callbackName = '__gezerce_maps_init__'
    ;(window as Record<string, unknown>)[callbackName] = () => {
      resolve()
      delete (window as Record<string, unknown>)[callbackName]
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&loading=async&callback=${callbackName}`
    script.async = true
    script.onerror = () => {
      _loadPromise = null
      reject(new Error('Google Maps yüklenemedi'))
    }
    document.head.appendChild(script)
  })

  return _loadPromise
}

/**
 * Places kütüphanesini (yeni API) yükler ve döndürür.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function loadPlacesLib(): Promise<any> {
  await loadGoogleMaps()
  return google.maps.importLibrary('places')
}

export const GOOGLE_MAPS_API_KEY = API_KEY
