import { authService } from './auth.service'

export interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  source: 'gps' | 'wifi' | 'ip' | 'campus-default'
  city?: string
  region?: string
  country?: string
  timestamp: number
  verified_on_campus?: boolean
  nearest_campus?: string
  distance_meters?: number
}

type LocationListener = (location: LocationData | null, error?: string | null) => void

class LocationService {
  private currentLocation: LocationData | null = null
  private listeners: Set<LocationListener> = new Set()
  private isAcquiring: boolean = false
  private lastAcquiredAt: number = 0
  private CACHE_TTL_MS = 25000 // 25 seconds cache

  constructor() {
    // Attempt to restore cached location from sessionStorage
    try {
      const saved = sessionStorage.getItem('sas_user_location')
      if (saved) {
        this.currentLocation = JSON.parse(saved)
      }
    } catch {
      // ignore
    }
  }

  public subscribe(listener: LocationListener): () => void {
    this.listeners.add(listener)
    if (this.currentLocation) {
      listener(this.currentLocation, null)
    }
    return () => this.listeners.delete(listener)
  }

  private notify(location: LocationData | null, error?: string | null) {
    this.listeners.forEach(fn => fn(location, error))
  }

  /**
   * Acquire location using a robust 3-tier fallback strategy:
   * 1. Browser GPS (High Accuracy)
   * 2. Browser GPS (Standard Accuracy / Low power)
   * 3. IP Geolocation lookup
   */
  public async getCurrentLocation(forceRefresh = false): Promise<LocationData> {
    const now = Date.now()
    if (!forceRefresh && this.currentLocation && now - this.lastAcquiredAt < this.CACHE_TTL_MS) {
      return this.currentLocation
    }

    if (this.isAcquiring) {
      // Wait for existing request to finish
      return new Promise((resolve, reject) => {
        const check = setInterval(() => {
          if (!this.isAcquiring) {
            clearInterval(check)
            if (this.currentLocation) resolve(this.currentLocation)
            else reject(new Error('Location acquisition failed'))
          }
        }, 300)
      })
    }

    this.isAcquiring = true

    try {
      let result: LocationData | null = null

      // Tier 1: Try Browser High Accuracy (6s timeout)
      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        try {
          result = await this.tryBrowserGeolocation({ enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 })
        } catch {
          // Tier 2: Try Browser Standard Accuracy (5s timeout)
          try {
            result = await this.tryBrowserGeolocation({ enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 })
          } catch {
            // Browser GPS not available or denied, fall through to Tier 3
          }
        }
      }

      // Tier 3: IP-Based Geolocation Fallback
      if (!result) {
        result = await this.tryIpGeolocation()
      }

      this.currentLocation = result
      this.lastAcquiredAt = Date.now()

      try {
        sessionStorage.setItem('sas_user_location', JSON.stringify(result))
      } catch {
        // ignore
      }

      this.notify(result, null)
      return result
    } catch {
      const fallback: LocationData = {
        latitude: 16.80932,
        longitude: 81.54415,
        accuracy: 50.0,
        source: 'campus-default',
        city: 'Tadepalligudem',
        region: 'Andhra Pradesh',
        country: 'India',
        timestamp: Date.now()
      }
      this.currentLocation = fallback
      this.notify(fallback, null)
      return fallback
    } finally {
      this.isAcquiring = false
    }
  }

  private tryBrowserGeolocation(options: PositionOptions): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy || 10.0,
            source: options.enableHighAccuracy ? 'gps' : 'wifi',
            timestamp: pos.timestamp || Date.now()
          })
        },
        (err) => reject(err),
        options
      )
    })
  }

  private async tryIpGeolocation(): Promise<LocationData> {
    // Try multiple public IP geolocation providers
    try {
      const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) })
      if (res.ok) {
        const data = await res.json()
        if (data.latitude && data.longitude) {
          return {
            latitude: Number(data.latitude),
            longitude: Number(data.longitude),
            accuracy: 500.0,
            source: 'ip',
            city: data.city || 'Tadepalligudem',
            region: data.region || 'Andhra Pradesh',
            country: data.country_name || 'India',
            timestamp: Date.now()
          }
        }
      }
    } catch {
      // try secondary provider
    }

    try {
      const res2 = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(4000) })
      if (res2.ok) {
        const data = await res2.json()
        if (data.latitude && data.longitude) {
          return {
            latitude: Number(data.latitude),
            longitude: Number(data.longitude),
            accuracy: 800.0,
            source: 'ip',
            city: data.city || 'Tadepalligudem',
            region: data.region || 'Andhra Pradesh',
            country: data.country || 'India',
            timestamp: Date.now()
          }
        }
      }
    } catch {
      // ignore
    }

    // Default institutional campus anchor
    return {
      latitude: 16.80932,
      longitude: 81.54415,
      accuracy: 100.0,
      source: 'campus-default',
      city: 'Tadepalligudem',
      region: 'Andhra Pradesh',
      country: 'India',
      timestamp: Date.now()
    }
  }

  /**
   * Captures the current location and sends it to the backend to log telemetry.
   */
  public async syncWithBackend(customLocation?: LocationData): Promise<LocationData> {
    const loc = customLocation || (await this.getCurrentLocation())
    try {
      const token = localStorage.getItem('access_token')
      if (token && token !== 'undefined') {
        const res = await authService.recordLocation({
          latitude: loc.latitude,
          longitude: loc.longitude,
          accuracy: loc.accuracy,
          source: loc.source,
          city: loc.city,
          region: loc.region,
          country: loc.country
        })
        if (res?.verification) {
          loc.verified_on_campus = res.verification.verified
          loc.nearest_campus = res.verification.classroom_name
          loc.distance_meters = res.verification.distance_meters
          this.currentLocation = loc
          this.notify(loc, null)
        }
      }
    } catch (e) {
      console.warn('Backend location telemetry sync notice:', e)
    }
    return loc
  }

  public getCachedLocation(): LocationData | null {
    return this.currentLocation
  }
}

export const locationService = new LocationService()
