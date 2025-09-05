"use client"

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { ThemeName, themes } from './theme-config'

interface ThemeContextValue {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
  toggleTheme: () => void
  isLoaded: boolean
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: ThemeName
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'dashboard-theme'
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeName>(defaultTheme)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey) as ThemeName
      if (stored && (stored === 'light' || stored === 'dark')) {
        setThemeState(stored)
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [storageKey])

  // Apply theme to document and save to localStorage
  useEffect(() => {
    if (!isLoaded) return

    const root = document.documentElement
    const themeConfig = themes[theme]

    // Use requestAnimationFrame to prevent layout thrashing
    requestAnimationFrame(() => {
      // Remove existing theme classes
      root.classList.remove('light', 'dark')
      root.classList.add(theme)

      // Batch CSS custom property updates
      const cssUpdates: [string, string][] = []
      
      // Collect all CSS updates
      Object.entries(themeConfig.colors).forEach(([key, value]) => {
        cssUpdates.push([`--${key}`, value])
      })

      Object.entries(themeConfig.hebrewTextContrast).forEach(([key, value]) => {
        cssUpdates.push([`--hebrew-text-${key}`, value])
      })

      // Apply all updates in a single batch
      cssUpdates.forEach(([property, value]) => {
        root.style.setProperty(property, value)
      })
    })

    // Save to localStorage (debounced)
    const saveTimeout = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, theme)
      } catch (error) {
        console.warn('Failed to save theme to localStorage:', error)
      }
    }, 100)

    return () => clearTimeout(saveTimeout)
  }, [theme, isLoaded, storageKey])

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme)
  }

  const toggleTheme = () => {
    setThemeState(current => current === 'light' ? 'dark' : 'light')
  }

  const value: ThemeContextValue = useMemo(() => ({
    theme,
    setTheme,
    toggleTheme,
    isLoaded
  }), [theme, setTheme, toggleTheme, isLoaded])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}