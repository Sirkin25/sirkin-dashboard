import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemeProvider, useTheme } from '@/lib/theme/ThemeProvider'

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

// Test component that uses the theme hook
function TestComponent() {
  const { theme, setTheme, toggleTheme, isLoaded } = useTheme()
  
  return (
    <div>
      <div data-testid="theme">{theme}</div>
      <div data-testid="loaded">{isLoaded.toString()}</div>
      <button data-testid="set-dark" onClick={() => setTheme('dark')}>
        Set Dark
      </button>
      <button data-testid="set-light" onClick={() => setTheme('light')}>
        Set Light
      </button>
      <button data-testid="toggle" onClick={toggleTheme}>
        Toggle
      </button>
    </div>
  )
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset document classes
    document.documentElement.className = ''
    // Clear inline styles
    document.documentElement.removeAttribute('style')
  })

  it('should provide default theme when no stored theme exists', () => {
    mockLocalStorage.getItem.mockReturnValue(null)
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
  })

  it('should load stored theme from localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('dark')
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
  })

  it('should handle corrupted localStorage data gracefully', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-theme')
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    // Should fall back to default theme
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
  })

  it('should set theme and save to localStorage', async () => {
    mockLocalStorage.getItem.mockReturnValue(null)
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    fireEvent.click(screen.getByTestId('set-dark'))
    
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    
    // Wait for localStorage save (debounced)
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('dashboard-theme', 'dark')
    }, { timeout: 200 })
  })

  it('should toggle theme correctly', () => {
    mockLocalStorage.getItem.mockReturnValue('light')
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    
    fireEvent.click(screen.getByTestId('toggle'))
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    
    fireEvent.click(screen.getByTestId('toggle'))
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
  })

  it('should apply theme classes to document', async () => {
    mockLocalStorage.getItem.mockReturnValue(null)
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    // Wait for theme to be applied
    await waitFor(() => {
      expect(document.documentElement.classList.contains('light')).toBe(true)
    })
    
    fireEvent.click(screen.getByTestId('set-dark'))
    
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(document.documentElement.classList.contains('light')).toBe(false)
    })
  })

  it('should set CSS custom properties', async () => {
    mockLocalStorage.getItem.mockReturnValue(null)
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    await waitFor(() => {
      const style = document.documentElement.style
      expect(style.getPropertyValue('--background')).toBeTruthy()
      expect(style.getPropertyValue('--foreground')).toBeTruthy()
      expect(style.getPropertyValue('--hebrew-text-primary')).toBeTruthy()
    })
  })

  it('should indicate when theme is loaded', async () => {
    mockLocalStorage.getItem.mockReturnValue(null)
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('loaded')).toHaveTextContent('true')
    })
  })

  it('should use custom storage key', async () => {
    mockLocalStorage.getItem.mockReturnValue(null)
    
    render(
      <ThemeProvider storageKey="custom-theme">
        <TestComponent />
      </ThemeProvider>
    )
    
    fireEvent.click(screen.getByTestId('set-dark'))
    
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('custom-theme', 'dark')
    }, { timeout: 200 })
  })

  it('should handle localStorage errors gracefully', () => {
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage error')
    })
    
    // Should not throw and should use default theme
    expect(() => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )
    }).not.toThrow()
    
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
  })

  it('should throw error when useTheme is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useTheme must be used within a ThemeProvider')
    
    consoleSpy.mockRestore()
  })
})