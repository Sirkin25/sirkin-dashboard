export interface UserPreferences {
  theme: 'light' | 'dark'
  lastActiveTab: string
  autoRefreshEnabled: boolean
  refreshInterval: number
  language: 'he' | 'en'
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  lastActiveTab: 'overview',
  autoRefreshEnabled: true,
  refreshInterval: 30000, // 30 seconds
  language: 'he'
}

export interface PreferenceManager {
  getPreference<K extends keyof UserPreferences>(
    key: K
  ): UserPreferences[K] | null
  
  setPreference<K extends keyof UserPreferences>(
    key: K, 
    value: UserPreferences[K]
  ): void
  
  clearPreferences(): void
  
  getAll(): Partial<UserPreferences>
  
  validatePreference<K extends keyof UserPreferences>(
    key: K,
    value: unknown
  ): value is UserPreferences[K]
}