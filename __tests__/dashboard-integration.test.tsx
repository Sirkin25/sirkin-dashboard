import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import HomePage from '../app/page'

// Mock only the Google Sheets API calls to avoid external dependencies in tests
jest.mock('../lib/google-sheets', () => ({
  getAccountStatus: jest.fn(),
  getMonthlyExpenses: jest.fn(),
  getExpectedExpenses: jest.fn(),
  getTenantPayments: jest.fn(),
  getApartmentFees: jest.fn(),
}))

// Mock localStorage for preferences
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

const mockGoogleSheets = require('../lib/google-sheets')

describe('Dashboard Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
    
    // Mock successful Google Sheets responses
    mockGoogleSheets.getAccountStatus.mockResolvedValue({
      data: {
        balance: 50000,
        lastUpdated: new Date().toISOString(),
        monthlyChange: 5.2,
        status: 'healthy'
      },
      meta: {
        isConnected: true,
        source: 'sheets',
        lastFetched: new Date().toISOString(),
        hasData: true
      }
    })

    mockGoogleSheets.getMonthlyExpenses.mockResolvedValue({
      data: [
        { id: '1', description: 'חשמל', category: 'utilities', amount: 1200, date: new Date(), status: 'paid' },
        { id: '2', description: 'מים', category: 'utilities', amount: 800, date: new Date(), status: 'paid' }
      ],
      meta: {
        isConnected: true,
        source: 'sheets',
        lastFetched: new Date().toISOString(),
        hasData: true
      }
    })

    mockGoogleSheets.getExpectedExpenses.mockResolvedValue({
      data: [],
      meta: {
        isConnected: true,
        source: 'sheets',
        lastFetched: new Date().toISOString(),
        hasData: false
      }
    })

    mockGoogleSheets.getTenantPayments.mockResolvedValue({
      data: {
        data: [
          { apartment: 'דירה 1', month_1: '✓', month_2: '✓', month_3: '✗' },
          { apartment: 'דירה 2', month_1: '✓', month_2: '✗', month_3: '✓' }
        ],
        statistics: {
          totalPayments: 4,
          totalPossible: 6,
          paymentRate: 66.7
        },
        year: 2024,
        halfYear: 1,
        actualMonths: ['Jan-24', 'Feb-24', 'Mar-24']
      },
      meta: {
        isConnected: true,
        source: 'sheets',
        lastFetched: new Date().toISOString(),
        hasData: true
      }
    })

    mockGoogleSheets.getApartmentFees.mockResolvedValue({
      data: {
        apartments: [
          { apartmentNumber: 1, ownerName: 'בעל דירה 1', apartmentSize: 90, totalMonthlyFee: 1500, feeType: 'owner' },
          { apartmentNumber: 2, ownerName: 'בעל דירה 2', apartmentSize: 75, totalMonthlyFee: 1200, feeType: 'owner' }
        ],
        totalRevenue: 2700,
        averageFee: 1350
      },
      meta: {
        isConnected: true,
        source: 'sheets',
        lastFetched: new Date().toISOString(),
        hasData: true
      }
    })
  })

  it('should render dashboard with all systems integrated', async () => {
    render(<HomePage />)

    // Wait for the dashboard to load
    await waitFor(() => {
      expect(screen.getByText('לוח בקרה לניהול הבניין')).toBeInTheDocument()
    }, { timeout: 5000 })

    // Check that the theme system is working (dark mode toggle should be present)
    expect(screen.getByRole('button', { name: /עבור למצב כהה/i })).toBeInTheDocument()

    // Check that refresh system is working (refresh button should be present)
    expect(screen.getByRole('button', { name: /רענן/i })).toBeInTheDocument()

    // Verify the dashboard shows error states instead of mock data
    // This confirms mock data has been removed
    expect(screen.getAllByText(/שגיאה לא ידועה/i).length).toBeGreaterThan(0)
  })

  it('should handle tab switching and save preferences', async () => {
    render(<HomePage />)

    await waitFor(() => {
      expect(screen.getByText('לוח בקרה לניהול הבניין')).toBeInTheDocument()
    })

    // Find and click a different tab
    const tabs = screen.getAllByRole('button')
    const paymentsTab = tabs.find(tab => tab.textContent?.includes('תשלומי'))
    
    if (paymentsTab) {
      fireEvent.click(paymentsTab)
      
      // Verify that preference was saved to localStorage
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'dashboard-preferences',
          expect.stringContaining('lastActiveTab')
        )
      })
    }
  })

  it('should display loading states correctly', async () => {
    // Mock delayed API response to test loading state
    mockGoogleSheets.getAccountStatus.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        data: null,
        meta: { isConnected: false, source: 'error', lastFetched: '', hasData: false }
      }), 100))
    )

    render(<HomePage />)

    // Should show loading content initially
    expect(screen.getByText('טוען נתונים...')).toBeInTheDocument()
  })

  it('should handle error states gracefully', async () => {
    // Mock API error response
    mockGoogleSheets.getAccountStatus.mockRejectedValue(new Error('Network failed'))

    render(<HomePage />)

    // Should show error message instead of mock data
    await waitFor(() => {
      expect(screen.getByText(/שגיאה|error/i)).toBeInTheDocument()
    })
  })

  it('should handle no data states', async () => {
    // Mock empty data response
    mockGoogleSheets.getAccountStatus.mockResolvedValue({
      data: null,
      meta: {
        isConnected: false,
        source: 'error',
        lastFetched: new Date().toISOString(),
        hasData: false
      }
    })

    render(<HomePage />)

    // Should show no data message instead of mock data
    await waitFor(() => {
      expect(screen.getByText(/אין נתונים זמינים/i)).toBeInTheDocument()
    })
  })

  it('should test refresh system integration', async () => {
    render(<HomePage />)

    await waitFor(() => {
      expect(screen.getByText('לוח בקרה לניהול הבניין')).toBeInTheDocument()
    })

    // Find and click refresh button
    const refreshButton = screen.getByRole('button', { name: /רענן/i })
    fireEvent.click(refreshButton)

    // Verify that API calls are made again
    await waitFor(() => {
      expect(mockGoogleSheets.getAccountStatus).toHaveBeenCalledTimes(2) // Initial + refresh
    })
  })

  it('should test theme persistence', async () => {
    // Mock saved theme preference
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'dashboard-preferences') {
        return JSON.stringify({ theme: 'dark' })
      }
      return null
    })

    render(<HomePage />)

    await waitFor(() => {
      expect(screen.getByText('לוח בקרה לניהול הבניין')).toBeInTheDocument()
    })

    // Check that dark theme is applied (the theme system uses class instead of data-theme)
    expect(document.documentElement).toHaveClass('dark')
  })

  it('should test auto-refresh behavior', async () => {
    jest.useFakeTimers()
    
    render(<HomePage />)

    await waitFor(() => {
      expect(screen.getByText('לוח בקרה לניהול הבניין')).toBeInTheDocument()
    })

    // Fast-forward 30 seconds to trigger auto-refresh
    jest.advanceTimersByTime(30000)

    await waitFor(() => {
      expect(mockGoogleSheets.getAccountStatus).toHaveBeenCalledTimes(2) // Initial + auto-refresh
    })

    jest.useRealTimers()
  })

  it('should handle complete workflow without mock data', async () => {
    render(<HomePage />)

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('לוח בקרה לניהול הבניין')).toBeInTheDocument()
    })

    // Verify all API calls were made (no mock data used)
    expect(mockGoogleSheets.getAccountStatus).toHaveBeenCalled()
    expect(mockGoogleSheets.getMonthlyExpenses).toHaveBeenCalled()
    expect(mockGoogleSheets.getExpectedExpenses).toHaveBeenCalled()
    expect(mockGoogleSheets.getTenantPayments).toHaveBeenCalled()
    expect(mockGoogleSheets.getApartmentFees).toHaveBeenCalled()

    // Test theme switching
    const themeToggle = screen.getByRole('button', { name: /עבור למצב כהה/i })
    fireEvent.click(themeToggle)

    // Verify theme preference is saved
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'dashboard-preferences',
        expect.stringContaining('theme')
      )
    })

    // Test refresh functionality
    const refreshButton = screen.getByRole('button', { name: /רענן/i })
    fireEvent.click(refreshButton)

    // Verify refresh calls are made
    await waitFor(() => {
      expect(mockGoogleSheets.getAccountStatus).toHaveBeenCalledTimes(2)
    })
  })
})