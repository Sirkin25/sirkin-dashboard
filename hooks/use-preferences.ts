"use client"

import { useState, useEffect, useCallback } from 'react'
import { UserPreferences, DEFAULT_PREFERENCES } from '@/lib/preferences/types'
import { preferenceManager } from '@/lib/preferences/PreferenceManager'

interface UsePreferencesResult {
  preferences: Partial<UserPreferences>
  isLoaded: boolean
  getPreference: <K extends keyof UserPreferences>(key: K) => UserPreferences[K]
  setPreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void
  resetPreference: <K extends keyof UserPreferences>(key: K) => void
  clearAllPreferences: () => void
  isCorrupted: boolean
  repair: () => void
}

export function usePreferences(): UsePreferencesResult {
  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({})
  const [isLoaded, setIsLoaded] = useState(false)
  const [isCorrupted, setIsCorrupted] = useState(false)

  // Load preferences on mount
  useEffect(() => {
    try {
      // Check if preferences are corrupted
      const corrupted = preferenceManager.isCorrupted()
      setIsCorrupted(corrupted)
      
      if (corrupted) {
        preferenceManager.repair()
      }
      
      const loadedPreferences = preferenceManager.getAll()
      setPreferences(loadedPreferences)
    } catch (error) {
      console.warn('Failed to load preferences:', error)
      setIsCorrupted(true)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  const getPreference = useCallback(<K extends keyof UserPreferences>(key: K): UserPreferences[K] => {
    const value = preferenceManager.getPreference(key)
    return value ?? DEFAULT_PREFERENCES[key]
  }, [])

  const setPreference = useCallback(<K extends keyof UserPreferences>(
    key: K, 
    value: UserPreferences[K]
  ): void => {
    try {
      preferenceManager.setPreference(key, value)
      setPreferences(prev => ({ ...prev, [key]: value }))
    } catch (error) {
      console.warn(`Failed to set preference ${key}:`, error)
    }
  }, [])

  const resetPreference = useCallback(<K extends keyof UserPreferences>(key: K): void => {
    try {
      preferenceManager.resetPreference(key)
      setPreferences(prev => ({ ...prev, [key]: DEFAULT_PREFERENCES[key] }))
    } catch (error) {
      console.warn(`Failed to reset preference ${key}:`, error)
    }
  }, [])

  const clearAllPreferences = useCallback((): void => {
    try {
      preferenceManager.clearPreferences()
      setPreferences({})
      setIsCorrupted(false)
    } catch (error) {
      console.warn('Failed to clear all preferences:', error)
    }
  }, [])

  const repair = useCallback((): void => {
    try {
      preferenceManager.repair()
      const loadedPreferences = preferenceManager.getAll()
      setPreferences(loadedPreferences)
      setIsCorrupted(false)
    } catch (error) {
      console.warn('Failed to repair preferences:', error)
    }
  }, [])

  return {
    preferences,
    isLoaded,
    getPreference,
    setPreference,
    resetPreference,
    clearAllPreferences,
    isCorrupted,
    repair
  }
}

// Specialized hooks for common preferences
export function useThemePreference() {
  const { getPreference, setPreference } = usePreferences()
  
  return {
    theme: getPreference('theme'),
    setTheme: (theme: 'light' | 'dark') => setPreference('theme', theme)
  }
}

export function useTabPreference() {
  const { getPreference, setPreference } = usePreferences()
  
  return {
    lastActiveTab: getPreference('lastActiveTab'),
    setLastActiveTab: (tab: string) => setPreference('lastActiveTab', tab)
  }
}

export function useAutoRefreshPreference() {
  const { getPreference, setPreference } = usePreferences()
  
  return {
    autoRefreshEnabled: getPreference('autoRefreshEnabled'),
    refreshInterval: getPreference('refreshInterval'),
    setAutoRefreshEnabled: (enabled: boolean) => setPreference('autoRefreshEnabled', enabled),
    setRefreshInterval: (interval: number) => setPreference('refreshInterval', interval)
  }
}