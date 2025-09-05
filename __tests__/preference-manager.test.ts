import { LocalStoragePreferenceManager } from '@/lib/preferences/PreferenceManager'
import { UserPreferences, DEFAULT_PREFERENCES } from '@/lib/preferences/types'

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('LocalStoragePreferenceManager', () => {
  let preferenceManager: LocalStoragePreferenceManager

  beforeEach(() => {
    preferenceManager = new LocalStoragePreferenceManager()
    jest.clearAllMocks()
  })

  describe('getPreference', () => {
    it('should return null when no preference is stored', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const result = preferenceManager.getPreference('theme')
      
      expect(result).toBeNull()
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('dashboard-preferences')
    })

    it('should return stored preference value', () => {
      const storedPrefs = { theme: 'dark', lastActiveTab: 'payments' }
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedPrefs))
      
      const theme = preferenceManager.getPreference('theme')
      const tab = preferenceManager.getPreference('lastActiveTab')
      
      expect(theme).toBe('dark')
      expect(tab).toBe('payments')
    })

    it('should return null for invalid preference values', () => {
      const storedPrefs = { theme: 'invalid-theme' }
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedPrefs))
      
      const result = preferenceManager.getPreference('theme')
      
      expect(result).toBeNull()
    })

    it('should handle corrupted JSON gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json')
      
      const result = preferenceManager.getPreference('theme')
      
      expect(result).toBeNull()
    })

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })
      
      const result = preferenceManager.getPreference('theme')
      
      expect(result).toBeNull()
    })
  })

  describe('setPreference', () => {
    it('should save valid preference to localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('{}')
      
      preferenceManager.setPreference('theme', 'dark')
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'dashboard-preferences',
        JSON.stringify({ theme: 'dark' })
      )
    })

    it('should merge with existing preferences', () => {
      const existingPrefs = { lastActiveTab: 'overview' }
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingPrefs))
      
      preferenceManager.setPreference('theme', 'dark')
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'dashboard-preferences',
        JSON.stringify({ lastActiveTab: 'overview', theme: 'dark' })
      )
    })

    it('should not save invalid preference values', () => {
      preferenceManager.setPreference('theme', 'invalid-theme' as any)
      
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
    })

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })
      
      expect(() => {
        preferenceManager.setPreference('theme', 'dark')
      }).not.toThrow()
    })
  })

  describe('validatePreference', () => {
    it('should validate theme preferences correctly', () => {
      expect(preferenceManager.validatePreference('theme', 'light')).toBe(true)
      expect(preferenceManager.validatePreference('theme', 'dark')).toBe(true)
      expect(preferenceManager.validatePreference('theme', 'invalid')).toBe(false)
    })

    it('should validate lastActiveTab preferences correctly', () => {
      expect(preferenceManager.validatePreference('lastActiveTab', 'overview')).toBe(true)
      expect(preferenceManager.validatePreference('lastActiveTab', '')).toBe(false)
      expect(preferenceManager.validatePreference('lastActiveTab', 123)).toBe(false)
    })

    it('should validate autoRefreshEnabled preferences correctly', () => {
      expect(preferenceManager.validatePreference('autoRefreshEnabled', true)).toBe(true)
      expect(preferenceManager.validatePreference('autoRefreshEnabled', false)).toBe(true)
      expect(preferenceManager.validatePreference('autoRefreshEnabled', 'true')).toBe(false)
    })

    it('should validate refreshInterval preferences correctly', () => {
      expect(preferenceManager.validatePreference('refreshInterval', 30000)).toBe(true)
      expect(preferenceManager.validatePreference('refreshInterval', 5000)).toBe(true)
      expect(preferenceManager.validatePreference('refreshInterval', 300000)).toBe(true)
      expect(preferenceManager.validatePreference('refreshInterval', 1000)).toBe(false) // Too low
      expect(preferenceManager.validatePreference('refreshInterval', 400000)).toBe(false) // Too high
    })

    it('should validate language preferences correctly', () => {
      expect(preferenceManager.validatePreference('language', 'he')).toBe(true)
      expect(preferenceManager.validatePreference('language', 'en')).toBe(true)
      expect(preferenceManager.validatePreference('language', 'fr')).toBe(false)
    })
  })

  describe('getAll', () => {
    it('should return all valid preferences', () => {
      const storedPrefs = {
        theme: 'dark',
        lastActiveTab: 'payments',
        autoRefreshEnabled: true,
        invalidPref: 'invalid'
      }
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedPrefs))
      
      const result = preferenceManager.getAll()
      
      expect(result).toEqual({
        theme: 'dark',
        lastActiveTab: 'payments',
        autoRefreshEnabled: true
      })
      expect(result).not.toHaveProperty('invalidPref')
    })

    it('should return empty object when no preferences exist', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const result = preferenceManager.getAll()
      
      expect(result).toEqual({})
    })
  })

  describe('clearPreferences', () => {
    it('should remove preferences from localStorage', () => {
      preferenceManager.clearPreferences()
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('dashboard-preferences')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('dashboard-preferences-version')
    })

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })
      
      expect(() => {
        preferenceManager.clearPreferences()
      }).not.toThrow()
    })
  })

  describe('getPreferenceWithDefault', () => {
    it('should return stored preference when available', () => {
      const storedPrefs = { theme: 'dark' }
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedPrefs))
      
      const result = preferenceManager.getPreferenceWithDefault('theme')
      
      expect(result).toBe('dark')
    })

    it('should return default when no preference is stored', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const result = preferenceManager.getPreferenceWithDefault('theme')
      
      expect(result).toBe(DEFAULT_PREFERENCES.theme)
    })
  })

  describe('resetPreference', () => {
    it('should reset preference to default value', () => {
      mockLocalStorage.getItem.mockReturnValue('{}')
      
      preferenceManager.resetPreference('theme')
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'dashboard-preferences',
        JSON.stringify({ theme: DEFAULT_PREFERENCES.theme })
      )
    })
  })

  describe('isCorrupted', () => {
    it('should return false for valid JSON', () => {
      mockLocalStorage.getItem.mockReturnValue('{"theme": "dark"}')
      
      const result = preferenceManager.isCorrupted()
      
      expect(result).toBe(false)
    })

    it('should return true for invalid JSON', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json')
      
      const result = preferenceManager.isCorrupted()
      
      expect(result).toBe(true)
    })

    it('should return false when no preferences exist', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const result = preferenceManager.isCorrupted()
      
      expect(result).toBe(false)
    })
  })

  describe('repair', () => {
    it('should clear preferences when corrupted', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json')
      
      preferenceManager.repair()
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('dashboard-preferences')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('dashboard-preferences-version')
    })

    it('should not clear preferences when not corrupted', () => {
      mockLocalStorage.getItem.mockReturnValue('{"theme": "dark"}')
      
      preferenceManager.repair()
      
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled()
    })
  })
})