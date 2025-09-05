import { UserPreferences, DEFAULT_PREFERENCES, PreferenceManager } from './types'

export class LocalStoragePreferenceManager implements PreferenceManager {
  private readonly STORAGE_KEY = 'dashboard-preferences'
  private readonly STORAGE_VERSION = '1.0'
  private readonly VERSION_KEY = 'dashboard-preferences-version'

  constructor() {
    this.migrateIfNeeded()
  }

  private migrateIfNeeded(): void {
    try {
      const currentVersion = localStorage.getItem(this.VERSION_KEY)
      if (currentVersion !== this.STORAGE_VERSION) {
        // Future migration logic can go here
        localStorage.setItem(this.VERSION_KEY, this.STORAGE_VERSION)
      }
    } catch (error) {
      console.warn('Failed to check preference version:', error)
    }
  }

  getPreference<K extends keyof UserPreferences>(
    key: K
  ): UserPreferences[K] | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return null
      
      const preferences = JSON.parse(stored) as Partial<UserPreferences>
      const value = preferences[key]
      
      if (value === undefined) return null
      
      // Validate the preference value
      if (!this.validatePreference(key, value)) {
        console.warn(`Invalid preference value for ${key}:`, value)
        return null
      }
      
      return value
    } catch (error) {
      console.warn(`Failed to get preference ${key}:`, error)
      return null
    }
  }
  
  setPreference<K extends keyof UserPreferences>(
    key: K, 
    value: UserPreferences[K]
  ): void {
    try {
      // Validate before storing
      if (!this.validatePreference(key, value)) {
        console.warn(`Invalid preference value for ${key}:`, value)
        return
      }
      
      const existing = this.getAll()
      const updated = { ...existing, [key]: value }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated))
    } catch (error) {
      console.warn(`Failed to save preference ${key}:`, error)
    }
  }
  
  clearPreferences(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
      localStorage.removeItem(this.VERSION_KEY)
    } catch (error) {
      console.warn('Failed to clear preferences:', error)
    }
  }
  
  getAll(): Partial<UserPreferences> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return {}
      
      const preferences = JSON.parse(stored) as Partial<UserPreferences>
      
      // Validate all preferences and filter out invalid ones
      const validPreferences: Partial<UserPreferences> = {}
      
      Object.entries(preferences).forEach(([key, value]) => {
        if (this.validatePreference(key as keyof UserPreferences, value)) {
          validPreferences[key as keyof UserPreferences] = value as any
        }
      })
      
      return validPreferences
    } catch (error) {
      console.warn('Failed to get all preferences:', error)
      return {}
    }
  }
  
  validatePreference<K extends keyof UserPreferences>(
    key: K,
    value: unknown
  ): value is UserPreferences[K] {
    switch (key) {
      case 'theme':
        return value === 'light' || value === 'dark'
      
      case 'lastActiveTab':
        return typeof value === 'string' && value.length > 0
      
      case 'autoRefreshEnabled':
        return typeof value === 'boolean'
      
      case 'refreshInterval':
        return typeof value === 'number' && value >= 5000 && value <= 300000 // 5s to 5min
      
      case 'language':
        return value === 'he' || value === 'en'
      
      default:
        return false
    }
  }

  // Helper method to get preference with fallback to default
  getPreferenceWithDefault<K extends keyof UserPreferences>(
    key: K
  ): UserPreferences[K] {
    return this.getPreference(key) ?? DEFAULT_PREFERENCES[key]
  }

  // Helper method to reset a single preference to default
  resetPreference<K extends keyof UserPreferences>(key: K): void {
    this.setPreference(key, DEFAULT_PREFERENCES[key])
  }

  // Helper method to check if preferences are corrupted
  isCorrupted(): boolean {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return false
      
      JSON.parse(stored)
      return false
    } catch {
      return true
    }
  }

  // Helper method to repair corrupted preferences
  repair(): void {
    if (this.isCorrupted()) {
      console.warn('Preferences are corrupted, resetting to defaults')
      this.clearPreferences()
    }
  }
}

// Singleton instance
export const preferenceManager = new LocalStoragePreferenceManager()